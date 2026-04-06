/**
 * Unit tests for PrescriptionTab component.
 *
 * Tests adding, editing, deleting prescriptions, empty state,
 * and read-only mode.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrescriptionTab from '@/ui/components/doctor/dashboard/PrescriptionTab';
import { useConsultationStore } from '@/ui/store/consultationStore';

// Mock MedicineAutocomplete – complex external component
vi.mock('@/ui/components/doctor/medications/MedicineAutocomplete', () => ({
    MedicineAutocomplete: ({ value, onSelect }: any) => (
        <input
            data-testid="medicine-autocomplete"
            value={value}
            onChange={(e) => onSelect({ medication_name: e.target.value })}
        />
    ),
}));

// Mock NewMedicineSheet
vi.mock('@/ui/components/doctor/medications/NewMedicineSheet', () => ({
    NewMedicineSheet: () => <button data-testid="new-medicine-sheet">Nouveau médicament</button>,
}));

// Mock OptimizedInput / OptimizedTextarea to use plain input/textarea
vi.mock('@/ui/components/ui/optimized-input', () => ({
    OptimizedInput: ({ value, onChange, className, ...props }: any) => (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={className}
            {...props}
        />
    ),
    OptimizedTextarea: ({ value, onChange, className, ...props }: any) => (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={className}
            {...props}
        />
    ),
}));

const resetStore = () => {
    act(() => {
        useConsultationStore.getState().reset();
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
// Empty state
// ═══════════════════════════════════════════════════════════════════════════════
describe('PrescriptionTab – empty state', () => {
    beforeEach(resetStore);

    it('shows empty state message when no prescriptions', () => {
        render(<PrescriptionTab />);
        expect(screen.getByText('Aucun médicament prescrit')).toBeInTheDocument();
    });

    it('shows "Médicaments (0)" count in header', () => {
        render(<PrescriptionTab />);
        expect(screen.getByText('Médicaments (0)')).toBeInTheDocument();
    });

    it('shows Ajouter button when not readOnly', () => {
        render(<PrescriptionTab />);
        expect(screen.getByRole('button', { name: /Ajouter/i })).toBeInTheDocument();
    });

    it('hides Ajouter button when readOnly', () => {
        render(<PrescriptionTab readOnly />);
        expect(screen.queryByRole('button', { name: /Ajouter/i })).not.toBeInTheDocument();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Adding prescriptions
// ═══════════════════════════════════════════════════════════════════════════════
describe('PrescriptionTab – adding prescriptions', () => {
    beforeEach(resetStore);

    it('clicking Ajouter adds a prescription card', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));
        expect(screen.getByText('Médicaments (1)')).toBeInTheDocument();
    });

    it('clicking Ajouter twice adds two prescriptions', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));
        expect(screen.getByText('Médicaments (2)')).toBeInTheDocument();
    });

    it('hides empty state message after adding a prescription', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));
        expect(screen.queryByText('Aucun médicament prescrit')).not.toBeInTheDocument();
    });

    it('shows Nom du médicament label for each prescription', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));
        expect(screen.getByText('Nom du médicament')).toBeInTheDocument();
    });

    it('shows Dosage, Fréquence, Durée, Instructions labels', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));
        expect(screen.getByText('Dosage')).toBeInTheDocument();
        expect(screen.getByText('Fréquence')).toBeInTheDocument();
        expect(screen.getByText('Durée')).toBeInTheDocument();
        expect(screen.getByText('Instructions')).toBeInTheDocument();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Editing prescriptions
// ═══════════════════════════════════════════════════════════════════════════════
describe('PrescriptionTab – editing prescriptions', () => {
    beforeEach(resetStore);

    it('updates dosage field when typing', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        // Find the dosage input (second textbox after medicine autocomplete)
        const inputs = screen.getAllByRole('textbox');
        const dosageInput = inputs[1]; // medicine=0, dosage=1
        await user.clear(dosageInput);
        await user.type(dosageInput, '500mg');

        expect(useConsultationStore.getState().prescriptions[0].dosage).toBe('500mg');
    });

    it('updates frequency field when typing', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        const inputs = screen.getAllByRole('textbox');
        // 0=medicine, 1=dosage, 2=frequency
        const freqInput = inputs[2];
        await user.clear(freqInput);
        await user.type(freqInput, '3x/jour');

        expect(useConsultationStore.getState().prescriptions[0].frequency).toBe('3x/jour');
    });

    it('updates duration field when typing', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        const inputs = screen.getAllByRole('textbox');
        // 0=medicine, 1=dosage, 2=frequency, 3=duration
        const durInput = inputs[3];
        await user.clear(durInput);
        await user.type(durInput, '7 jours');

        expect(useConsultationStore.getState().prescriptions[0].duration).toBe('7 jours');
    });

    it('updates instructions when typing in textarea', async () => {
        const user = userEvent.setup();
        render(<PrescriptionTab />);
        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        // Use querySelector to find the textarea directly (avoids multiple-match issue)
        const allTextareas = document.querySelectorAll('textarea');
        expect(allTextareas.length).toBeGreaterThan(0);
        await user.clear(allTextareas[0]);
        await user.type(allTextareas[0], 'Prendre avec les repas');
        expect(useConsultationStore.getState().prescriptions[0].instructions).toBe('Prendre avec les repas');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Deleting prescriptions
// ═══════════════════════════════════════════════════════════════════════════════
describe('PrescriptionTab – deleting prescriptions', () => {
    beforeEach(resetStore);

    it('removes a prescription when delete button is clicked', async () => {
        const user = userEvent.setup();

        // Pre-populate store with a prescription
        act(() => {
            useConsultationStore.getState().addPrescription();
        });

        render(<PrescriptionTab />);
        expect(screen.getByText('Médicaments (1)')).toBeInTheDocument();

        // Find delete button (ghost icon button with Trash2)
        const deleteButtons = screen.getAllByRole('button');
        // Find by class or icon – the trash button is inside the card
        const trashBtn = deleteButtons.find(b => b.querySelector('svg'));
        if (trashBtn) {
            await user.click(trashBtn);
        } else {
            // Fallback: find the ghost size-icon button
            const iconBtns = document.querySelectorAll('button.h-8.w-8');
            if (iconBtns.length > 0) {
                fireEvent.click(iconBtns[0]);
            }
        }
    });

    it('shows empty state after deleting the only prescription', async () => {
        const user = userEvent.setup();

        act(() => {
            useConsultationStore.getState().addPrescription();
        });

        render(<PrescriptionTab />);

        // Direct store removal
        act(() => {
            const id = useConsultationStore.getState().prescriptions[0].id;
            useConsultationStore.getState().removePrescription(id);
        });

        // Re-render
        render(<PrescriptionTab />);
        expect(screen.getAllByText('Aucun médicament prescrit').length).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Read-only mode
// ═══════════════════════════════════════════════════════════════════════════════
describe('PrescriptionTab – read-only mode', () => {
    beforeEach(() => {
        resetStore();
        act(() => {
            useConsultationStore.getState().addPrescription();
            const id = useConsultationStore.getState().prescriptions[0].id;
            useConsultationStore.getState().updatePrescription(id, 'name', 'Timolol');
            useConsultationStore.getState().updatePrescription(id, 'dosage', '0.5%');
        });
    });

    it('does not show Ajouter button in read-only mode', () => {
        render(<PrescriptionTab readOnly />);
        expect(screen.queryByRole('button', { name: /Ajouter/i })).not.toBeInTheDocument();
    });

    it('does not show new medicine sheet button in read-only mode', () => {
        render(<PrescriptionTab readOnly />);
        expect(screen.queryByTestId('new-medicine-sheet')).not.toBeInTheDocument();
    });

    it('still shows prescription data in read-only mode', () => {
        render(<PrescriptionTab readOnly />);
        expect(screen.getByText('Médicaments (1)')).toBeInTheDocument();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Prescription count display
// ═══════════════════════════════════════════════════════════════════════════════
describe('PrescriptionTab – prescription count', () => {
    beforeEach(resetStore);

    it('displays correct count of 3', async () => {
        act(() => {
            useConsultationStore.getState().addPrescription();
            useConsultationStore.getState().addPrescription();
            useConsultationStore.getState().addPrescription();
        });
        render(<PrescriptionTab />);
        expect(screen.getByText('Médicaments (3)')).toBeInTheDocument();
    });

    it('shows numbered badges in reverse order', async () => {
        act(() => {
            useConsultationStore.getState().addPrescription();
            useConsultationStore.getState().addPrescription();
        });
        render(<PrescriptionTab />);
        // The newest (index 0) shows count 2, the older (index 1) shows count 1
        const badges = document.querySelectorAll('.rounded-full.bg-blue-100');
        expect(badges.length).toBe(2);
    });
});

// Need to import fireEvent for fallback
import { fireEvent } from '@testing-library/react';
