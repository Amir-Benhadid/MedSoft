/**
 * Unit tests for consultationStore
 *
 * Tests all state actions, side effects, document syncing,
 * and helper utilities exported from the store.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useConsultationStore, formatNumberWithSign, mergeTags } from '@/ui/store/consultationStore';

// ─── Mock lentilleService ───────────────────────────────────────────────────
vi.mock('@/ui/services/LentilleService', () => ({
    lentilleService: {
        convertToContactLens: vi.fn().mockResolvedValue({
            sphere: -1.5,
            cylinder: -0.5,
            axis: 90,
        }),
    },
}));

// ─── Helper: fresh store ─────────────────────────────────────────────────────
const resetStore = () => {
    act(() => {
        useConsultationStore.getState().reset();
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. formatNumberWithSign
// ═══════════════════════════════════════════════════════════════════════════════
describe('formatNumberWithSign', () => {
    it('returns empty string for empty input', () => {
        expect(formatNumberWithSign('')).toBe('');
        expect(formatNumberWithSign(undefined as any)).toBe('');
        expect(formatNumberWithSign(null as any)).toBe('');
    });

    it('formats zero as "0.00"', () => {
        expect(formatNumberWithSign(0)).toBe('0.00');
        expect(formatNumberWithSign('0')).toBe('0.00');
        expect(formatNumberWithSign('0.00')).toBe('0.00');
    });

    it('formats positive numbers with + prefix', () => {
        expect(formatNumberWithSign(1.25)).toBe('+1.25');
        expect(formatNumberWithSign('1.25')).toBe('+1.25');
        expect(formatNumberWithSign('+2.50')).toBe('+2.50');
    });

    it('formats negative numbers without + prefix', () => {
        expect(formatNumberWithSign(-1.25)).toBe('-1.25');
        expect(formatNumberWithSign('-2.50')).toBe('-2.50');
        expect(formatNumberWithSign(-0.75)).toBe('-0.75');
    });

    it('handles comma as decimal separator', () => {
        expect(formatNumberWithSign('1,25')).toBe('+1.25');
        expect(formatNumberWithSign('-1,25')).toBe('-1.25');
    });

    it('returns non-numeric values as-is', () => {
        expect(formatNumberWithSign('CLD')).toBe('CLD');
        expect(formatNumberWithSign('PL+')).toBe('PL+');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. mergeTags
// ═══════════════════════════════════════════════════════════════════════════════
describe('mergeTags', () => {
    it('combines new source tags and preserves manual additions', () => {
        const result = mergeTags(
            'Glaucome, Cataracte',         // newSourceTags
            '',                              // previousSourceTags
            'ManualTag'                      // currentDocumentTags
        );
        expect(result).toContain('ManualTag');
        expect(result).toContain('Glaucome');
        expect(result).toContain('Cataracte');
    });

    it('removes tags that were in previous but not new source', () => {
        const result = mergeTags(
            'Glaucome',          // new source (removed Cataracte)
            'Glaucome, Cataracte', // previous source
            'Glaucome, Cataracte'  // current document (matches previous)
        );
        // Cataracte was not manually added (it came from previous source), so removed
        expect(result).toContain('Glaucome');
        expect(result).not.toContain('Cataracte');
    });

    it('preserves manually added tags even when source changes', () => {
        const result = mergeTags(
            '',                    // new source (empty)
            'Glaucome',            // previous source
            'Glaucome, ManualTag'  // current doc (ManualTag was manually added)
        );
        expect(result).toContain('ManualTag');
        expect(result).not.toContain('Glaucome');
    });

    it('handles empty inputs without crashing', () => {
        expect(mergeTags('', '', '')).toBe('');
        expect(mergeTags('A', '', '')).toBe('A');
    });

    it('deduplicates case-insensitively', () => {
        const result = mergeTags('glaucome', '', 'Glaucome');
        const count = result.split(',').filter(t => t.trim().toLowerCase() === 'glaucome').length;
        expect(count).toBe(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Store – initial state
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – initial state', () => {
    beforeEach(resetStore);

    it('has empty eye data by default', () => {
        const { leftEye, rightEye } = useConsultationStore.getState();
        expect(leftEye.sph).toBe('');
        expect(rightEye.tension).toBe('');
        expect(leftEye.visualAcuity).toBe('');
    });

    it('has empty clinical exam by default', () => {
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.inspection).toBe('');
        expect(clinicalExam.diagnosis).toBe('');
        expect(clinicalExam.generalMedicalHistory).toBe('');
    });

    it('has empty prescriptions by default', () => {
        expect(useConsultationStore.getState().prescriptions).toHaveLength(0);
    });

    it('has dilatationRequired false by default', () => {
        expect(useConsultationStore.getState().dilatationRequired).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Store – setPatientId / setPatient
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – patient actions', () => {
    beforeEach(resetStore);

    it('sets patient ID', () => {
        act(() => useConsultationStore.getState().setPatientId('patient-1'));
        expect(useConsultationStore.getState().patientId).toBe('patient-1');
    });

    it('sets patient object', () => {
        const patient = { id: '1', name: 'Dupont', surname: 'Jean' };
        act(() => useConsultationStore.getState().setPatient(patient));
        expect(useConsultationStore.getState().patient).toEqual(patient);
    });

    it('clears patient ID with null', () => {
        act(() => {
            useConsultationStore.getState().setPatientId('patient-1');
            useConsultationStore.getState().setPatientId(null);
        });
        expect(useConsultationStore.getState().patientId).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Store – eye data actions
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – eye data actions', () => {
    beforeEach(resetStore);

    it('updates left eye field individually', () => {
        act(() => useConsultationStore.getState().updateLeftEyeField('sph', '-1.25'));
        expect(useConsultationStore.getState().leftEye.sph).toBe('-1.25');
    });

    it('updates right eye field individually', () => {
        act(() => useConsultationStore.getState().updateRightEyeField('tension', '16'));
        expect(useConsultationStore.getState().rightEye.tension).toBe('16');
    });

    it('objSph update also syncs sph field', () => {
        act(() => useConsultationStore.getState().updateLeftEyeField('objSph', '-2.00'));
        const { leftEye } = useConsultationStore.getState();
        expect(leftEye.objSph).toBe('-2.00');
        expect(leftEye.sph).toBe('-2.00');
    });

    it('objCyl update also syncs cyl field', () => {
        act(() => useConsultationStore.getState().updateRightEyeField('objCyl', '-0.75'));
        const { rightEye } = useConsultationStore.getState();
        expect(rightEye.objCyl).toBe('-0.75');
        expect(rightEye.cyl).toBe('-0.75');
    });

    it('glassType update propagates to both eyes', () => {
        act(() => useConsultationStore.getState().updateLeftEyeField('glassType', 'Progressifs'));
        const state = useConsultationStore.getState();
        expect(state.leftEye.glassType).toBe('Progressifs');
        expect(state.rightEye.glassType).toBe('Progressifs');
    });

    it('setLeftEye merges with existing data', () => {
        act(() => {
            useConsultationStore.getState().updateLeftEyeField('tension', '15');
            useConsultationStore.getState().setLeftEye({ sph: '-1.00' });
        });
        const { leftEye } = useConsultationStore.getState();
        expect(leftEye.tension).toBe('15');
        expect(leftEye.sph).toBe('-1.00');
    });

    it('setRightEye merges with existing data', () => {
        act(() => {
            useConsultationStore.getState().updateRightEyeField('tension', '18');
            useConsultationStore.getState().setRightEye({ cyl: '-0.50' });
        });
        const { rightEye } = useConsultationStore.getState();
        expect(rightEye.tension).toBe('18');
        expect(rightEye.cyl).toBe('-0.50');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Store – clinical exam actions
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – clinical exam actions', () => {
    beforeEach(resetStore);

    it('updates top-level clinical exam field', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('inspection', 'Normal'));
        expect(useConsultationStore.getState().clinicalExam.inspection).toBe('Normal');
    });

    it('inspection update also syncs inspectionOD and inspectionOG', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('inspection', 'RAS'));
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.inspectionOD).toBe('RAS');
        expect(clinicalExam.inspectionOG).toBe('RAS');
    });

    it('diagnosis update also syncs diagnosisOD and diagnosisOG', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('diagnosis', 'Glaucome'));
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.diagnosisOD).toBe('Glaucome');
        expect(clinicalExam.diagnosisOG).toBe('Glaucome');
    });

    it('treatmentPlan update also syncs treatmentPlanOD and treatmentPlanOG', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('treatmentPlan', 'Collyre'));
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.treatmentPlanOD).toBe('Collyre');
        expect(clinicalExam.treatmentPlanOG).toBe('Collyre');
    });

    it('motilityExam update syncs motilityExamOD and motilityExamOG', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('motilityExam', 'Normal'));
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.motilityExamOD).toBe('Normal');
        expect(clinicalExam.motilityExamOG).toBe('Normal');
    });

    it('nested field update (anteriorSegment.slit_lamp_exam)', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('anteriorSegment.slit_lamp_exam', 'Normal'));
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.anteriorSegment?.slit_lamp_exam).toBe('Normal');
        expect(clinicalExam.anteriorSegmentOD).toBe('Normal');
        expect(clinicalExam.anteriorSegmentOG).toBe('Normal');
    });

    it('nested field update (fundus.fundus_exam)', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('fundus.fundus_exam', 'RAS'));
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.fundus?.fundus_exam).toBe('RAS');
        expect(clinicalExam.fundusOD).toBe('RAS');
        expect(clinicalExam.fundusOG).toBe('RAS');
    });

    it('setClinicalExam merges with existing data', () => {
        act(() => {
            useConsultationStore.getState().updateClinicalExamField('inspection', 'Normal');
            useConsultationStore.getState().setClinicalExam({ diagnosis: 'Myopie' });
        });
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.inspection).toBe('Normal');
        expect(clinicalExam.diagnosis).toBe('Myopie');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Store – dilatation
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – dilatation', () => {
    beforeEach(resetStore);

    it('sets dilatation required to true', () => {
        act(() => useConsultationStore.getState().setDilatationRequired(true));
        expect(useConsultationStore.getState().dilatationRequired).toBe(true);
    });

    it('sets dilatation required to false', () => {
        act(() => {
            useConsultationStore.getState().setDilatationRequired(true);
            useConsultationStore.getState().setDilatationRequired(false);
        });
        expect(useConsultationStore.getState().dilatationRequired).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Store – prescriptions
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – prescriptions', () => {
    beforeEach(resetStore);

    it('adds a new empty prescription', () => {
        act(() => useConsultationStore.getState().addPrescription());
        const { prescriptions } = useConsultationStore.getState();
        expect(prescriptions).toHaveLength(1);
        expect(prescriptions[0].name).toBe('');
        expect(prescriptions[0].dosage).toBe('');
    });

    it('adds multiple prescriptions and each has a unique id', () => {
        act(() => {
            useConsultationStore.getState().addPrescription();
            useConsultationStore.getState().addPrescription();
        });
        const { prescriptions } = useConsultationStore.getState();
        expect(prescriptions).toHaveLength(2);
        expect(prescriptions[0].id).not.toBe(prescriptions[1].id);
    });

    it('new prescription is prepended (appears first)', () => {
        act(() => {
            useConsultationStore.getState().addPrescription();
            const id1 = useConsultationStore.getState().prescriptions[0].id;
            useConsultationStore.getState().updatePrescription(id1, 'name', 'Paracétamol');
            useConsultationStore.getState().addPrescription();
        });
        const { prescriptions } = useConsultationStore.getState();
        // New prescription is at index 0
        expect(prescriptions[0].name).toBe('');
        expect(prescriptions[1].name).toBe('Paracétamol');
    });

    it('updates a prescription field by id', () => {
        act(() => useConsultationStore.getState().addPrescription());
        const id = useConsultationStore.getState().prescriptions[0].id;
        act(() => useConsultationStore.getState().updatePrescription(id, 'name', 'Amoxicilline'));
        expect(useConsultationStore.getState().prescriptions[0].name).toBe('Amoxicilline');
    });

    it('updates prescription dosage, frequency, duration, instructions', () => {
        act(() => useConsultationStore.getState().addPrescription());
        const id = useConsultationStore.getState().prescriptions[0].id;
        act(() => {
            useConsultationStore.getState().updatePrescription(id, 'dosage', '500mg');
            useConsultationStore.getState().updatePrescription(id, 'frequency', '3x/jour');
            useConsultationStore.getState().updatePrescription(id, 'duration', '7 jours');
            useConsultationStore.getState().updatePrescription(id, 'instructions', 'Avec les repas');
        });
        const p = useConsultationStore.getState().prescriptions[0];
        expect(p.dosage).toBe('500mg');
        expect(p.frequency).toBe('3x/jour');
        expect(p.duration).toBe('7 jours');
        expect(p.instructions).toBe('Avec les repas');
    });

    it('removes a prescription by id', () => {
        act(() => useConsultationStore.getState().addPrescription());
        const id = useConsultationStore.getState().prescriptions[0].id;
        act(() => useConsultationStore.getState().removePrescription(id));
        expect(useConsultationStore.getState().prescriptions).toHaveLength(0);
    });

    it('removing a non-existent id leaves prescriptions unchanged', () => {
        act(() => {
            useConsultationStore.getState().addPrescription();
            useConsultationStore.getState().removePrescription('non-existent-id');
        });
        expect(useConsultationStore.getState().prescriptions).toHaveLength(1);
    });

    it('setPrescriptions replaces the full list', () => {
        const items = [
            { id: '1', name: 'Ibuprofène', dosage: '400mg', frequency: '2x/j', duration: '5j', instructions: '' },
        ];
        act(() => useConsultationStore.getState().setPrescriptions(items));
        expect(useConsultationStore.getState().prescriptions).toEqual(items);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Store – document overrides
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – document overrides', () => {
    beforeEach(resetStore);

    it('setDocumentOverride creates a new document entry', () => {
        act(() => useConsultationStore.getState().setDocumentOverride('report', { title: 'Test' }));
        expect(useConsultationStore.getState().documentOverrides.report).toEqual({ title: 'Test' });
    });

    it('updateDocumentOverride updates a specific field', () => {
        act(() => {
            useConsultationStore.getState().setDocumentOverride('report', { title: 'Original' });
            useConsultationStore.getState().updateDocumentOverride('report', 'title', 'Updated');
        });
        expect(useConsultationStore.getState().documentOverrides.report.title).toBe('Updated');
    });

    it('updateDocumentOverride preserves other fields in the document', () => {
        act(() => {
            useConsultationStore.getState().setDocumentOverride('report', { title: 'T', body: 'B' });
            useConsultationStore.getState().updateDocumentOverride('report', 'title', 'New');
        });
        const doc = useConsultationStore.getState().documentOverrides.report;
        expect(doc.title).toBe('New');
        expect(doc.body).toBe('B');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Store – reset
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – reset', () => {
    it('clears all state back to defaults', () => {
        act(() => {
            useConsultationStore.getState().setPatientId('p1');
            useConsultationStore.getState().updateLeftEyeField('sph', '-1.25');
            useConsultationStore.getState().updateClinicalExamField('inspection', 'Normal');
            useConsultationStore.getState().addPrescription();
            useConsultationStore.getState().setDilatationRequired(true);
            useConsultationStore.getState().setDocumentOverride('report', { a: 1 });
        });

        act(() => useConsultationStore.getState().reset());

        const state = useConsultationStore.getState();
        expect(state.patientId).toBeNull();
        expect(state.consultationId).toBeNull();
        expect(state.patient).toBeNull();
        expect(state.leftEye.sph).toBe('');
        expect(state.clinicalExam.inspection).toBe('');
        expect(state.prescriptions).toHaveLength(0);
        expect(state.dilatationRequired).toBe(false);
        expect(state.documentOverrides).toEqual({});
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. Store – loadConsultation
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – loadConsultation', () => {
    beforeEach(resetStore);

    const mockConsultation = {
        id: 'cons-1',
        patient_id: 'patient-1',
        left_eye: { sph: '-1.00', tension: '14', cyl: '-0.50' },
        right_eye: { sph: '+0.50', tension: '16' },
        clinical_exam: {
            inspection: 'Normal',
            diagnosis: 'Myopie',
            dilatationRequired: true,
        },
        prescription: {
            treatments: [
                { id: '1', name: 'Timolol', dosage: '0.5%', frequency: '2x/j', duration: '30j', instructions: '' }
            ]
        },
        documents_data: { report: { title: 'Rapport' } },
    };

    it('loads consultation data into store', () => {
        act(() => useConsultationStore.getState().loadConsultation(mockConsultation));
        const state = useConsultationStore.getState();

        expect(state.consultationId).toBe('cons-1');
        expect(state.patientId).toBe('patient-1');
        expect(state.leftEye.sph).toBe('-1.00');
        expect(state.rightEye.sph).toBe('+0.50');
        expect(state.clinicalExam.inspection).toBe('Normal');
        expect(state.prescriptions).toHaveLength(1);
        expect(state.prescriptions[0].name).toBe('Timolol');
        expect(state.dilatationRequired).toBe(true);
        expect(state.documentOverrides.report.title).toBe('Rapport');
    });

    it('handles missing left_eye/right_eye gracefully with defaults', () => {
        const minimal = {
            id: 'c2',
            patient_id: 'p2',
            left_eye: null,
            right_eye: undefined,
            clinical_exam: {},
            prescription: null,
            documents_data: null,
        };
        act(() => useConsultationStore.getState().loadConsultation(minimal));
        const state = useConsultationStore.getState();
        expect(state.leftEye.sph).toBe('');
        expect(state.rightEye.tension).toBe('');
        expect(state.prescriptions).toHaveLength(0);
    });

    it('handles missing prescription.treatments with empty array', () => {
        const noRx = { ...mockConsultation, prescription: { treatments: undefined } };
        act(() => useConsultationStore.getState().loadConsultation(noRx));
        expect(useConsultationStore.getState().prescriptions).toHaveLength(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. Store – document sync on eye field change
// ═══════════════════════════════════════════════════════════════════════════════
describe('consultationStore – document sync', () => {
    beforeEach(resetStore);

    it('syncs glasses data when sph changes', () => {
        act(() => useConsultationStore.getState().updateRightEyeField('sph', '-1.25'));
        const overrides = useConsultationStore.getState().documentOverrides;
        expect(overrides?.unifiedDocumentsState?.printStates?.printGlassesData?.rightEye?.sph).toBe('-1.25');
    });

    it('syncs visual acuity data when visualAcuityVL_SC changes', () => {
        act(() => useConsultationStore.getState().updateLeftEyeField('visualAcuityVL_SC', '8/10'));
        const overrides = useConsultationStore.getState().documentOverrides;
        expect(overrides?.unifiedDocumentsState?.printStates?.printVisualAcuityData?.visualAcuityVL_SC_OG).toBe('8/10');
    });

    it('syncs report inspection when clinicalExam.inspection changes', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('inspection', 'Anomalie détectée'));
        const overrides = useConsultationStore.getState().documentOverrides;
        expect(overrides?.report?.inspection).toBe('Anomalie détectée');
    });

    it('syncs report diagnosis when clinicalExam.diagnosis changes', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('diagnosis', 'Glaucome'));
        const overrides = useConsultationStore.getState().documentOverrides;
        expect(overrides?.report?.conclusion).toContain('Glaucome');
    });

    it('syncs report fundus when fundus.fundus_exam changes', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('fundus.fundus_exam', 'Papille normale'));
        const overrides = useConsultationStore.getState().documentOverrides;
        expect(overrides?.report?.fondOeil).toBe('Papille normale');
    });

    it('syncs report generalMedicalHistory when it changes', () => {
        act(() => useConsultationStore.getState().updateClinicalExamField('generalMedicalHistory', 'Diabète'));
        const overrides = useConsultationStore.getState().documentOverrides;
        expect(overrides?.report?.generalMedicalHistory).toBe('Diabète');
    });

    it('calculates nearSph from sph + add', () => {
        act(() => {
            useConsultationStore.getState().updateRightEyeField('sph', '-2.00');
            useConsultationStore.getState().updateRightEyeField('add', '+2.00');
        });
        const overrides = useConsultationStore.getState().documentOverrides;
        const rightEyeGlasses = overrides?.unifiedDocumentsState?.printStates?.printGlassesData?.rightEye;
        // nearSph = -2 + 2 = 0
        expect(parseFloat(rightEyeGlasses?.nearSph)).toBeCloseTo(0, 1);
    });
});
