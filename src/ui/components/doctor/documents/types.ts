export interface BilanFields {
    bilanPreOp: {
        groupage: boolean;
        fnsTP: boolean;
        ionogramme: boolean;
        glycemie: boolean;
        ureeCreatinine: boolean;
        bilanHepatique: boolean;
        ecgCardiologie: boolean;
        customFields: string[];
    };
    bilanDiabete: {
        glycemieJeun: boolean;
        glycemiePostPrandiale: boolean;
        hbA1c: boolean;
        cholesterol: boolean;
        triglycerides: boolean;
        customFields: string[];
    };
    bilanInflammatoire: {
        fns: boolean;
        crp: boolean;
        fibrinogene: boolean;
        vs: boolean;
        electrophorese: boolean;
        customFields: string[];
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
        customFields: string[];
    };
}

export interface InternalBilanFields extends BilanFields { }

export interface PrintControlFlags {
    includeVisualAcuityWithCorrection: boolean;
    includeGlassType: boolean;
    includeFarVision: boolean;
    includeNearVision: boolean;
    includeRightEyeFar: boolean;
    includeLeftEyeFar: boolean;
    includeRightEyeNear: boolean;
    includeLeftEyeNear: boolean;
    includeRightEye?: boolean;
    includeLeftEye?: boolean;
    includeVisualAcuityWithoutCorrection?: boolean;
    includeTonometry?: boolean;
    [key: string]: any;
}

export interface GlassesPrintData {
    rightEye: {
        sph: string;
        cyl: string;
        axis: string;
        add: string;
        glassType: string;
        nearSph: string;
        nearCyl: string;
        nearAxis: string;
        emptyEyeOption?: 'plan' | 'conserver';
        emptyNearEyeOption?: 'plan' | 'conserver';
    };
    leftEye: {
        sph: string;
        cyl: string;
        axis: string;
        add: string;
        glassType: string;
        nearSph: string;
        nearCyl: string;
        nearAxis: string;
        emptyEyeOption?: 'plan' | 'conserver';
        emptyNearEyeOption?: 'plan' | 'conserver';
    };
}

export interface ContactLensesPrintData {
    rightEye: {
        sph: string;
        cyl: string;
        axis: string;
        diam: string;
        axis_k: string;
        k1?: string;
        k2?: string;
        contactLensType: string;
        lensBrand: string;
        lensType: string;
    };
    leftEye: {
        sph: string;
        cyl: string;
        axis: string;
        diam: string;
        axis_k: string;
        k1?: string;
        k2?: string;
        contactLensType: string;
        lensBrand: string;
        lensType: string;
    };
}

export interface ContactLensesPrintControlFlags {
    includeRightEye: boolean;
    includeLeftEye: boolean;
}

export interface ReportData {
    conclusion?: string;
    antecedents?: string; // Legacy/Compat
    generalMedicalHistory?: string;
    ophthalmologicalHistory?: string;
    inspection?: string;
    segmentAnterieur?: string;
    fondOeil?: string;
    visualAcuityVL_SC_OD?: string;
    visualAcuityVL_SC_OG?: string;
    visualAcuityVL_AC_OD?: string;
    visualAcuityVL_AC_OG?: string;
    // Print-specific overrides
    printVisualAcuityVL_SC_OD?: string;
    printVisualAcuityVL_SC_OG?: string;
    printVisualAcuityVL_AC_OD?: string;
    printVisualAcuityVL_AC_OG?: string;
    // Tonometry fields
    tonometryOD?: string;
    tonometryOG?: string;
    // Custom fields for additional content
    customTitle?: string;
    customText?: string;
}

export interface ReportPrintControlFlags {
    includeVisualAcuityWithoutCorrection: boolean;
    includeVisualAcuityWithCorrection: boolean;
    includeTonometry: boolean;
}

export interface WorkStopPrintData {
    startDate?: Date;
    endDate?: Date;
    exitAuthorized: boolean;
}

export interface AbsencePrintData {
    consultationDate: Date;
}

export interface VisualAcuityPrintData {
    visualAcuityVL_SC_OD: string;
    visualAcuityVL_SC_OG: string;
    visualAcuityVL_AC_OD: string;
    visualAcuityVL_AC_OG: string;
}

export interface WorkStopData {
    startDate: Date;
    endDate: Date;
    exitAuthorized: boolean;
}

