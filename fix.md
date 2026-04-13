# MedSoft Codebase Fix Plan

This document is a precise, line-by-line implementation guide for fixing identified bugs and architectural issues in the MedSoft Electron app. Every fix references exact file paths and line numbers. Read each section fully before touching any code.

---

## Architecture Overview (Required Reading)

- **Runtime**: Electron desktop app. SQLite is the primary database (via `better-sqlite3` in the main process).
- **Backend**: oRPC procedures (`src/electron/orpc/`) called via IPC from the renderer. There is no remote server — everything is local.
- **Network sync**: `ElectronServerManager` in `src/electron/serverManager.ts` runs a Socket.IO server on the LAN so secondary clinic machines can connect.
- **Doctor UI**: `src/ui/` — TanStack Router + TanStack Query + Zustand (`consultationStore`) + MUI.
- **Active consultation state**: `src/ui/store/consultationStore.ts` is the single source of truth for the active consultation in the doctor UI. Every component reads from and writes to this store.
- **`src/ui2/` is dead code** — ignore it entirely, do not touch it.

---

## Fix 1 — Auto-Save to Prevent Data Loss

### Problem

**File**: `src/ui/components/doctor/dashboard/useDoctorDashboardLogic.ts`

There is no auto-save. The doctor must manually press "Save" (the `saveMutation` call on line 300). If Electron crashes, the window is closed, or power is cut during a consultation, the entire exam is permanently lost. The store is reset on unmount (`useEffect` at line 51–53 calls `reset()`).

There is no `isDirty` flag anywhere. There is no periodic save. This is a data-loss bug, not a UX preference.

### Fix

**Step 1**: Add `isDirty` tracking to the Zustand store.

In `src/ui/store/consultationStore.ts`, add `isDirty: boolean` to the `ConsultationState` interface and initialize it to `false`. Set it to `true` inside every mutating action (`setLeftEye`, `setRightEye`, `updateLeftEyeField`, `updateRightEyeField`, `setClinicalExam`, `updateClinicalExamField`, `addPrescription`, `updatePrescription`, `removePrescription`, `setPrescriptions`, `setDocumentOverride`, `updateDocumentOverride`). Set it back to `false` inside `loadConsultation` and `reset`.

Example for `updateLeftEyeField` (apply same pattern to all mutating actions):
```ts
updateLeftEyeField: (field, value) => {
    const prevState = get();
    set((state) => {
        const updates: Partial<EyeData> = { [field]: value };
        if (field === 'objSph') updates.sph = value;
        if (field === 'objCyl') updates.cyl = value;
        if (field === 'objAxis') updates.axis = value;
        if (field === 'objAdd') updates.add = value;
        return {
            leftEye: { ...state.leftEye, ...updates },
            isDirty: true,   // <-- ADD THIS
            ...(field === 'glassType' ? { rightEye: { ...state.rightEye, [field]: value } } : {})
        };
    });
    syncDocuments(set, get, prevState);
},
```

**Step 2**: Add a debounced auto-save `useEffect` to `useDoctorDashboardLogic.ts`.

Add this block after the `saveMutation` definition (after line 354), before the `handleSwitchConsultation` helper:

```ts
// Auto-save: debounced 20 seconds after the last change, only for today's consultation
useEffect(() => {
    // Only auto-save if we have a consultation, it's today's, and there are unsaved changes
    if (!currentConsultationId || !isActiveConsultationToday) return;

    const isDirty = useConsultationStore.getState().isDirty;
    if (!isDirty) return;

    const timer = setTimeout(async () => {
        // Re-check isDirty at fire time — user may have manually saved already
        if (!useConsultationStore.getState().isDirty) return;
        try {
            await saveMutation.mutateAsync({ finish: false });
            // saveMutation.onSuccess already marks isDirty = false via loadConsultation on reload,
            // but we should explicitly clear it here to avoid double-save
            useConsultationStore.setState({ isDirty: false });
        } catch (e) {
            // Auto-save failures are silent — the user did not trigger this
            console.warn('Auto-save failed silently:', e);
        }
    }, 20_000); // 20 seconds of inactivity

    return () => clearTimeout(timer);
}, [
    // Watch the store's isDirty flag by subscribing to it properly
    // Since isDirty is in Zustand, we need to bring it into React state:
    // See note below about subscribing to isDirty
]);
```

**Important note**: Zustand state is not reactive inside React `useEffect` deps unless you subscribe to it. To make `isDirty` trigger the effect, add it to the component via `useConsultationStore(state => state.isDirty)` in the hook and add it to the deps array:

