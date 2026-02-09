import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {
    EyeData,
    PrescriptionData,
    TonometrieData,
    DetailedClinicalExamData,
    GlassesPrintData,
    ContactLensesPrintData,
    WorkStopPrintData,
    AbsencePrintData,
    VisualAcuityPrintData
} from '../types';

// Define BilanFields interface to match DocumentPreview expectations
export interface BilanFields {
    bilanPreOp: {
        groupage: boolean;
        fnsTP: boolean;
        ionogramme: boolean;
        glycemie: boolean;
        ureeCreatinine: boolean;
        bilanHepatique: boolean;
        ecgCardiologie: boolean;
    };
    bilanDiabete: {
        glycemieJeun: boolean;
        glycemiePostPrandiale: boolean;
        hbA1c: boolean;
        cholesterol: boolean;
        tgb: boolean;
    };
    bilanInflammatoire: {
        fns: boolean;
        crp: boolean;
        fibrinogene: boolean;
        vs: boolean;
        electrophorese: boolean;
    };
    bilanUveite: {
        fns: boolean;
        vsCrp: boolean;
        electrophorese: boolean;
        toxoplasmose: boolean;
        idrTuberculine: boolean;
        aslo: boolean;
        typageHla: boolean;
        vdrlTpha: boolean;
        serologie: boolean;
        radioThorax: boolean;
    };
}

// Define the interface for internal bilan fields with customFields
export interface InternalBilanFields extends BilanFields {
    bilanPreOp: BilanFields['bilanPreOp'] & { customFields: string[] };
    bilanDiabete: BilanFields['bilanDiabete'] & { customFields: string[] };
    bilanInflammatoire: BilanFields['bilanInflammatoire'] & {
        customFields: string[];
    };
    bilanUveite: BilanFields['bilanUveite'] & { customFields: string[] };
}

interface PrintStates {
    printPrescriptionData: PrescriptionData;
    printGlassesData: any;
    printContactLensesData: any;
    printVisualAcuityData: any;
    printAbsenceData: any;
    printWorkStopData: any;
    printControlFlags: any;
    selectedDiversDocument: string;
    printMedicalRecordData: any;
}

interface UseDocumentsStateProps {
    prescriptionData: PrescriptionData;
    rightEyeData: EyeData;
    leftEyeData: EyeData;
    absenceData: { date: Date; reason: string };
    workStopData: {
        startDate?: Date;
        endDate?: Date;
        reason?: string;
        exitAuthorized?: boolean;
    };
    initialBilanFields?: InternalBilanFields;
    initialDocumentsData?: {
        bilanFields?: InternalBilanFields;
        customFieldInputs?: {
            bilanPreOp: string;
            bilanDiabete: string;
            bilanInflammatoire: string;
            bilanUveite: string;
        };
        printControlFlags?: {
            includeVisualAcuityWithoutCorrection?: boolean;
            includeVisualAcuityWithCorrection: boolean;
            includeTonometry?: boolean;
            includeGlassType: boolean;
            includeFarVision: boolean;
            includeNearVision: boolean;
            includeRightEyeFar?: boolean;
            includeLeftEyeFar?: boolean;
            includeRightEyeNear?: boolean;
            includeLeftEyeNear?: boolean;
            includeRightEye?: boolean;
            includeLeftEye?: boolean;
        };
        activeDocTab?: string;
        printStates?: PrintStates;
    };
    onBilanFieldsChange?: (bilanFields: InternalBilanFields) => void;
    onDocumentsDataChange?: (documentsData: any) => void;
}

