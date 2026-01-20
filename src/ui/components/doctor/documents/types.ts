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
        tgb: boolean;
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
        contactLensType: string;
        lensBrand: string;
    };
    leftEye: {
        sph: string;
        cyl: string;
        axis: string;
        diam: string;
        axis_k: string;
        contactLensType: string;
        lensBrand: string;
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

export interface WorkStopData {
    startDate: Date;
    endDate: Date;
    exitAuthorized: boolean;
}