```ts
// At the top of useDoctorDashboardLogic, alongside other store selectors:
const isDirty = useConsultationStore(state => state.isDirty);
```

Then the effect deps become `[isDirty, currentConsultationId, isActiveConsultationToday, saveMutation]`.

**Step 3**: In `saveMutation.onSuccess` (line 340–349), add `useConsultationStore.setState({ isDirty: false })` after the toast line.

**Step 4**: Show a subtle "unsaved changes" indicator. In `src/ui/components/doctor/dashboard/DashboardHeader.tsx`, read `isDirty` from the store and conditionally render a small dot or "•" next to the save button label when `isDirty === true`.

---

## Fix 2 — Targeted Cache Invalidation (Replace Global Sledgehammer)

### Problem

There are three places where cache is invalidated too broadly:

**Location A** — `src/ui/hooks/useRealtime.ts`, line 64:
```ts
queryClient.invalidateQueries({ queryKey: [resource] });
```
When any machine saves a consultation, this fires and invalidates the entire `['consultations']` cache — meaning ALL consultations for ALL patients are re-fetched.

**Location B** — `src/ui/components/doctor/dashboard/useDoctorDashboardLogic.ts`, line 343:
```ts
queryClient.invalidateQueries({ queryKey: ['consultations'] });
```
After a manual save, this again invalidates everything instead of just the active consultation.

**Location C** — `src/ui/components/doctor/documents/hooks/usePrintHandlers.ts`, line 186:
```ts
queryClient.invalidateQueries({ queryKey: ['consultations'] });
```
After printing a document, this invalidates everything again.

### Fix

**Step 1**: Change `broadcast.ts` to emit a structured payload instead of just a resource string.

In `src/electron/lib/broadcast.ts`, change the `broadcastChange` signature and body:

```ts
// Before:
export function broadcastChange(resource: string) {
    windows.forEach(win => {
        win.webContents.send('data-changed', resource);
    });
    // ...
    serverManager['io'].emit('data-changed', resource);
}

// After:
export function broadcastChange(resource: string, id?: string) {
    const payload = { resource, id };
    windows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('data-changed', payload);
        }
    });
    // ...
    serverManager['io'].emit('data-changed', payload);
}
```

**Step 2**: Update every call to `broadcastChange` in the routers to pass the ID when available.

In `src/electron/orpc/routers/consultations.router.ts`:
- Line 61: `broadcastChange('consultations')` → `broadcastChange('consultations', result.id)`
- Line 117: `broadcastChange('consultations')` → `broadcastChange('consultations', input.id)`

Do the same for appointments, waitlist, invoices routers — check each for existing `broadcastChange` calls and pass the relevant `id` when the operation is on a specific record.

**Step 3**: Update `useRealtime.ts` to use the structured payload.

```ts
// Current (line 46-48):
socket.on('data-changed', (resource: string) => {
    handleResourceChange(resource);
});

// New:
socket.on('data-changed', (payload: string | { resource: string; id?: string }) => {
    // Handle both old string format (backward compat with older server versions) and new object format
    if (typeof payload === 'string') {
        handleResourceChange(payload, undefined);
    } else {
        handleResourceChange(payload.resource, payload.id);
    }
});
```

Also update the IPC handler (line 17-20) similarly:
```ts
unsubscribeIPC = window.electronAPI.onDataChanged((payload) => {
    if (typeof payload === 'string') {
        handleResourceChange(payload, undefined);
    } else {
        handleResourceChange(payload.resource, payload.id);
    }
});
```

**Step 4**: Update `handleResourceChange` to accept an optional `id` and do targeted invalidation:

```ts
// Current (lines 63-75):
const handleResourceChange = (resource: string) => {
    queryClient.invalidateQueries({ queryKey: [resource] });
    // ...
};

// New:
const handleResourceChange = (resource: string, id?: string) => {
    if (id) {
        // Targeted: only invalidate the specific record
        queryClient.invalidateQueries({ queryKey: [resource, id] });
        // Also invalidate list queries for this resource (sidebar counts, etc.)
        queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
    } else {
        // Fallback: no ID means invalidate all (e.g., bulk operations)
        queryClient.invalidateQueries({ queryKey: [resource] });
    }

    if (resource === 'appointments' || resource === 'waitlist' || resource === 'consultations' || resource === 'payments') {
        queryClient.invalidateQueries({ queryKey: ['todayStats'] });
        queryClient.invalidateQueries({ queryKey: ['resume'] });
    }

    if (resource === 'consultations') {
        queryClient.invalidateQueries({ queryKey: ['consultations', 'last-completed'] });
    }
};
```