export interface EyeData {
    visualAcuity: string;
    visualAcuityVL_SC: string; // Distance vision without correction
    visualAcuityVL_AC: string; // Distance vision with correction
    visualAcuityVP_SC: string; // Near vision without correction
    visualAcuityVP_AC: string; // Near vision with correction
    sph: string;
    cyl: string;
    axis: string;
    add: string;
    tension: string;
    tensionTime: string;
    pachymetry: string;
    k1: string;
    k2: string;
    axis_k: string;
    diam: string;
    pupillaryDistance: string;
    pd: string; // For the pupillary distance field
    objSph: string; // For objective refraction
    objCyl: string; // For objective refraction
    objAxis: string; // For objective refraction
    objAdd: string; // For objective refraction
    lensType: string; // For contact lens type
    lensBrand: string; // For contact lens brand
    glassType: string; // For glass type selection
    contactLensType: string; // For contact lens type (spherical/toric)
}

export interface DiagnosisData {
    primaryDiagnosis: string;
    secondaryDiagnosis: string;
    notes: string;
}

export interface Treatment {
    name: string;
    dosage: string;
    frequency: {
        value: number;
        unit: string;
    };
    duration: {
        value: number;
        unit: string;
    };
    customName?: string;
    customDosage?: string;
    instructions?: string;
    strength?: string;
    type?: string;
    packaging?: string;
    isNew?: boolean;
}

export interface PrescriptionData {
    treatments: Treatment[];
    notes?: string;
}

export interface ImageData {
    id: string;
    type: 'rightEye' | 'leftEye' | 'other';
    url: string;
    title: string;
    description: string;
    date: string;
}

export interface AnteriorSegmentData {
    slit_lamp_exam: string;
}

export interface TonometryData {
    iop: string;
    time?: string;
    pachymetry?: string;
    corrected_iop?: string;
}

// New interface for separate left and right eye tonometry
export interface TonometrieData {
    left_eye: TonometryData;
    right_eye: TonometryData;
}

export interface GonioscopyData {
    gonioscopy_notes: string;
}

export interface FundusData {
    fundus_exam: string;
}

export interface MedicalFileData {
    name: string;
    type: string;
    date: string;
    id?: string;
    url?: string;
}

export interface MedicalImagingData {
    radiography: MedicalFileData[];
    bilans: MedicalFileData[];
    notes: string;
}

export interface ContactLensData {
    lensType?: string;
    material?: string;
    opticalDesign?: string;
    curvatureRadius?: string;
    diameter?: string;
    sphericalPower?: string;
    cylinder?: string;
    axis?: string;
    addition?: string;
    centerThickness?: string;
    tint?: string;
    wearMode?: string;
    replacementFrequency?: string;
    careSolution?: string;
    deliveryDate?: string;
    replacementDate?: string;
    visualAcuityWithLens?: string;
    comfort?: string;
    compliance?: boolean;
    complications?: string[];
    notes?: string;
}

export interface NextAppointmentData {
    timeframe: string; // 48 hours, 5 days, 1 week, 15 jours, 1 month, 3 months, 4 months, 6 months, 1 year
    reason: string; // motif du rdv
    date: string;
}

export interface DetailedClinicalExamData {
    consultationReason: string;
    generalMedicalHistory: string;
    ophthalmologicalHistory: string;
    inspection: string;
    inspectionOD: string; // Right eye inspection
    inspectionOG: string; // Left eye inspection
    motilityExam: string;
    motilityExamOD: string; // Right eye motility
    motilityExamOG: string; // Left eye motility
    diagnosis: string;
    diagnosisOD: string; // Right eye diagnosis
    diagnosisOG: string; // Left eye diagnosis
    treatmentPlan: string;
    treatmentPlanOD: string; // Right eye treatment plan
    treatmentPlanOG: string; // Left eye treatment plan
    profile?: string;
    anteriorSegment: AnteriorSegmentData;
    anteriorSegmentOD: string; // Right eye anterior segment
    anteriorSegmentOG: string; // Left eye anterior segment
    gonioscopy: GonioscopyData;
    fundus: FundusData;
    fundusOD: string; // Right eye fundus
    fundusOG: string; // Left eye fundus
    medicalImaging: MedicalImagingData;
    nextAppointment?: NextAppointmentData;
    contactLens: {
        right: ContactLensData;
        left: ContactLensData;
    };
    // Documents data from DocumentsSection
    documentsData?: {
        reportData?: {
            conclusion: string;
            antecedents: string;
            inspection: string;
            segmentAnterieur: string;
            fondOeil: string;
            visualAcuityVL_SC_OD?: string;
            visualAcuityVL_SC_OG?: string;
            visualAcuityVL_AC_OD?: string;
            visualAcuityVL_AC_OG?: string;
        };
        absenceData?: { date: Date; reason: string };
        workStopData?: {
            startDate?: Date;
            endDate?: Date;
            reason?: string;
            exitAuthorized?: boolean;
        };
        bilanFields?: any; // Internal bilan fields structure
    };
}

