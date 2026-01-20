/**
 * Workflow Store
 * 
 * Zustand store for managing workflow-specific state, particularly
 * patient selection in the secretary workflow sidebar.
 */

import { create } from 'zustand';

/**
 * Workflow store state interface
 */
interface WorkflowStore {
    selectedPatient: any | null;
    isPatientSelectorOpen: boolean;
    setSelectedPatient: (patient: any | null) => void;
    setPatientSelectorOpen: (open: boolean) => void;
}

/**
 * Zustand store for workflow state management
 * 
 * Manages:
 * - Selected patient in workflow sidebar
 * - Patient selector dialog open state
 * 
 * @returns {WorkflowStore} Store state and actions
 */
export const useWorkflowStore = create<WorkflowStore>((set) => ({
    selectedPatient: null,
    isPatientSelectorOpen: false,
    setSelectedPatient: (patient) => set({ selectedPatient: patient, isPatientSelectorOpen: false }),
    setPatientSelectorOpen: (open) => set({ isPatientSelectorOpen: open }),
}));