**Step 5**: Fix the broad invalidation in `useDoctorDashboardLogic.ts` `saveMutation.onSuccess` (line 343). Replace:
```ts
queryClient.invalidateQueries({ queryKey: ['consultations'] });
```
with:
```ts
queryClient.invalidateQueries({ queryKey: ['consultations', 'active', patientId] });
queryClient.invalidateQueries({ queryKey: ['consultations', 'list', patientId] });
```
The broader invalidation of `['appointments']`, `['waitlist']`, `['resume']` on lines 344–347 are fine to keep — those really do need a full refresh when a consultation is finished.

**Step 6**: Fix the broad invalidation in `usePrintHandlers.ts` (line 186). Replace:
```ts
queryClient.invalidateQueries({ queryKey: ['consultations'] });
```
with:
```ts
queryClient.invalidateQueries({ queryKey: ['consultations', consultationId] });
```
(`consultationId` is already available on the same line from `useConsultationStore.getState().consultationId`.)

---

## Fix 3 — Fix `broadcast.ts` Private Field Access

### Problem

**File**: `src/electron/lib/broadcast.ts`, lines 22–29:
```ts
// @ts-ignore - Accessing io which is private but we might need to expose it or add an emit method
if (serverManager['io']) {
    // @ts-ignore
    serverManager['io'].emit('data-changed', resource);
}
```

This accesses the private `io` field of `ElectronServerManager` via string indexing with two `@ts-ignore` suppressions. If `ElectronServerManager` is ever refactored (field renamed, extracted, etc.), this breaks silently at runtime.

### Fix

**Step 1**: Add a public `emitToClients` method to `ElectronServerManager` in `src/electron/serverManager.ts`.

Add after the existing `startServer` method:

```ts
/**
 * Emits a Socket.IO event to all connected network clients.
 * Safe to call even if the server has not started yet (no-op in that case).
 *
 * @param event - The event name
 * @param data - The payload to emit
 */
public emitToClients(event: string, data: unknown): void {
    if (this.io) {
        this.io.emit(event, data);
    }
}
```

**Step 2**: Update `broadcast.ts` to use the new method. Replace:
```ts
// @ts-ignore - Accessing io which is private but we might need to expose it or add an emit method
if (serverManager['io']) {
    console.log(`🌐 [Socket.IO] Broadcasting change for: ${resource}`);
    // @ts-ignore
    serverManager['io'].emit('data-changed', resource);
}
```
with:
```ts
console.log(`🌐 [Socket.IO] Broadcasting change for: ${resource}`);
serverManager.emitToClients('data-changed', payload);
```

Note: `startServer().then(...)` wrapper can be simplified too — `emitToClients` is a no-op when `io` is null, so there is no need to await `startServer()` just to emit. The full `broadcastChange` after both fixes becomes:

```ts
export function broadcastChange(resource: string, id?: string) {
    const payload = { resource, id };

    // 1. Local Electron windows via IPC
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('data-changed', payload);
        }
    });

    // 2. Network clients via Socket.IO (no-op if server not started)
    const serverManager = ElectronServerManager.getInstance();
    console.log(`🌐 [Socket.IO] Broadcasting change for: ${resource}${id ? ` (id: ${id})` : ''}`);
    serverManager.emitToClients('data-changed', payload);
}
```

---

## Fix 4 — Deduplicate `formatNumberWithSign`

### Problem

The function `formatNumberWithSign` is defined identically in two separate files:

- `src/ui/store/consultationStore.ts`, lines 14–22 (frontend)
- `src/electron/db/repositories/consultation.repository.ts`, lines 58–65 (backend)

These will drift. One already has `!isFinite(num)` check; the other may not. The backend version runs in the Electron main process; the frontend version runs in the renderer. They must produce identical output or formatted numbers will differ between what the doctor types and what the database stores/reads.

### Fix

**Step 1**: Create a shared utility file. Because this function is used in both the Electron main process and the renderer (which have separate module systems in Electron), the cleanest location is inside the `src/electron/lib/` directory which is imported by backend code, and then re-exported or duplicated carefully. However, since the frontend (`src/ui/`) cannot import from `src/electron/` at runtime in Electron, the safest approach is:

