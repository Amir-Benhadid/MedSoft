export interface PrintControlFlags {
    includeVisualAcuityWithCorrection?: boolean;
    includeVisualAcuityWithoutCorrection?: boolean;
    includeGlassType?: boolean;
    includeFarVision?: boolean;
    includeNearVision?: boolean;
    includeRightEye?: boolean;
    includeLeftEye?: boolean;
    includeRightEyeFar?: boolean;
    includeLeftEyeFar?: boolean;
    includeRightEyeNear?: boolean;
    includeLeftEyeNear?: boolean;
    includeTonometry?: boolean;
}

export interface InternalBilanFields {
    [key: string]: any;
}

export interface PrescriptionData {
    treatments: any[];
    notes: string;
}

export interface GlassesPrintData {
    leftEye?: any;
    rightEye?: any;
    [key: string]: any;
}

export interface ContactLensesPrintData {
    leftEye?: any;
    rightEye?: any;
    [key: string]: any;
}

export interface VisualAcuityPrintData {
    [key: string]: any;
}

export interface WorkStopData {
    startDate?: Date | string;
    endDate?: Date | string;
    exitAuthorized?: boolean;
    isProlongation?: boolean;
    isReprise?: boolean;
}

export interface WorkStopPrintData extends WorkStopData {}

export interface ReportData {
    [key: string]: any;
}

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
        absenceData?: { date: Date | string; reason: string };
        workStopData?: WorkStopData;
        printStates?: {
            printPrescriptionData?: PrescriptionData;
            printGlassesData?: GlassesPrintData;
            printContactLensesData?: ContactLensesPrintData;
            printVisualAcuityData?: VisualAcuityPrintData;
            printAbsenceData?: { consultationDate: Date | string };
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
    absence?: { consultationDate: Date | string };
    medicalRecord?: { documentType: string; printData: Record<string, unknown> };
    divers?: unknown;
    generic?: unknown;
    customGeneric?: { title: string; text: string };
    selectedGenericTemplate?: string;
    printed?: string[];
    radiography_dynamic?: unknown;
    certificatAcuite?: unknown;
}
