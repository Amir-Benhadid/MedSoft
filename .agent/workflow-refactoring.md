# Workflow Manager Refactoring

## Summary
Refactored the workflow manager to follow the pattern from `src/ui2`, where workflow state is computed from database queries rather than being passed down as props. Uses **three separate, focused hooks** for optimal performance and React Query caching.

## Changes Made

### 1. Created Three Workflow Hooks (`src/ui/hooks/useWorkflow.ts`)

Instead of one monolithic hook, we created three separate hooks following the existing pattern in the codebase:

#### `useInConsultation()`
- **Returns**: Patient currently in consultation (or `null`)
- **Queries**: Today's appointments, waitlist, and patients
- **Logic**: Finds first patient with `state === 'in_consultation'` in appointments or waitlist
- **Benefit**: Only re-renders components that care about consultation status

#### `usePendingPayment()`
- **Returns**: Patient awaiting payment (or `null`)
- **Queries**: Today's appointments, waitlist, and patients
- **Logic**: Finds first patient with `state === 'completed'` (finished consultation, awaiting payment)
- **Benefit**: Only re-renders components that care about payment status

#### `usePatientsNeedingDilation()`
- **Returns**: Array of patients requiring dilation
- **Queries**: Today's appointments, waitlist, and patients
- **Logic**: Finds all patients with `needs_dilation === true` (excluding paid/creance states)
- **Benefit**: Only re-renders components that care about dilation

### 2. Updated `SecretaryWorkflowSidebar` Component
- **Before**: Received `workflowState` as a prop
- **After**: Uses three separate hooks internally:
  ```tsx
  const inConsultation = useInConsultation();
  const pendingPayment = usePendingPayment();
  const patientsNeedingDilation = usePatientsNeedingDilation();
  ```
- **Benefits**:
  - Component is self-contained
  - No need to pass workflow state down from parent
  - Automatically stays in sync with database
  - **React Query caching**: Each hook benefits from independent caching

### 3. Updated `secretary.tsx` Route
- **Before**: Passed mock `workflowState` prop to `SecretaryWorkflowSidebar`
- **After**: No longer passes `workflowState` prop
- **Result**: Cleaner component usage, less prop drilling

## Architecture Pattern

### Old Pattern (Prop Drilling)
```
secretary.tsx
  ↓ (passes workflowState prop)
SecretaryWorkflowSidebar
```

### New Pattern (Segmented Hooks)
```
SecretaryWorkflowSidebar
  ├─ useInConsultation()
  │    ↓ (queries: appointments, waitlist, patients)
  ├─ usePendingPayment()
  │    ↓ (queries: appointments, waitlist, patients)
  └─ usePatientsNeedingDilation()
       ↓ (queries: appointments, waitlist, patients)

React Query Cache (shared across hooks)
  ├─ ['appointments', today]
  ├─ ['waitlist', today]
  └─ ['patients', 'list']
```

## Performance Benefits

### 1. **React Query Caching**
All three hooks query the same data (`appointments`, `waitlist`, `patients`), but React Query only fetches each query **once** and shares the cached data across all hooks.

### 2. **Selective Re-renders**
If only the consultation status changes:
- ✅ `useInConsultation()` triggers re-render
- ❌ `usePendingPayment()` doesn't re-render (same data)
- ❌ `usePatientsNeedingDilation()` doesn't re-render (same data)

### 3. **Independent Usage**
Other components can use individual hooks without fetching unnecessary data:
```tsx
// Component only cares about dilation
function DilationPanel() {
  const patients = usePatientsNeedingDilation();
  // Only subscribes to dilation-related updates
}
```

## How It Works

1. **Data Fetching**: Each hook queries:
   - Today's appointments (`['appointments', today]`)
   - Today's waitlist entries (`['waitlist', today]`)
   - All patients (`['patients', 'list']`)

2. **State Computation**: Each hook computes its specific derived state:
   - `useInConsultation`: Finds patient in consultation
   - `usePendingPayment`: Finds patient pending payment
   - `usePatientsNeedingDilation`: Finds patients needing dilation

3. **Reactivity**: 
   - React Query automatically refetches when queries are invalidated
   - Realtime updates (via `useRealtime` hook) invalidate queries on data changes
   - UI updates automatically when workflow state changes
   - **Caching prevents duplicate network requests**

## Benefits

1. **Single Source of Truth**: Database is the source of truth, not props
2. **Automatic Updates**: Realtime updates work seamlessly
3. **Less Boilerplate**: No need to manage workflow state in parent components
4. **Better Separation**: Workflow logic is isolated in focused hooks
5. **Easier Testing**: Each hook can be tested independently
6. **Performance**: React Query caching + selective re-renders
7. **Reusability**: Other components can use individual hooks as needed

## Pattern Consistency

This follows the same pattern as existing hooks in the codebase:
- `useAppointments()`, `useCreateAppointment()`, `useUpdateAppointment()`, etc.
- `usePatients()`, `usePatientSearch()`, `usePatient()`, etc.
- `useWaitlist()`, `useAddToWaitlist()`, etc.

Each hook is focused on a single responsibility, making the codebase more maintainable and performant.