Create `src/shared/formatters.ts`:
```ts
/**
 * Formats a numeric value with an explicit sign (+/-) and two decimal places.
 * Used for ophthalmic measurements (sphere, cylinder, addition).
 *
 * Examples: 2 → "+2.00", -1.5 → "-1.50", 0 → "0.00", "" → ""
 */
export const formatNumberWithSign = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null || value === '') return '';
    const strVal = value.toString().replace(',', '.');
    const num = parseFloat(strVal);
    if (isNaN(num) || !isFinite(num)) return value?.toString() || '';
    if (num === 0) return '0.00';
    const formatted = num.toFixed(2);
    return num > 0 ? `+${formatted}` : formatted;
};
```

**Step 2**: In `src/ui/store/consultationStore.ts`, replace the local definition (lines 14–22) with:
```ts
import { formatNumberWithSign } from '@/shared/formatters';
```
And remove the local function body.

**Step 3**: In `src/electron/db/repositories/consultation.repository.ts`, replace the local `formatNumberWithSign` definition (lines 58–65, inside `mapEye`) with:
```ts
import { formatNumberWithSign } from '../../shared/formatters.js';
```
And remove the local function body inside `mapEye`. Note the `.js` extension is required for ESM imports in the Electron main process.

**Step 4**: Update `tsconfig` aliases if necessary so `@/shared/` resolves correctly in the renderer. Check `vite.config.ui.js` — the `resolve.alias` section already maps `@` to `./src`, so `@/shared/formatters` will resolve to `src/shared/formatters.ts` automatically.

---

## Fix 5 — Decouple `syncDocuments` from Keystroke Events

### Problem

**File**: `src/ui/store/consultationStore.ts`

`syncDocuments` (lines 43–299) is called synchronously at the end of every mutating action: `setLeftEye` (line 391), `setRightEye` (line 395), `updateLeftEyeField` (line 412), `updateRightEyeField` (line 429), `setClinicalExam` (line 435), `updateClinicalExamField` (line 468).

This means on every single keystroke in any eye or clinical exam field, `syncDocuments` runs and:
1. Copies and transforms data across multiple nested objects.
2. Calls `set()` a second time inside the same action (causing a second render).
3. Launches an async `lentilleService.convertToContactLens` call (lines 247–294) that eventually calls `set()` a third time from a Promise `.then()`.

The async contact lens conversion on every keystroke is particularly dangerous. The sequence ID workaround (`lastContactLensSyncIdRight` / `lastContactLensSyncIdLeft`) as module-level mutable globals (lines 40–41) is a fragile patch on top of the real problem.

The synchronous double-`set()` pattern (set the field, then immediately set documentOverrides) causes React to potentially render twice per keystroke in components that subscribe to both parts of the store, despite Zustand's batching — because `syncDocuments` calls `set()` from outside the original `set()` callback, after it has already returned.

### Fix

**Step 1**: Remove the `syncDocuments(set, get, prevState)` call from the end of every action in the store. Do NOT delete `syncDocuments` itself yet — just stop calling it inline.

**Step 2**: Add a debounced sync trigger. In the store, add a new action `_triggerSync` that components can call, and a separate exported function to be called from a `useEffect`:

```ts
// At the bottom of the store, add:
triggerDocumentSync: () => {
    const state = get();
    // We need prevState for comparison — use a ref-like approach
    // Since we can't use refs in Zustand, we store a snapshot
    const prevSnapshot = get()._lastSyncSnapshot;
    if (prevSnapshot) {
        syncDocuments(set, get, prevSnapshot);
    }
    set({ _lastSyncSnapshot: { ...state } });
},
_lastSyncSnapshot: null as any,
```

**Step 3**: In a new hook `src/ui/hooks/useDocumentSync.ts`, subscribe to store field changes with a debounced effect:

```ts
import { useEffect, useRef } from 'react';
import { useConsultationStore } from '@/ui/store/consultationStore';

/**
 * Runs syncDocuments 400ms after the last change to eye or clinical exam data.
 * Must be mounted once inside DoctorDashboard — not inside tab children.
 */
export function useDocumentSync() {
    const leftEye = useConsultationStore(state => state.leftEye);
    const rightEye = useConsultationStore(state => state.rightEye);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);
    const prevRef = useRef<{ leftEye: any; rightEye: any; clinicalExam: any } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentState = useConsultationStore.getState();
            const prev = prevRef.current;
            if (!prev) {
                prevRef.current = { leftEye: currentState.leftEye, rightEye: currentState.rightEye, clinicalExam: currentState.clinicalExam };
                return;
            }

            // Only run sync if something actually changed
            if (prev.leftEye !== currentState.leftEye || prev.rightEye !== currentState.rightEye || prev.clinicalExam !== currentState.clinicalExam) {
                // Import syncDocuments — export it from consultationStore.ts
                import('@/ui/store/consultationStore').then(({ runSyncDocuments }) => {
                    runSyncDocuments();
                });
                prevRef.current = { leftEye: currentState.leftEye, rightEye: currentState.rightEye, clinicalExam: currentState.clinicalExam };
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [leftEye, rightEye, clinicalExam]);
}
```

