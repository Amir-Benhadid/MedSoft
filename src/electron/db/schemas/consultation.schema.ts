/**
 * Consultation Schema
 * 
 * Defines Zod schemas for validating consultation data structures, including
 * eye measurements, clinical exams, prescriptions, and document metadata.
 * Provides type-safe validation for all consultation-related data.
 */

import { z } from 'zod';

const OptionTypeSchema = z.object({
    value: z.string(),
    label: z.string(),
    category: z.string().optional(),
});

/**
 * Schema for eye measurement data including visual acuity, refraction,
 * tension, and lens information.
 */
export const EyeDataSchema = z.object({
    visualAcuity: z.string().optional().default(''),
    visualAcuityVL_SC: z.string().optional().default(''),
    visualAcuityVL_AC: z.string().optional().default(''),
    visualAcuityVP_SC: z.string().optional().default(''),
    visualAcuityVP_AC: z.string().optional().default(''),
    sph: z.string().optional().default(''),
    cyl: z.string().optional().default(''),
    axis: z.string().optional().default(''),
    add: z.string().optional().default(''),
    tension: z.string().optional().default(''),
    tensionTime: z.string().optional().default(''),
    pachymetry: z.string().optional().default(''),
    corrected_iop: z.string().optional().default(''),
    tensionApplanation: z.string().optional().default(''),
    k1: z.string().optional().default(''),
    k2: z.string().optional().default(''),
    axis_k: z.string().optional().default(''),
    rayon: z.string().optional().default(''),
    diam: z.string().optional().default(''),
    pupillaryDistance: z.string().optional().default(''),
    pd: z.string().optional().default(''),
    objSph: z.string().optional().default(''),
    objCyl: z.string().optional().default(''),
    objAxis: z.string().optional().default(''),
    objAdd: z.string().optional().default(''),
    lensType: z.string().optional().default(''),
    lensBrand: z.string().optional().default(''),
    glassType: z.string().optional().default(''),
    contactLensType: z.string().optional().default(''),
});

/**
 * Schema for tonometry (intraocular pressure) measurement data.
 */
export const TonometryDataSchema = z.object({
    iop: z.string().default(''),
    time: z.string().optional().default(''),
    pachymetry: z.string().optional().default(''),
    corrected_iop: z.string().optional().default(''),
});

/**
 * Schema for tonometry data for both eyes.
 */
export const TonometrieDataSchema = z.object({
    left_eye: TonometryDataSchema.default({ iop: '', time: '', pachymetry: '', corrected_iop: '' }),
    right_eye: TonometryDataSchema.default({ iop: '', time: '', pachymetry: '', corrected_iop: '' }),
});

/**
 * Schema for a single treatment/prescription item.
 */
export const TreatmentSchema = z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.union([
        z.string(),
        z.object({
            value: z.number(),
            unit: z.string(),
        })
    ]),
    duration: z.union([
        z.string(),
        z.object({
            value: z.number(),
            unit: z.string(),
        })
    ]),
    customName: z.string().optional(),
    customDosage: z.string().optional(),
    instructions: z.string().optional(),
    strength: z.string().optional(),
    type: z.string().optional(),
    packaging: z.string().optional(),
});

/**
 * Schema for prescription data containing multiple treatments.
 */
export const PrescriptionDataSchema = z.object({
    treatments: z.array(TreatmentSchema).default([]),
    notes: z.string().optional().default(''),
});

/**
 * Schema for document metadata including reports, absence certificates,
 * and work stop certificates.
 */
export const DocumentsDataSchema = z.object({
    reportData: z.object({
        conclusion: z.string().default(''),
        antecedents: z.string().default(''),
        inspection: z.string().default(''),
        segmentAnterieur: z.string().default(''),
        fondOeil: z.string().default(''),
    }).optional(),
    absenceData: z.object({
        date: z.string(), // ISO date string preferred for JSON
        reason: z.string().default(''),
    }).optional(),
    workStopData: z.object({
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string().default(''),
        exitAuthorized: z.boolean().default(true),
    }).optional(),
    bilanFields: z.any().optional(),
    printed: z.array(z.string()).default([]),
});

/**
 * Schema for contact lens fitting and prescription data.
 */
export const ContactLensDataSchema = z.object({
    lensType: z.string().optional(),
    material: z.string().optional(),
    opticalDesign: z.string().optional(),
    curvatureRadius: z.string().optional(),
    diameter: z.string().optional(),
    sphericalPower: z.string().optional(),
    cylinder: z.string().optional(),
    axis: z.string().optional(),
    addition: z.string().optional(),
    centerThickness: z.string().optional(),
    tint: z.string().optional(),
    wearMode: z.string().optional(),
    replacementFrequency: z.string().optional(),
    careSolution: z.string().optional(),
    deliveryDate: z.string().optional(),
    replacementDate: z.string().optional(),
    visualAcuityWithLens: z.string().optional(),
    comfort: z.string().optional(),
    compliance: z.boolean().optional(),
    complications: z.array(z.string()).optional(),
    notes: z.string().optional(),
});

/**
 * Schema for detailed clinical examination data including history,
 * inspection, diagnosis, treatment plans, and specialized exams.
 */