export interface ConsultationData {
    leftEye: EyeData;
    rightEye: EyeData;
    diagnosis: DiagnosisData;
    prescription: PrescriptionData;
    images: ImageData[];
    clinicalExam: string;
    detailedClinicalExam?: DetailedClinicalExamData;
    tonometrie?: TonometrieData;
    dilatationRequired: boolean;
    date: string;
    contactLens?: {
        right?: ContactLensData;
        left?: ContactLensData;
    };
    paymentInfo?: {
        amount: number;
        status: string;
        type: string;
    };
}

// Redefine UserRole locally since we don't import from backend types
export enum UserRole {
    DOCTOR = 'DOCTOR',
    SECRETARY = 'SECRETARY',
    ADMIN = 'ADMIN',
    RECEPTIONIST = 'RECEPTIONIST',
}

// Redefine DilationStatus locally
export enum DilationStatus {
    NON_DILATE = 'non dilate',
    EN_COURS = 'en cours',
    DILATE = 'dilate',
}

export interface Patient {
    id: string;
    name: string;
    surname: string;
    dob: string;
    personne?: string;
    address?: Record<string, unknown>;
    phone_number?: string;
    phoneNumber?: string;
    phone?: string;
    email?: string;
    blood_type?: string;
    consultation_start?: string;
    medical_history?: string;
    needs_dilation?: boolean;
    dilation_status?: DilationStatus;
    is_dilated?: boolean;
    dilation_completed_at?: string;
    dilation_type?: string;
    consultation_data?: Record<string, unknown>;
    payment_info?: Record<string, unknown>;
    notes?: string;
    created_at: string;
    updated_at: string;
    doctor_id?: string | null;
}

export interface DoctorDashboardProps {
    currentPatient: Patient | null;
    onSaveConsultation: (patientId: string, data: ConsultationData) => void;
    onBackToPatientList: () => void;
    onPaymentComplete?: (patientId: string) => void;
    readOnly?: boolean;
    hideBackButton?: boolean;
    initialConsultationData?: ConsultationData;
    viewingMode?: boolean; // When true, indicates viewing from DossiersMedicauxPage
    consultationId?: string; // ID of the consultation being edited (for updates)
}

export interface OptionType {
    value: string;
    label: string;
    category?: string;
}

export interface FrequencyUnit {
    value: string;
    label: string;
}

export interface DurationUnit {
    value: string;
    label: string;
}

export interface TreatmentComponentProps {
    treatment: Treatment;
    index: number;
    commonMedications: OptionType[];
    commonDosages: OptionType[];
    frequencyUnits: FrequencyUnit[];
    durationUnits: DurationUnit[];
    handleTreatmentChange: (
        index: number,
        field: string,
        value: string | number | object
    ) => void;
    handleFrequencyChange: (
        index: number,
        key: 'value' | 'unit',
        value: number | string
    ) => void;
    handleDurationChange: (
        index: number,
        key: 'value' | 'unit',
        value: number | string
    ) => void;
    handleRemoveTreatment: (index: number) => void;
}

export interface EyeDataComponentProps {
    eyeData: EyeData;
    eyeSide: 'left' | 'right';
    handleEyeChange: (field: string, value: string) => void;
    visualAcuityOptionsSC: OptionType[]; // Sans Correction
    visualAcuityOptionsAC: OptionType[]; // Avec Correction
    visualAcuityOptionsNear: OptionType[];
    sphereValues: OptionType[];
    cylinderValues: OptionType[];
    axisValues: OptionType[];
    addValues: OptionType[];
    keratometryValues: OptionType[];
    pdValues: OptionType[];
    pachymetryValues: OptionType[];
    iopValues: OptionType[];
    findOptionByValue: (
        options: OptionType[],
        value: string
    ) => OptionType | undefined;
    readOnly?: boolean;
    isLoadingData?: boolean; // Prevents automation during data loading
}

// New interfaces for multi-tab consultation
export interface ConsultationTab {
    id: string;
    patient: Patient;
    isActive: boolean;
    hasUnsavedChanges: boolean;
    consultationData?: ConsultationData;
}

export interface MultiTabConsultationProps {
    openTabs: ConsultationTab[];
    onSaveConsultation: (patientId: string, data: ConsultationData) => void;
    onCloseTab: (tabId: string) => void;
    onSwitchTab: (tabId: string) => void;
    onBackToPatientList: () => void;
    onPaymentComplete?: (patientId: string) => void;
}