To support this, export a `runSyncDocuments` function from `consultationStore.ts`:
```ts
export const runSyncDocuments = () => {
    const store = useConsultationStore.getState();
    // prevState for sync must come from the last known snapshot stored in _lastSyncSnapshot
    const prev = store._lastSyncSnapshot || store;
    syncDocuments(useConsultationStore.setState, useConsultationStore.getState, prev);
    useConsultationStore.setState({ _lastSyncSnapshot: { ...store } });
};
```

**Step 4**: Mount `useDocumentSync()` in `src/ui/components/doctor/DoctorDashboard.tsx`. Add it near the top of the component body, after the `useDoctorDashboardLogic` call.

**Step 5**: The async contact lens conversion inside `syncDocuments` (lines 226–298) should be moved to its own `useContactLensSync` hook. This hook watches `leftEye` and `rightEye` for the specific fields that matter (`sph`, `cyl`, `axis`, `contactLensType`, `diam`, `axis_k`, `rayon`, `lensBrand`, `lensType`), runs the conversion with an `AbortController`-equivalent (via a cancelled flag), and writes the result directly to `documentOverrides` via `setDocumentOverride`.

This completely eliminates the module-level `lastContactLensSyncIdRight` / `lastContactLensSyncIdLeft` globals.

```ts
// src/ui/hooks/useContactLensSync.ts
import { useEffect, useRef } from 'react';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { lentilleService } from '@/ui/services/LentilleService';
import { formatNumberWithSign } from '@/shared/formatters';

export function useContactLensSync() {
    const leftEye = useConsultationStore(state => state.leftEye);
    const rightEye = useConsultationStore(state => state.rightEye);
    const setDocumentOverride = useConsultationStore(state => state.setDocumentOverride);

    const cancelledRef = useRef<{ right: boolean; left: boolean }>({ right: false, left: false });

    const syncEye = (eye: 'right' | 'left', eyeData: typeof leftEye) => {
        cancelledRef.current[eye] = true; // Cancel any in-flight request for this eye
        const cancelled = { value: false };
        cancelledRef.current[eye] = false;

        const type = eyeData.contactLensType || 'Sphérique';
        const isSpherical = type === 'Sphérique';

        lentilleService.convertToContactLens(
            eyeData.sph || '',
            eyeData.cyl || '',
            eyeData.axis || '',
            type
        ).then(converted => {
            if (cancelled.value) return;

            const fieldPrefix = eye === 'right' ? 'rightEye' : 'leftEye';
            const currentState = useConsultationStore.getState();
            const currentOverrides = currentState.documentOverrides;
            const unified = currentOverrides.unifiedDocumentsState || {};
            const printStates = unified.printStates || {};
            const contactsData = { ...(printStates.printContactLensesData || { leftEye: {}, rightEye: {} }) };

            if (converted && isFinite(converted.sphere)) {
                contactsData[fieldPrefix] = {
                    ...(contactsData[fieldPrefix] || {}),
                    sph: formatNumberWithSign(converted.sphere),
                    cyl: isSpherical ? '' : formatNumberWithSign(converted.cylinder),
                    axis: isSpherical ? '' : String(converted.axis ?? ''),
                    contactLensType: type,
                    diam: eyeData.diam || '',
                    axis_k: eyeData.rayon || eyeData.axis_k || '',
                    lensBrand: eyeData.lensBrand || '',
                    lensType: eyeData.lensType || '',
                };
            } else {
                contactsData[fieldPrefix] = {
                    ...(contactsData[fieldPrefix] || {}),
                    sph: eyeData.sph || '',
                    cyl: eyeData.cyl || '',
                    axis: String(eyeData.axis ?? ''),
                    contactLensType: type,
                    diam: eyeData.diam || '',
                    axis_k: eyeData.rayon || eyeData.axis_k || '',
                    lensBrand: eyeData.lensBrand || '',
                    lensType: eyeData.lensType || '',
                };
            }

            const newUnified = {
                ...unified,
                printStates: { ...printStates, printContactLensesData: contactsData },
            };
            useConsultationStore.getState().setDocumentOverride('unifiedDocumentsState', newUnified);
            useConsultationStore.getState().setDocumentOverride('contacts', contactsData);
        });

        return () => { cancelled.value = true; };
    };

    useEffect(() => {
        return syncEye('right', rightEye);
    }, [rightEye.sph, rightEye.cyl, rightEye.axis, rightEye.contactLensType, rightEye.diam, rightEye.axis_k, rightEye.rayon, rightEye.lensBrand, rightEye.lensType]);

    useEffect(() => {
        return syncEye('left', leftEye);
    }, [leftEye.sph, leftEye.cyl, leftEye.axis, leftEye.contactLensType, leftEye.diam, leftEye.axis_k, leftEye.rayon, leftEye.lensBrand, leftEye.lensType]);
}
```