export const useDocumentsState = ({
    prescriptionData,
    rightEyeData,
    leftEyeData,
    absenceData,
    workStopData,
    initialBilanFields,
    initialDocumentsData,
    onBilanFieldsChange,
    onDocumentsDataChange,
}: UseDocumentsStateProps) => {
    // Print data states for all document types
    const [printPrescriptionData, setPrintPrescriptionData] = useState<PrescriptionData>(prescriptionData);
    const [printGlassesData, setPrintGlassesData] = useState<GlassesPrintData>({
        rightEye: {
            sph: rightEyeData?.sph || '',
            cyl: rightEyeData?.cyl || '',
            axis: rightEyeData?.axis || '',
            add: rightEyeData?.add || '',
            glassType: rightEyeData?.glassType || '',
            nearSph: '',
            nearCyl: '',
            nearAxis: '',
            emptyEyeOption: 'plan',
            emptyNearEyeOption: 'plan'
        },
        leftEye: {
            sph: leftEyeData?.sph || '',
            cyl: leftEyeData?.cyl || '',
            axis: leftEyeData?.axis || '',
            add: leftEyeData?.add || '',
            glassType: leftEyeData?.glassType || '',
            nearSph: '',
            nearCyl: '',
            nearAxis: '',
            emptyEyeOption: 'plan',
            emptyNearEyeOption: 'plan'
        },
    });
    const [printContactLensesData, setPrintContactLensesData] = useState<ContactLensesPrintData>({
        rightEye: {
            sph: rightEyeData?.sph || '',
            cyl: rightEyeData?.cyl || '',
            axis: rightEyeData?.axis || '',
            diam: rightEyeData?.diam || '',
            axis_k: rightEyeData?.axis_k || '',
            k1: rightEyeData?.k1 || '',
            k2: rightEyeData?.k2 || '',
            contactLensType: rightEyeData?.contactLensType || 'Sphérique',
            lensBrand: rightEyeData?.lensBrand || '',
            lensType: rightEyeData?.lensType || '',
        },
        leftEye: {
            sph: leftEyeData?.sph || '',
            cyl: leftEyeData?.cyl || '',
            axis: leftEyeData?.axis || '',
            diam: leftEyeData?.diam || '',
            axis_k: leftEyeData?.axis_k || '',
            k1: leftEyeData?.k1 || '',
            k2: leftEyeData?.k2 || '',
            contactLensType: leftEyeData?.contactLensType || 'Sphérique',
            lensBrand: leftEyeData?.lensBrand || '',
            lensType: leftEyeData?.lensType || '',
        },
    });
    const [printVisualAcuityData, setPrintVisualAcuityData] = useState<VisualAcuityPrintData>({
        visualAcuityVL_SC_OD: rightEyeData?.visualAcuityVL_SC || rightEyeData?.visualAcuity || '',
        visualAcuityVL_SC_OG: leftEyeData?.visualAcuityVL_SC || leftEyeData?.visualAcuity || '',
        visualAcuityVL_AC_OD: rightEyeData?.visualAcuityVL_AC || '',
        visualAcuityVL_AC_OG: leftEyeData?.visualAcuityVL_AC || '',
    });
    const [printWorkStopData, setPrintWorkStopData] = useState<WorkStopPrintData>({
        startDate: workStopData.startDate,
        endDate: workStopData.endDate,
        exitAuthorized: workStopData.exitAuthorized ?? true,
    });
    const [printAbsenceData, setPrintAbsenceData] = useState<AbsencePrintData>({
        consultationDate: absenceData.date,
    });
    const [printMedicalRecordData, setPrintMedicalRecordData] = useState<any>({});

    // State for bilan field selections - use initial data if provided
    const [bilanFields, setBilanFields] = useState<InternalBilanFields>(
        initialDocumentsData?.bilanFields ||
        initialBilanFields || {
            bilanPreOp: {
                groupage: true,
                fnsTP: true,
                ionogramme: true,
                glycemie: true,
                ureeCreatinine: true,
                bilanHepatique: true,
                ecgCardiologie: true,
                customFields: [],
            },
            bilanDiabete: {
                glycemieJeun: true,
                glycemiePostPrandiale: true,
                hbA1c: true,
                cholesterol: true,
                tgb: true,
                customFields: [],
            },
            bilanInflammatoire: {
                fns: true,
                crp: true,
                fibrinogene: true,
                vs: true,
                electrophorese: true,
                customFields: [],
            },
            bilanUveite: {
                fns: true,
                vsCrp: true,
                electrophorese: true,
                toxoplasmose: true,
                idrTuberculine: true,
                aslo: true,
                typageHla: true,
                vdrlTpha: true,
                serologie: true,
                radioThorax: true,
                customFields: [],
            },
        }
    );

    // State for custom field inputs - use initial data if provided
    const [customFieldInputs, setCustomFieldInputs] = useState(
        initialDocumentsData?.customFieldInputs || {
            bilanPreOp: '',
            bilanDiabete: '',
            bilanInflammatoire: '',
            bilanUveite: '',
        }
    );

    // State for print control flags - use initial data if provided
    const [printControlFlags, setPrintControlFlags] = useState(
        initialDocumentsData?.printControlFlags || {
            includeVisualAcuityWithoutCorrection: true,
            includeVisualAcuityWithCorrection: true,
            includeTonometry: true,
            includeGlassType: false,
            includeNearVision: false,
            includeFarVision: true,
            includeRightEyeFar: true,
            includeLeftEyeFar: true,
            includeRightEyeNear: true,
            includeLeftEyeNear: true,
            includeRightEye: true,
            includeLeftEye: true,
        }
    );

    // State for divers tab selected document
    const [selectedDiversDocument, setSelectedDiversDocument] =
        useState<string>('documentVierge');

    // Prevent feedback loops: while applying initial data, suppress parent notifications
    const suppressNotifyRef = useRef(false);
    // Track last sent payload to avoid sending identical updates repeatedly
    const lastSentJsonRef = useRef<string | null>(null);

    // Update state when initialDocumentsData changes (for loading saved data)
    // Guard against recursive updates by only setting if values actually changed
    useEffect(() => {
        if (initialDocumentsData) {
            // Temporarily suppress outward change notifications while hydrating from parent
            suppressNotifyRef.current = true;
            if (initialDocumentsData.bilanFields) {
                const newBilanFields = initialDocumentsData.bilanFields;
                setBilanFields(prev =>
                    JSON.stringify(prev) !== JSON.stringify(newBilanFields)
                        ? newBilanFields
                        : prev
                );
            }
            if (initialDocumentsData.customFieldInputs) {
                const newCustomFieldInputs = initialDocumentsData.customFieldInputs;
                setCustomFieldInputs(prev =>
                    JSON.stringify(prev) !== JSON.stringify(newCustomFieldInputs)
                        ? newCustomFieldInputs
                        : prev
                );
            }
            if (initialDocumentsData.printControlFlags) {
                const newPrintControlFlags = initialDocumentsData.printControlFlags;
                setPrintControlFlags(prev =>
                    JSON.stringify(prev) !== JSON.stringify(newPrintControlFlags)
                        ? newPrintControlFlags
                        : prev
                );
            }

            // Initialize print states from saved data
            if (initialDocumentsData.printStates) {
                const printStates = initialDocumentsData.printStates;
                if (printStates.printPrescriptionData) {
                    const newPrintPrescriptionData = printStates.printPrescriptionData;
                    setPrintPrescriptionData(prev =>
                        JSON.stringify(prev) !== JSON.stringify(newPrintPrescriptionData)
                            ? newPrintPrescriptionData
                            : prev
                    );
                }
                if (printStates.printGlassesData) {
                    const newPrintGlassesData = printStates.printGlassesData;
                    setPrintGlassesData(prev =>
                        JSON.stringify(prev) !== JSON.stringify(newPrintGlassesData)
                            ? newPrintGlassesData
                            : prev
                    );
                }
                if (printStates.printContactLensesData) {
                    const newPrintContactLensesData = printStates.printContactLensesData;
                    setPrintContactLensesData(prev =>
                        JSON.stringify(prev) !== JSON.stringify(newPrintContactLensesData)
                            ? newPrintContactLensesData
                            : prev
                    );
                }
                if (printStates.printVisualAcuityData) {
                    const newPrintVisualAcuityData = printStates.printVisualAcuityData;
                    setPrintVisualAcuityData(prev =>
                        JSON.stringify(prev) !== JSON.stringify(newPrintVisualAcuityData)
                            ? newPrintVisualAcuityData
                            : prev
                    );
                }
                if (printStates.printAbsenceData) {
                    const newPrintAbsenceData = printStates.printAbsenceData;
                    setPrintAbsenceData(prev =>
                        JSON.stringify(prev) !== JSON.stringify(newPrintAbsenceData)
                            ? newPrintAbsenceData
                            : prev
                    );
                }
                if (printStates.printWorkStopData) {
                    const newPrintWorkStopData = printStates.printWorkStopData;
                    setPrintWorkStopData(prev =>
                        JSON.stringify(prev) !== JSON.stringify(newPrintWorkStopData)
                            ? newPrintWorkStopData
                            : prev
                    );
                }
                if (printStates.printMedicalRecordData) {
                    const newPrintMedicalRecordData = printStates.printMedicalRecordData;
                    setPrintMedicalRecordData((prev: any) =>
                        JSON.stringify(prev) !== JSON.stringify(newPrintMedicalRecordData)
                            ? newPrintMedicalRecordData
                            : prev
                    );
                }
                if (printStates.selectedDiversDocument) {
                    const newSelectedDiversDocument = printStates.selectedDiversDocument;
                    setSelectedDiversDocument(prev =>
                        prev !== newSelectedDiversDocument
                            ? newSelectedDiversDocument
                            : prev
                    );
                }
            }

            // Re-enable notifications on next tick after state has settled
            queueMicrotask(() => {
                suppressNotifyRef.current = false;
            });
        }
    }, [initialDocumentsData]);

    // Update bilanFields when initialBilanFields changes (for backward compatibility)
    useEffect(() => {
        if (initialBilanFields && !initialDocumentsData?.bilanFields) {
            const newBilanFields = initialBilanFields;
            setBilanFields(prev =>
                JSON.stringify(prev) !== JSON.stringify(newBilanFields)
                    ? newBilanFields
                    : prev
            );
        }
    }, [initialBilanFields, initialDocumentsData]);

    // Create stable documentsDataToSend object using useMemo
    // This prevents creating new object references on every render, which would cause infinite loops
    const documentsDataToSend = useMemo(() => ({
        bilanFields,
        customFieldInputs,
        printControlFlags,
        // Include all print states for document generation (without duplicating printControlFlags)
        printStates: {
            printPrescriptionData,
            printGlassesData,
            printContactLensesData,
            printVisualAcuityData,
            printAbsenceData,
            printWorkStopData,
            selectedDiversDocument,
            printMedicalRecordData,
        },
    }), [
        bilanFields,
        customFieldInputs,
        printControlFlags,
        printPrescriptionData,
        printGlassesData,
        printContactLensesData,
        printVisualAcuityData,
        printAbsenceData,
        printWorkStopData,
        selectedDiversDocument,
        printMedicalRecordData,
    ]);

    // Notify parent component when bilanFields change (backward compatibility)
    useEffect(() => {
        if (onBilanFieldsChange) {
            onBilanFieldsChange(bilanFields);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bilanFields]);

    // Debounced notify to parent component when any documents data changes
    useEffect(() => {
        if (!onDocumentsDataChange) return;
        if (suppressNotifyRef.current) return;

        const json = JSON.stringify(documentsDataToSend);
        if (lastSentJsonRef.current === json) return;

        const timer = setTimeout(() => {
            if (lastSentJsonRef.current !== json) {
                lastSentJsonRef.current = json;
                onDocumentsDataChange(documentsDataToSend);
            }
        }, 200); // debounce typing bursts

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentsDataToSend, onDocumentsDataChange]);

    return {
        // States
        bilanFields,
        setBilanFields,
        customFieldInputs,
        setCustomFieldInputs,
        printControlFlags,
        setPrintControlFlags,
        selectedDiversDocument,
        setSelectedDiversDocument,
        // Print states
        printPrescriptionData,
        setPrintPrescriptionData,
        printGlassesData,
        setPrintGlassesData,
        printContactLensesData,
        setPrintContactLensesData,
        printVisualAcuityData,
        setPrintVisualAcuityData,
        printWorkStopData,
        setPrintWorkStopData,
        printAbsenceData,
        setPrintAbsenceData,
        printMedicalRecordData,
        setPrintMedicalRecordData,
    };
};