export const DetailedClinicalExamDataSchema = z.object({
    consultationReason: z.string().default(''),
    generalMedicalHistory: z.string().default(''),
    ophthalmologicalHistory: z.string().default(''),
    inspection: z.string().default(''),
    inspectionOD: z.string().default(''),
    inspectionOG: z.string().default(''),
    motilityExam: z.string().default(''),
    motilityExamOD: z.string().default(''),
    motilityExamOG: z.string().default(''),
    // Diagnosis fields merged here
    diagnosis: z.string().default(''),
    diagnosisOD: z.string().default(''),
    diagnosisOG: z.string().default(''),
    treatmentPlan: z.string().default(''),
    treatmentPlanOD: z.string().default(''),
    treatmentPlanOG: z.string().default(''),
    profile: z.string().optional(),
    anteriorSegment: z.object({
        slit_lamp_exam: z.string().default(''),
    }).default({ slit_lamp_exam: '' }),
    anteriorSegmentOD: z.string().default(''),
    anteriorSegmentOG: z.string().default(''),
    gonioscopy: z.object({
        gonioscopy_notes: z.string().default(''),
    }).default({ gonioscopy_notes: '' }),
    fundus: z.object({
        fundus_exam: z.string().default(''),
    }).default({ fundus_exam: '' }),
    fundusOD: z.string().default(''),
    fundusOG: z.string().default(''),
    medicalImaging: z.object({
        radiography: z.array(z.any()).default([]), // Define more strict if needed
        bilans: z.array(z.any()).default([]),
        notes: z.string().default(''),
    }).default({ radiography: [], bilans: [], notes: '' }),
    nextAppointment: z.object({
        timeframe: z.string().default(''),
        reason: z.string().default(''),
        date: z.string().default(''),
    }).optional(),
    contactLens: z.object({
        right: ContactLensDataSchema.default({}),
        left: ContactLensDataSchema.default({}),
    }).default({ right: {}, left: {} }),
});

/**
 * Main schema for a complete consultation record.
 * Includes all eye measurements, clinical exam data, prescriptions, and metadata.
 */
export const ConsultationSchema = z.object({
    id: z.string(),
    patient_id: z.string(),
    date: z.string(),
    type: z.string().optional().default('Consultation'),
    status: z.enum(['pending', 'completed']).default('pending'),
    exclude_from_stats: z.boolean().optional().default(false),

    // JSON Columns
    left_eye: EyeDataSchema.default({
        visualAcuity: '', visualAcuityVL_SC: '', visualAcuityVL_AC: '', visualAcuityVP_SC: '', visualAcuityVP_AC: '',
        sph: '', cyl: '', axis: '', add: '', tension: '', tensionTime: '', pachymetry: '', corrected_iop: '', tensionApplanation: '', k1: '', k2: '', axis_k: '',
        rayon: '', diam: '', pupillaryDistance: '', pd: '', objSph: '', objCyl: '', objAxis: '', objAdd: '', lensType: '', lensBrand: '',
        glassType: '', contactLensType: ''
    }),
    right_eye: EyeDataSchema.default({
        visualAcuity: '', visualAcuityVL_SC: '', visualAcuityVL_AC: '', visualAcuityVP_SC: '', visualAcuityVP_AC: '',
        sph: '', cyl: '', axis: '', add: '', tension: '', tensionTime: '', pachymetry: '', corrected_iop: '', tensionApplanation: '', k1: '', k2: '', axis_k: '',
        rayon: '', diam: '', pupillaryDistance: '', pd: '', objSph: '', objCyl: '', objAxis: '', objAdd: '', lensType: '', lensBrand: '',
        glassType: '', contactLensType: ''
    }),
    tonometrie_data: TonometrieDataSchema.default({
        left_eye: { iop: '', time: '', pachymetry: '', corrected_iop: '' },
        right_eye: { iop: '', time: '', pachymetry: '', corrected_iop: '' }
    }),
    clinical_exam: DetailedClinicalExamDataSchema.default({
        consultationReason: '', generalMedicalHistory: '', ophthalmologicalHistory: '', inspection: '', inspectionOD: '', inspectionOG: '',
        motilityExam: '', motilityExamOD: '', motilityExamOG: '', diagnosis: '', diagnosisOD: '', diagnosisOG: '', treatmentPlan: '',
        treatmentPlanOD: '', treatmentPlanOG: '', anteriorSegment: { slit_lamp_exam: '' }, anteriorSegmentOD: '', anteriorSegmentOG: '',
        gonioscopy: { gonioscopy_notes: '' }, fundus: { fundus_exam: '' }, fundusOD: '', fundusOG: '',
        medicalImaging: { radiography: [], bilans: [], notes: '' }, contactLens: { right: {}, left: {} }
    }),
    prescription: PrescriptionDataSchema.default({ treatments: [], notes: '' }),
    documents_data: DocumentsDataSchema.optional(),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

/**
 * Schema for creating a new consultation.
 * Omits generated fields (id, timestamps) and allows optional nested data.
 * Includes payment and antecedents data for creation.
 */
export const CreateConsultationSchema = ConsultationSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    // Allow optional for creation, defaults will apply
    left_eye: true,
    right_eye: true,
    tonometrie_data: true,
    clinical_exam: true,
    prescription: true,
}).extend({
    left_eye: EyeDataSchema.optional(),
    right_eye: EyeDataSchema.optional(),
    tonometrie_data: TonometrieDataSchema.optional(),
    clinical_exam: DetailedClinicalExamDataSchema.optional(),
    prescription: PrescriptionDataSchema.optional(),
    payment: z.object({
        amount: z.number(),
        type: z.string(),
        method: z.string().optional(),
        consultation_type_id: z.number().optional(),
    }).optional(),
    antecedents: z.object({
        oph_ants: z.string().optional(),
        gen_ants: z.string().optional(),
    }).optional(),
});