Mount `useContactLensSync()` in `DoctorDashboard.tsx` alongside `useDocumentSync()`.

After these changes, the async contact lens code can be removed from `syncDocuments` in `consultationStore.ts` (lines 226–298), and the module-level globals `lastContactLensSyncIdRight` / `lastContactLensSyncIdLeft` (lines 40–41) can be deleted.

---

## Fix 6 — Make `objSph → sph` Coupling Explicit

### Problem

**File**: `src/ui/store/consultationStore.ts`, lines 398–412 and 415–430

```ts
updateLeftEyeField: (field, value) => {
    ...
    const updates: Partial<EyeData> = { [field]: value };
    if (field === 'objSph') updates.sph = value;   // hidden side effect
    if (field === 'objCyl') updates.cyl = value;   // hidden side effect
    if (field === 'objAxis') updates.axis = value; // hidden side effect
    if (field === 'objAdd') updates.add = value;   // hidden side effect
    ...
    ...(field === 'glassType' ? { rightEye: { ...state.rightEye, [field]: value } } : {})
```

Updating a field like `objSph` silently also updates `sph`. Any developer calling `updateLeftEyeField('objSph', value)` has no idea `sph` also changes. The `glassType` cross-eye coupling (updating left eye's `glassType` also sets right eye's `glassType`) is similarly invisible.

This is a business rule — in ophthalmology, the objective refraction (`objSph/Cyl/Axis`) auto-fills the subjective refraction (`sph/cyl/axis`) as a starting point. But it should not be hidden inside a generic field updater.

### Fix

Add explicit named actions for these coupled updates. Do not remove the existing `updateLeftEyeField` — many components use it — but make the coupling go through new named actions:

```ts
// Add to ConsultationState interface:
setObjectiveRefraction: (eye: 'left' | 'right', values: { sph?: string; cyl?: string; axis?: string; add?: string }) => void;
setGlassType: (value: string) => void; // Sets both eyes simultaneously

// Implementations:
setObjectiveRefraction: (eye, values) => {
    const prevState = get();
    const updates: Partial<EyeData> = {};
    // Objective fields
    if (values.sph !== undefined) { updates.objSph = values.sph; updates.sph = values.sph; }
    if (values.cyl !== undefined) { updates.objCyl = values.cyl; updates.cyl = values.cyl; }
    if (values.axis !== undefined) { updates.objAxis = values.axis; updates.axis = values.axis; }
    if (values.add !== undefined) { updates.objAdd = values.add; updates.add = values.add; }
    
    set((state) => ({
        [eye === 'left' ? 'leftEye' : 'rightEye']: {
            ...state[eye === 'left' ? 'leftEye' : 'rightEye'],
            ...updates,
        },
        isDirty: true,
    }));
    syncDocuments(set, get, prevState); // will be removed after Fix 5
},

setGlassType: (value) => {
    const prevState = get();
    set((state) => ({
        leftEye: { ...state.leftEye, glassType: value },
        rightEye: { ...state.rightEye, glassType: value },
        isDirty: true,
    }));
    syncDocuments(set, get, prevState); // will be removed after Fix 5
},
```

Then in `updateLeftEyeField` and `updateRightEyeField`, remove the `objSph/Cyl/Axis/Add` and `glassType` special cases. They are now handled by the explicit actions. Update the components (`EyeRefractionPanel.tsx`) that currently call `updateLeftEyeField('objSph', ...)` to call `setObjectiveRefraction('left', { sph: value })` instead.

---

## Fix 7 — Remove Debug Console Spam from Production Code

### Problem

**File**: `src/ui/components/doctor/documents/hooks/usePrintHandlers.ts`, lines 123–128:

