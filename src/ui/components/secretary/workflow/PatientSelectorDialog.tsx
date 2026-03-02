/**
 * Patient Selector Dialog
 * A dialog wrapper around PatientSelector component
 */

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/ui/components/ui/dialog";
import { WorkflowPatientSelector } from "./WorkflowPatientSelector";
import { useWorkflowStore } from "@/ui/hooks/useWorkflowStore";

export function PatientSelectorDialog() {
    const { isPatientSelectorOpen, setPatientSelectorOpen, setSelectedPatient } = useWorkflowStore();

    return (
        <Dialog open={isPatientSelectorOpen} onOpenChange={setPatientSelectorOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Sélectionner un Patient</DialogTitle>
                    <DialogDescription>
                        Recherchez un patient pour commencer le flux de travail.
                    </DialogDescription>
                </DialogHeader>
                <WorkflowPatientSelector
                    onSelect={(patient) => {
                        setSelectedPatient(patient);
                        setPatientSelectorOpen(false);
                    }}
                    onCreateNew={() => console.log('Create new patient')}
                />
            </DialogContent>
        </Dialog>
    );
}
