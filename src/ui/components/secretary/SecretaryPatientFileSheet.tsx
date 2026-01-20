import { useEffect, useRef } from "react";
import { orpcClient } from "@/ui/lib/orpc/client";
import { useQuery } from '@tanstack/react-query';
import { SecretaryPatientDetails } from "./sheet/SecretaryPatientDetails";
import { ClinicalDataContent } from "./patient/ClinicalDataSheet";
import { SecretaryDocumentsContent } from "@/ui/components/secretary/sheet/SecretaryDocumentsSheet";
import { useSheetStack } from "@/ui/components/ui/sheet-stack";
import { PatientForm } from "../patients/PatientForm";
import { useUpdatePatient } from "@/ui/hooks/usePatients";

interface SecretaryPatientFileSheetProps {
    patientId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTab?: string;
}

export function SecretaryPatientFileSheet({ patientId, open, onOpenChange, initialTab = 'info' }: SecretaryPatientFileSheetProps) {
    const { openSheet, closeSheet, closeAll } = useSheetStack();
    const sheetIdsRef = useRef<string[]>([]);
    const updatePatient = useUpdatePatient();

    // We treat this component as a "Controller" that pushes the Main Sheet to the global stack

    const { data: patient, isLoading: isPatientLoading } = useQuery({
        queryKey: ['patients', 'get', patientId],
        queryFn: () => patientId ? orpcClient.patients.get({ id: patientId }) : null,
        enabled: !!patientId && open,
    });

    // ... handlers ...

    const handleOpenClinicalData = () => {
        if (!patientId) return;
        const id = openSheet(
            <ClinicalDataContent
                patientId={patientId}
                patient={patient}
                patientName={patient ? `${patient.surname} ${patient.name}` : ''}
                onCancel={() => closeSheet('clinical-data')} // We'll manage IDs or use return values
                onSuccess={() => closeSheet('clinical-data')}
            />,
            { id: 'clinical-data', width: 500, title: 'Données Cliniques' }
        );
    };

    const handleOpenDocuments = () => {
        if (!patientId) return;
        openSheet(
            <SecretaryDocumentsContent
                patientId={patientId}
                patientName={patient ? `${patient.surname} ${patient.name}` : ''}
                onClose={() => closeSheet('documents')}
            />,
            { id: 'documents', width: 500, title: 'Documents' }
        );
    };

    const handleOpenEditPatient = () => {
        if (!patientId || !patient) return;
        openSheet(
            <div className="p-6">
                <PatientForm
                    initialData={patient}
                    isLoading={updatePatient.isPending}
                    onCancel={() => closeSheet('patient-edit')}
                    onSubmit={(data) => {
                        updatePatient.mutate({ id: patientId, updates: data }, {
                            onSuccess: () => closeSheet('patient-edit')
                        });
                    }}
                />
            </div>,
            { id: 'patient-edit', width: 500, title: 'Modifier Patient' }
        );
    };

    useEffect(() => {
        if (open && patientId) {
            // Open the Main Sheet (Level 0)
            const mainId = openSheet(
                <SecretaryPatientDetails
                    patient={patient}
                    isPatientLoading={isPatientLoading}
                    onOpenClinicalData={handleOpenClinicalData}
                    onOpenDocuments={handleOpenDocuments}
                    onEdit={handleOpenEditPatient}
                    patientId={patientId}
                    initialTab={initialTab}
                />,
                {
                    id: 'patient-main',
                    width: 400,
                    className: "bg-white",
                    onDismiss: () => onOpenChange(false)
                }
            );
            sheetIdsRef.current.push(mainId);
        } else {
            // Close all sheets related to this session
            closeSheet('patient-main');
            closeSheet('clinical-data');
            closeSheet('documents');
            closeSheet('patient-edit');
        }

        return () => {
            // Optional cleanup
        };
    }, [open, patientId, patient, isPatientLoading, initialTab]);

    // Watch for stack empty? If stack is empty (user closed main sheet via overlay), we should call onOpenChange(false).
    // This requires subscribing to stack state.
    // Simplifying assumption: The Global Stack handles the UI. This component bridges the "Legacy" prop triggers.

    return null; // No local rendering, everything is in the Stack logic
}