```ts
console.group('[PDF Print/Preview] getPrintOptions Debugging');
console.log('1. documentType:', documentType);
console.log('2. original leftEye/rightEye from store:', { left: state.leftEye, right: state.rightEye });
console.log('3. overrides.glasses explicitly:', overrides.glasses);
console.log('4. printDataOverrides extracted:', printOptions.printDataOverrides);
console.groupEnd();
```

This runs every time the user opens the print/preview modal. It logs the full eye data and overrides objects to the console on every invocation. In production Electron builds, this is visible in DevTools and adds unnecessary overhead.

### Fix

Delete lines 123–128 entirely. The function is complete and working; these are leftover debug statements. If debugging is needed in the future, use a `DEBUG` flag:

```ts
if (process.env.NODE_ENV === 'development') {
    console.log('[PDF Debug]', { documentType, printOptions });
}
```

---

## Fix 8 — Type `documentOverrides` Properly

### Problem

**File**: `src/ui/store/consultationStore.ts`, line 332:
```ts
documentOverrides: Record<string, any>;
```

The entire document state is typed as `Record<string, any>`. This means TypeScript provides zero help when reading or writing document overrides. Typos in key names (`overrides.galsses` vs `overrides.glasses`) silently return `undefined`. This has already caused bugs — see `usePrintHandlers.ts` lines 104–116 where the same data is accessed via three different possible paths (`overrides.glasses`, `overrides.unifiedDocumentsState?.printStates?.printGlassesData`) because of accumulated uncertainty about which key is canonical.

### Fix

Create a proper type in `src/ui/store/consultationStore.ts` (or a new `src/ui/types/documentOverrides.ts`):

```ts
export interface DocumentOverrides {
    // Unified state (canonical, source of truth for all print documents)
    unifiedDocumentsState?: {
        bilanFields?: InternalBilanFields;
        customFieldInputs?: {
            bilanPreOp: string;
            bilanDiabete: string;
            bilanInflammatoire: string;
            bilanUveite: string;
        };
        printControlFlags?: PrintControlFlags;
        absenceData?: { date: Date; reason: string };
        workStopData?: WorkStopData;
        printStates?: {
            printPrescriptionData?: PrescriptionData;
            printGlassesData?: GlassesPrintData;
            printContactLensesData?: ContactLensesPrintData;
            printVisualAcuityData?: VisualAcuityPrintData;
            printAbsenceData?: { consultationDate: Date };
            printWorkStopData?: WorkStopPrintData;
            selectedDiversDocument?: string;
            printMedicalRecordData?: Record<string, unknown>;
            printGenericData?: { title: string; text: string };
        };
    };

    // Legacy / convenience keys (kept for backward compat, written by useDocumentsState setters)
    report?: ReportData;
    glasses?: GlassesPrintData;
    contacts?: ContactLensesPrintData;
    visualAcuity?: VisualAcuityPrintData;
    bilan?: InternalBilanFields;
    printControlFlags?: PrintControlFlags;
    printPrescriptionData?: PrescriptionData;
    workStop?: WorkStopPrintData;
    absence?: { consultationDate: Date };
    medicalRecord?: { documentType: string; printData: Record<string, unknown> };
    divers?: unknown;
    generic?: unknown;
    customGeneric?: { title: string; text: string };
    selectedGenericTemplate?: string;
    printed?: string[];
    radiography_dynamic?: unknown;
    certificatAcuite?: unknown;
}
```

Replace `documentOverrides: Record<string, any>` with `documentOverrides: DocumentOverrides` in both the interface (line 332) and the initial state (line 382: `documentOverrides: {}`).

Update `setDocumentOverride` and `updateDocumentOverride` signatures to use `keyof DocumentOverrides` instead of `string`. This will immediately surface type errors in `usePrintHandlers.ts` wherever string literals don't match the defined keys — fix each one.

---

## Fix 9 — Add Consultation Audit Log (Time Machine)

### Problem

There is no history of changes within a consultation. If a doctor saves and then accidentally overwrites prescription data, it's gone. Medical software ideally tracks what changed, when, and by whom.

This does NOT require event sourcing. A simple snapshot table in SQLite is sufficient.

### Fix

**Step 1**: Add migration for a new `consultation_snapshots` table. Find the database initialization code (likely in `src/electron/db/database.ts`) and add:

```sql
CREATE TABLE IF NOT EXISTS consultation_snapshots (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    snapshot_data TEXT NOT NULL,  -- Full JSON of the consultation at time of save
    saved_at TEXT NOT NULL,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_snapshots_consultation_id ON consultation_snapshots(consultation_id);
```

