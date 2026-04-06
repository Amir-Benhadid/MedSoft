/**
 * Unit tests for ClinicalExamTab component.
 *
 * Tests all clinical exam fields: inspection, motility, anterior segment,
 * fundus, diagnosis, and treatment plan – including read-only mode.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClinicalExamTab from '@/ui/components/doctor/dashboard/ClinicalExamTab';
import { useConsultationStore } from '@/ui/store/consultationStore';

// Mock SmartMultiSelectInput – complex dropdown component
vi.mock('@/ui/components/shared/SmartMultiSelectInput', () => ({
    SmartMultiSelectInput: ({ value, onSelect, placeholder, disabled, category }: any) => (
        <input
            data-testid={`smart-multi-${category}`}
            value={value}
            onChange={(e) => !disabled && onSelect(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={disabled}
        />
    ),
}));

// Mock OptimizedInput / OptimizedTextarea
vi.mock('@/ui/components/ui/optimized-input', () => ({
    OptimizedInput: ({ value, onChange, disabled, placeholder, className }: any) => (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={className}
            data-testid="optimized-input"
        />
    ),
    OptimizedTextarea: ({ value, onChange, disabled, placeholder, className }: any) => (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={className}
            data-testid="optimized-textarea"
        />
    ),
}));

const resetStore = () => {
    act(() => {
        useConsultationStore.getState().reset();
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
// Rendering
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClinicalExamTab – rendering', () => {
    beforeEach(resetStore);

    it('renders INSP section label', () => {
        render(<ClinicalExamTab />);
        expect(screen.getByText('INSP')).toBeInTheDocument();
    });

    it('renders MOT section label', () => {
        render(<ClinicalExamTab />);
        expect(screen.getByText('MOT')).toBeInTheDocument();
    });

    it('renders SEG ANT section label', () => {
        render(<ClinicalExamTab />);
        expect(screen.getByText('SEG ANT')).toBeInTheDocument();
    });

    it('renders FO section label', () => {
        render(<ClinicalExamTab />);
        expect(screen.getByText('FO')).toBeInTheDocument();
    });

    it('renders DIAG section label', () => {
        render(<ClinicalExamTab />);
        expect(screen.getByText('DIAG')).toBeInTheDocument();
    });

    it('renders CDT section label', () => {
        render(<ClinicalExamTab />);
        expect(screen.getByText('CDT')).toBeInTheDocument();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Inspection field
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClinicalExamTab – inspection field', () => {
    beforeEach(resetStore);

    it('typing in inspection field updates store', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const inputs = screen.getAllByTestId('optimized-input');
        const inspInput = inputs[0]; // First input = inspection
        await user.clear(inspInput);
        await user.type(inspInput, 'Normal');
        expect(useConsultationStore.getState().clinicalExam.inspection).toBe('Normal');
    });

    it('inspection update also syncs inspectionOD and inspectionOG', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const inputs = screen.getAllByTestId('optimized-input');
        await user.type(inputs[0], 'RAS');
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.inspectionOD).toBe('RAS');
        expect(clinicalExam.inspectionOG).toBe('RAS');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Motility field
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClinicalExamTab – motility field', () => {
    beforeEach(resetStore);

    it('typing in motility field updates store', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const inputs = screen.getAllByTestId('optimized-input');
        const motInput = inputs[1]; // Second input = motility
        await user.clear(motInput);
        await user.type(motInput, 'Normal');
        expect(useConsultationStore.getState().clinicalExam.motilityExam).toBe('Normal');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Anterior Segment field
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClinicalExamTab – anterior segment field', () => {
    beforeEach(resetStore);

    it('selecting anterior segment updates store', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const antSegInput = screen.getByTestId('smart-multi-anterior_segment');
        await user.clear(antSegInput);
        await user.type(antSegInput, 'RAS');
        expect(useConsultationStore.getState().clinicalExam.anteriorSegment?.slit_lamp_exam).toBe('RAS');
    });

    it('anterior segment update also syncs anteriorSegmentOD and anteriorSegmentOG', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const antSegInput = screen.getByTestId('smart-multi-anterior_segment');
        await user.type(antSegInput, 'Opacités');
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.anteriorSegmentOD).toBe('Opacités');
        expect(clinicalExam.anteriorSegmentOG).toBe('Opacités');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Fundus (FO) field
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClinicalExamTab – fundus field', () => {
    beforeEach(resetStore);

    it('typing in fundus field updates store', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const textareas = screen.getAllByTestId('optimized-textarea');
        // First textarea = fundus
        const foTextarea = textareas[0];
        await user.clear(foTextarea);
        await user.type(foTextarea, 'Papille normale');
        expect(useConsultationStore.getState().clinicalExam.fundus?.fundus_exam).toBe('Papille normale');
    });

    it('fundus update also syncs fundusOD and fundusOG', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const textareas = screen.getAllByTestId('optimized-textarea');
        await user.type(textareas[0], 'RAS');
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.fundusOD).toBe('RAS');
        expect(clinicalExam.fundusOG).toBe('RAS');
    });

    it('FO section has amber highlight ring when dilatation is required', () => {
        act(() => useConsultationStore.getState().setDilatationRequired(true));
        render(<ClinicalExamTab />);
        // The FO RowLayout should have ring-amber-400 class
        const foSection = document.querySelector('.ring-amber-400');
        expect(foSection).toBeInTheDocument();
    });

    it('FO section has no amber ring when dilatation is not required', () => {
        act(() => useConsultationStore.getState().setDilatationRequired(false));
        render(<ClinicalExamTab />);
        const foSection = document.querySelector('.ring-amber-400');
        expect(foSection).not.toBeInTheDocument();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Diagnosis field
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClinicalExamTab – diagnosis field', () => {
    beforeEach(resetStore);

    it('selecting diagnosis updates store', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const diagInput = screen.getByTestId('smart-multi-diagnostic');
        await user.clear(diagInput);
        await user.type(diagInput, 'Myopie');
        expect(useConsultationStore.getState().clinicalExam.diagnosis).toBe('Myopie');
    });

    it('diagnosis update syncs diagnosisOD and diagnosisOG', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const diagInput = screen.getByTestId('smart-multi-diagnostic');
        await user.type(diagInput, 'Cataracte');
        const { clinicalExam } = useConsultationStore.getState();
        expect(clinicalExam.diagnosisOD).toBe('Cataracte');
        expect(clinicalExam.diagnosisOG).toBe('Cataracte');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Treatment Plan (CDT) field
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClinicalExamTab – treatment plan field', () => {
    beforeEach(resetStore);

    it('typing in treatment plan updates store', async () => {
        const user = userEvent.setup();
        render(<ClinicalExamTab />);
        const textareas = screen.getAllByTestId('optimized-textarea');
        // Second textarea = treatment plan
        const cdtTextarea = textareas[1];
        await user.clear(cdtTextarea);
        await user.type(cdtTextarea, 'Collyre Timolol');
        expect(useConsultationStore.getState().clinicalExam.treatmentPlan).toBe('Collyre Timolol');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Read-only mode
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClinicalExamTab – read-only mode', () => {
    beforeEach(() => {
        resetStore();
        act(() => {
            useConsultationStore.getState().updateClinicalExamField('inspection', 'Normal');
            useConsultationStore.getState().updateClinicalExamField('diagnosis', 'Glaucome');
        });
    });

    it('input fields are disabled in read-only mode', () => {
        render(<ClinicalExamTab readOnly />);
        const inputs = screen.getAllByTestId('optimized-input');
        inputs.forEach(input => {
            expect(input).toBeDisabled();
        });
    });

    it('textarea fields are disabled in read-only mode', () => {
        render(<ClinicalExamTab readOnly />);
        const textareas = screen.getAllByTestId('optimized-textarea');
        textareas.forEach(ta => {
            expect(ta).toBeDisabled();
        });
    });

    it('SmartMultiSelectInput handlers are no-ops in read-only mode (not attribute-disabled)', () => {
        // NOTE: ClinicalExamTab does NOT pass disabled prop to SmartMultiSelectInput.
        // Instead, it uses a handler guard: if (readOnly) return.
        // So inputs are not attribute-disabled, but onChange is a no-op.
        render(<ClinicalExamTab readOnly />);
        const multiSelects = screen.getAllByTestId(/smart-multi-/);
        // They exist but are not HTML-disabled (readOnly-guard is in the handler)
        expect(multiSelects.length).toBeGreaterThan(0);
        // Typing should not overwrite the existing value (diagnosis was set to 'Glaucome' in beforeEach)
        const diagInput = screen.getByTestId('smart-multi-diagnostic');
        fireEvent.change(diagInput, { target: { value: 'Myopie' } });
        // Handler has `if (readOnly) return` guard, so store should NOT change to 'Myopie'
        expect(useConsultationStore.getState().clinicalExam.diagnosis).toBe('Glaucome');
    });

    it('shows external data instead of store data when provided', () => {
        const externalData = {
            inspection: 'External inspection',
            motilityExam: '',
            diagnosis: 'External diagnosis',
            treatmentPlan: '',
            anteriorSegment: { slit_lamp_exam: '' },
            fundus: { fundus_exam: '' },
        } as any;
        render(<ClinicalExamTab readOnly data={externalData} />);
        const inputs = screen.getAllByTestId('optimized-input');
        expect((inputs[0] as HTMLInputElement).value).toBe('External inspection');
    });
});