**Step 2**: In `ConsultationRepository.update()` (`src/electron/db/repositories/consultation.repository.ts`), inside the transaction, before running the UPDATE, save a snapshot of the current state:

```ts
// At the start of the transaction, snapshot the current consultation
const currentRow = this.db.prepare('SELECT * FROM consultations WHERE id = ?').get(id) as any;
if (currentRow) {
    const snapshotId = randomUUID();
    this.db.prepare(`
        INSERT INTO consultation_snapshots (id, consultation_id, snapshot_data, saved_at)
        VALUES (?, ?, ?, ?)
    `).run(snapshotId, id, JSON.stringify(currentRow), now);

    // Keep only the last 20 snapshots per consultation to control disk usage
    this.db.prepare(`
        DELETE FROM consultation_snapshots 
        WHERE consultation_id = ? 
        AND id NOT IN (
            SELECT id FROM consultation_snapshots 
            WHERE consultation_id = ? 
            ORDER BY saved_at DESC 
            LIMIT 20
        )
    `).run(id, id);
}
```

**Step 3**: Add a `listSnapshots` procedure to `consultations.router.ts`:

```ts
listSnapshots: os
    .input(z.object({ consultationId: z.string() }))
    .handler(async ({ input }) => {
        const repo = new ConsultationRepository();
        return repo.findSnapshots(input.consultationId);
    }),
```

And add `findSnapshots(id: string)` to `ConsultationRepository`:
```ts
findSnapshots(consultationId: string): Array<{ id: string; saved_at: string }> {
    if (!this.hasTable('consultation_snapshots')) return [];
    return this.db.prepare(
        'SELECT id, saved_at FROM consultation_snapshots WHERE consultation_id = ? ORDER BY saved_at DESC'
    ).all(consultationId) as any[];
}
```

This gives you the foundation for a "restore previous version" UI in the history sheet without any architectural complexity.

---

## Execution Order

Apply fixes in this order to minimize risk of conflicts:

1. **Fix 7** (delete console.group lines) — zero risk, 2 minutes
2. **Fix 3** (broadcast.ts private field) — isolated change, no React impact
3. **Fix 4** (deduplicate formatNumberWithSign) — create shared file first, then update imports
4. **Fix 2** (targeted cache invalidation) — depends on Fix 3 being done first
5. **Fix 8** (type documentOverrides) — do before Fix 5 so types are correct when refactoring
6. **Fix 6** (explicit objSph actions) — refactor coupling before disconnecting sync
7. **Fix 5** (decouple syncDocuments) — most complex, do last among logic fixes
8. **Fix 1** (auto-save) — can be done independently, doesn't conflict with others
9. **Fix 9** (audit log) — pure backend addition, no frontend risk

---

## Files Modified Summary

| File | Fixes |
|------|-------|
| `src/ui/store/consultationStore.ts` | Fix 1 (isDirty), Fix 4 (import formatter), Fix 5 (remove inline sync calls), Fix 6 (new actions), Fix 8 (typed overrides) |
| `src/ui/hooks/useRealtime.ts` | Fix 2 (structured payload handler) |
| `src/ui/components/doctor/dashboard/useDoctorDashboardLogic.ts` | Fix 1 (auto-save effect), Fix 2 (targeted invalidation in saveMutation) |
| `src/ui/components/doctor/dashboard/DoctorDashboard.tsx` | Fix 5 (mount useDocumentSync, useContactLensSync) |
| `src/ui/components/doctor/documents/hooks/usePrintHandlers.ts` | Fix 2 (targeted invalidation), Fix 7 (remove console.group) |
| `src/electron/lib/broadcast.ts` | Fix 2 (structured payload), Fix 3 (use emitToClients) |
| `src/electron/serverManager.ts` | Fix 3 (add emitToClients method) |
| `src/electron/orpc/routers/consultations.router.ts` | Fix 2 (pass id to broadcastChange), Fix 9 (listSnapshots procedure) |
| `src/electron/db/repositories/consultation.repository.ts` | Fix 4 (import formatter), Fix 9 (snapshot on update, findSnapshots) |
| `src/electron/db/database.ts` | Fix 9 (add consultation_snapshots table) |
| `src/shared/formatters.ts` | Fix 4 (new file — shared formatNumberWithSign) |
| `src/ui/hooks/useDocumentSync.ts` | Fix 5 (new file — debounced document sync hook) |
| `src/ui/hooks/useContactLensSync.ts` | Fix 5 (new file — async contact lens conversion hook) |
