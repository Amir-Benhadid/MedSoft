import {
    Plus,
    Trash2,
    Pencil,
    Pill,
    Save,
    X,
    PlusCircle,
    CopyPlus,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Card, CardContent } from "@/ui/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/ui/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/ui/components/ui/dialog";
import { Textarea } from "@/ui/components/ui/textarea";

import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { MedicineOption, useMedicinesPaginated } from '../../../../hooks/useMedicinesPaginated';
import PaginatedMedicineAutocomplete from '@/ui/components/doctor/documents/components/PaginatedMedicineAutocomplete';
import { PrescriptionData, Treatment } from '../types';
import { cn } from "@/ui/lib/utils";
import { useDocumentForm } from '../hooks/useDocumentForm';
import { DocumentUtils } from '../DocumentUtils';
import { useLocation } from '@tanstack/react-router';
import { useToast } from '@/ui/hooks/use-toast';

interface CompactPrescriptionFormProps {
    prescriptionData?: PrescriptionData;
    setPrescriptionData?: (data: PrescriptionData | ((prev: PrescriptionData) => PrescriptionData)) => void;
}

const GENERIC_TREATMENT_NAME_REGEX = /^medicament\s+\d+$/i;

const normalizeTreatmentName = (treatment: Partial<Treatment & { order?: number }>) =>
    (treatment.customName || treatment.name || '').trim();

const isValidTreatmentName = (treatment: Partial<Treatment & { order?: number }>) => {
    const normalizedName = normalizeTreatmentName(treatment);
    if (!normalizedName) return false;

    const comparableName = normalizedName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return !GENERIC_TREATMENT_NAME_REGEX.test(comparableName);
};

const getNextTreatmentOrder = (treatments: Array<Treatment & { order?: number }>) => {
    if (treatments.length === 0) return 1;
    return Math.max(...treatments.map((treatment, index) => treatment.order || index + 1)) + 1;
};

// Memoized Treatment Item Component with optimized comparison
const TreatmentItem = memo<{
    treatment: Treatment & { order: number; isNew?: boolean };
    index: number;
    isEditing: boolean;
    onUpdate: (index: number, updates: Partial<Treatment>) => void;
    onRemove: (index: number) => void;
    onMedicineSelect: (index: number, selected: MedicineOption | null, input: string) => void;
    onEdit: (index: number) => void;
    onSave: () => void;
    onCancel: () => void;
    onSaveMedicine: (treatment: Treatment) => void;
    isExpanded: boolean;
    onToggleExpand: (index: number) => void;
    canExitEditing: boolean;
}>(({
    treatment,
    index,
    isEditing,
    onUpdate,
    onRemove,
    onMedicineSelect,
    onEdit,
    onSave,
    onCancel,
    onSaveMedicine,
    isExpanded,
    onToggleExpand,
    canExitEditing
}) => {
    // Local state for immediate UI feedback (smooth typing)
    const [localTreatment, setLocalTreatment] = useState<Treatment & { order: number; isNew?: boolean }>(treatment);
    const onChangeRef = useRef(onUpdate);
    const onMedicineSelectRef = useRef(onMedicineSelect);
    const isTypingRef = useRef(false);

    // Keep refs current
    useEffect(() => {
        onChangeRef.current = onUpdate;
        onMedicineSelectRef.current = onMedicineSelect;
    }, [onUpdate, onMedicineSelect]);

    // Sync local state when treatment prop changes externally (not from typing)
    // Compare key fields to detect external changes
    const prevTreatmentRef = useRef(treatment);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Skip update if it's from typing (local change)
        if (isTypingRef.current) {
            // Don't reset immediately - wait a bit to allow rapid typing
            // Clear any existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            // Reset typing flag after a delay to allow parent to catch up
            typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                prevTreatmentRef.current = treatment;
            }, 100);
            return;
        }

        const prev = prevTreatmentRef.current;
        const hasExternalChange =
            prev.name !== treatment.name ||
            prev.customName !== treatment.customName ||
            prev.type !== treatment.type ||
            prev.strength !== treatment.strength ||
            prev.packaging !== treatment.packaging ||
            prev.instructions !== treatment.instructions;

        if (hasExternalChange) {
            setLocalTreatment(treatment);
            prevTreatmentRef.current = treatment;
        }
    }, [treatment]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Field change handler - immediate local update and parent update
    const handleFieldChange = useCallback((field: keyof Treatment) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = e.target.value;

            // Mark that we're typing to skip external sync
            isTypingRef.current = true;

            // Update local state immediately for smooth typing
            setLocalTreatment(prev => ({
                ...prev,
                [field]: newValue
            }));

            // Update parent immediately for real-time preview
            onChangeRef.current(index, { [field]: newValue });
        }, [index]);

    // Medicine select handler - optimized for smooth autocomplete typing
    const handleMedicineSelectLocal = useCallback((selected: MedicineOption | null, input: string) => {
        if (selected) {
            // Medicine was selected from dropdown - update all fields immediately
            setLocalTreatment(prev => ({
                ...prev,
                name: selected.value,
                customName: selected.value,
                type: selected.form || prev.type,
                strength: selected.strength || prev.strength,
                packaging: selected.packaging || prev.packaging,
                instructions: selected.defaultDosage || prev.instructions || '1 goutte 2 fois par jour pendant 7 jours',
            }));

            // Update parent (don't set isTypingRef, so external updates work normally)
            onMedicineSelectRef.current(index, selected, input);
        } else {
            // Just typing custom text - update only name fields
            isTypingRef.current = true;

            // Update local state immediately for smooth typing
            setLocalTreatment(prev => ({
                ...prev,
                name: input,
                customName: input
            }));

            // Update parent immediately for real-time preview
            onMedicineSelectRef.current(index, selected, input);
        }
    }, [index]);


    return (
        <Card
            className={cn(
                "mb-2 transition-all duration-300 border border-border rounded-lg overflow-hidden bg-card shadow-sm cursor-pointer",
                isExpanded ? "ring-1 ring-primary/20" : "hover:border-primary/30"
            )}
            onClick={(e) => {
                // Prevent toggling when clicking buttons or inputs
                if (
                    (e.target as HTMLElement).closest('button') ||
                    (e.target as HTMLElement).closest('input') ||
                    (e.target as HTMLElement).closest('textarea')
                ) {
                    return;
                }
                onToggleExpand(index);
            }}
        >
            <div className="p-2.5">
                {/* Header */}
                <div className={cn("flex items-center justify-between", isExpanded && "mb-2")}>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "flex items-center justify-center w-5 h-5 rounded text-[9px] font-semibold border shadow-sm",
                            isEditing ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                        )}>
                            {treatment.order}
                        </div>
                        {/* We can show title here if not editing or if collapsed */}
                        {(!isEditing || !isExpanded) && (
                            <span className="text-xs text-foreground">
                                {localTreatment.customName || localTreatment.name ? DocumentUtils.toTitleCase(localTreatment.customName || localTreatment.name) : `Médicament ${treatment.order}`}
                            </span>
                        )}
                        {/* Summary when collapsed */}
                        {!isExpanded && (localTreatment.strength || localTreatment.instructions) && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {localTreatment.strength ? `- ${localTreatment.strength}` : ''}
                                {localTreatment.instructions ? ` (${localTreatment.instructions.substring(0, 30)}${localTreatment.instructions.length > 30 ? '...' : ''})` : ''}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-0.5">
                        {isEditing && !treatment.isNew ? (
                            <>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={onSave}
                                                disabled={!canExitEditing}
                                            >
                                                <Save className="h-3 w-3" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Sauvegarder</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-muted-foreground hover:bg-gray-100"
                                                onClick={onCancel}
                                                disabled={!canExitEditing}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Annuler</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        ) : (
                            <>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => onSaveMedicine(treatment)}
                                            >
                                                <CopyPlus className="h-3 w-3" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Sauvegarder comme nouveau médicament</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {!isEditing && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-muted-foreground hover:bg-gray-100"
                                                    onClick={() => onEdit(index)}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Modifier</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => onRemove(index)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Supprimer</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        )}
                        {/* Expand/Collapse Indicator */}
                        <div className="ml-1 pl-1 border-l border-border/50 text-muted-foreground">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </div>
                </div>

                {/* Form Fields - Only visible when expanded */}
                {isExpanded && (
                    <div className={cn("grid grid-cols-12 gap-2 mt-3 animate-in fade-in slide-in-from-top-1 duration-200", !isEditing && "opacity-80 pointer-events-none")}>
                        {/* Medicine Name */}
                        <div className="col-span-6">
                            <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight mb-1 block">Nom du médicament</Label>
                            <PaginatedMedicineAutocomplete
                                value={localTreatment.customName || localTreatment.name || ''}
                                onChange={handleMedicineSelectLocal}
                                placeholder="Rechercher..."
                                size="small"
                                disabled={!isEditing}
                                className="h-7 text-sm font-semibold"
                            />
                        </div>

                        {/* Type and Strength */}
                        <div className="col-span-3">
                            <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight mb-1 block">Type/Forme</Label>
                            <Input
                                placeholder="ex: Collyre"
                                value={localTreatment.type || ''}
                                onChange={handleFieldChange('type')}
                                className="h-7 text-sm font-semibold text-foreground bg-background border-border focus:border-primary focus:ring-primary/20"
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="col-span-3">
                            <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight mb-1 block">Conc./Force</Label>
                            <Input
                                placeholder="ex: 0.5%, 10mg"
                                value={localTreatment.strength || ''}
                                onChange={handleFieldChange('strength')}
                                className="h-7 text-sm font-semibold text-foreground bg-background border-border focus:border-primary focus:ring-primary/20"
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Packaging */}
                        <div className="col-span-6">
                            <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight mb-1 block">Conditionnement</Label>
                            <Input
                                placeholder="ex: Flacon 5ml"
                                value={localTreatment.packaging || ''}
                                onChange={handleFieldChange('packaging')}
                                className="h-7 text-sm font-semibold text-foreground bg-background border-border focus:border-primary focus:ring-primary/20"
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Instructions */}
                        <div className="col-span-12">
                            <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight mb-1 block">Instructions</Label>
                            <Textarea
                                placeholder="ex: 1 goutte 2 fois par jour..."
                                value={localTreatment.instructions || ''}
                                onChange={handleFieldChange('instructions')}
                                className="min-h-[32px] text-sm font-medium text-foreground bg-background border-border focus:border-primary focus:ring-primary/20"
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Card >
    );
}, (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    if (prevProps.isEditing !== nextProps.isEditing) return false;
    if (prevProps.index !== nextProps.index) return false;

    const prevTreatment = prevProps.treatment;
    const nextTreatment = nextProps.treatment;

    if (prevTreatment.order !== nextTreatment.order) return false;
    if (prevTreatment.name !== nextTreatment.name) return false;
    if (prevTreatment.customName !== nextTreatment.customName) return false;
    if (prevTreatment.type !== nextTreatment.type) return false;
    if (prevTreatment.strength !== nextTreatment.strength) return false;
    if (prevTreatment.packaging !== nextTreatment.packaging) return false;
    if (prevTreatment.instructions !== nextTreatment.instructions) return false;
    if (prevTreatment.isNew !== nextTreatment.isNew) return false;

    // Add isExpanded check
    if (prevProps.isExpanded !== nextProps.isExpanded) return false;

    return true;
});

TreatmentItem.displayName = 'TreatmentItem';

const CompactPrescriptionForm = ({
    prescriptionData: propPrescriptionData,
    setPrescriptionData: propSetPrescriptionData
}: CompactPrescriptionFormProps) => {
    // Get form data from hook
    const {
        printPrescriptionData: contextPrescriptionData,
        setPrintPrescriptionData: contextSetPrescriptionData,
    } = useDocumentForm();

    const prescriptionData = propPrescriptionData ?? contextPrescriptionData;
    const setPrescriptionData = propSetPrescriptionData ?? contextSetPrescriptionData;
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // Track expanded item
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [medicineToSave, setMedicineToSave] = useState<Treatment | null>(null);
    const { addMedicine } = useMedicinesPaginated(100);
    const location = useLocation();
    const { toast } = useToast();
    const treatmentsRef = useRef(prescriptionData.treatments);

    useEffect(() => {
        treatmentsRef.current = prescriptionData.treatments;
    }, [prescriptionData.treatments]);

    // Guard against zombies when unmounting during an active portal
    useEffect(() => {
        setSaveDialogOpen(false);
    }, [location.pathname, location.search]);

    /** Creates a new blank treatment */
    const createNewTreatment = (order: number): Treatment & { order: number; isNew: boolean } => ({
        name: '',
        customName: '',
        dosage: '',
        frequency: { value: 1, unit: 'daily' },
        duration: { value: 7, unit: 'days' },
        instructions: '',
        strength: '',
        type: '',
        packaging: '',
        order,
        isNew: true,
    });

    const getBlockingEditingIndex = useCallback((targetIndex?: number) => {
        const activeEditingIndex = editingIndex;
        if (activeEditingIndex === null) return null;

        const activeTreatment = treatmentsRef.current[activeEditingIndex];
        if (!activeTreatment) return null;

        if (targetIndex !== undefined && activeEditingIndex === targetIndex) {
            return isValidTreatmentName(activeTreatment) ? null : activeEditingIndex;
        }

        return isValidTreatmentName(activeTreatment) ? null : activeEditingIndex;
    }, [editingIndex]);

    const showMedicineSelectionRequired = useCallback(() => {
        toast({
            title: 'Medicament requis',
            description: 'Selectionnez ou saisissez un vrai nom de medicament avant de fermer ou d\'ajouter une ligne.',
            variant: 'destructive',
        });
    }, [toast]);

    /** Updates a treatment at index - optimized with useCallback and stable references */
    const updateTreatment = useCallback((index: number, updates: Partial<Treatment>) => {
        setPrescriptionData(prev => {
            const currentTreatment = prev.treatments[index];
            if (!currentTreatment) return prev;

            const hasChanges = Object.keys(updates).some(key => {
                const typedKey = key as keyof Treatment;
                return currentTreatment[typedKey] !== updates[typedKey];
            });

            if (!hasChanges) return prev;

            const newTreatments = [...prev.treatments];
            newTreatments[index] = { ...currentTreatment, ...updates };
            treatmentsRef.current = newTreatments;

            return {
                ...prev,
                treatments: newTreatments
            };
        });
    }, [setPrescriptionData]);

    /** Add a new treatment - optimized to only add, not re-render existing treatments */
    const handleAddTreatment = useCallback(() => {
        if (getBlockingEditingIndex() !== null) {
            showMedicineSelectionRequired();
            return;
        }

        setPrescriptionData(prev => {
            const newTreatment = createNewTreatment(getNextTreatmentOrder(prev.treatments as Array<Treatment & { order?: number }>));
            const newTreatments = [newTreatment, ...(prev?.treatments || [])];
            treatmentsRef.current = newTreatments;

            return {
                ...prev,
                treatments: newTreatments
            };
        });
        setEditingIndex(0); // make it editable immediately
        setExpandedIndex(0); // expand the new item immediately
    }, [getBlockingEditingIndex, setPrescriptionData, showMedicineSelectionRequired]);

    /** Remove treatment - optimized with useCallback */
    const handleRemoveTreatment = useCallback((index: number) => {
        setPrescriptionData(prev => {
            const newTreatments = prev.treatments.filter((_, i) => i !== index);
            treatmentsRef.current = newTreatments;

            return {
                ...prev,
                treatments: newTreatments
            };
        });
        if (editingIndex === index) setEditingIndex(null);
        else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);

        if (expandedIndex === index) setExpandedIndex(null);
        else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
    }, [editingIndex, expandedIndex, setPrescriptionData]);

    /** Handle medicine selection/autofill - optimized with useCallback */
    const handleMedicineSelect = useCallback((
        index: number,
        selectedMedicine: MedicineOption | null,
        inputValue: string
    ) => {
        if (selectedMedicine) {
            setPrescriptionData(prev => {
                const currentTreatment = prev.treatments[index];
                if (!currentTreatment) return prev;

                if (currentTreatment.name === selectedMedicine.value &&
                    currentTreatment.customName === selectedMedicine.value) {
                    return prev;
                }

                const newTreatments = prev.treatments.map((t, i) =>
                    i === index ? {
                        ...t,
                        name: selectedMedicine.value,
                        customName: selectedMedicine.value,
                        type: selectedMedicine.form || t.type,
                        strength: selectedMedicine.strength || t.strength,
                        packaging: selectedMedicine.packaging || t.packaging,
                        instructions:
                            selectedMedicine.defaultDosage ||
                            t.instructions ||
                            '1 goutte 2 fois par jour pendant 7 jours',
                    } : t
                );

                treatmentsRef.current = newTreatments;

                return {
                    ...prev,
                    treatments: newTreatments
                };
            });
        } else {
            updateTreatment(index, { name: inputValue, customName: inputValue });
        }
    }, [updateTreatment, setPrescriptionData]);

    const finalizeEditing = useCallback((index: number | null) => {
        if (index === null) return;

        setPrescriptionData(prev => {
            if (!prev.treatments[index]) return prev;

            const newTreatments = [...prev.treatments];
            newTreatments[index] = { ...newTreatments[index], isNew: false };
            treatmentsRef.current = newTreatments;

            return {
                ...prev,
                treatments: newTreatments,
            };
        });
    }, [setPrescriptionData]);

    /** Save medicine to database - optimized with useCallback */
    const handleConfirmSaveMedicine = useCallback(async () => {
        if (!medicineToSave) return;
        try {
            await addMedicine({
                medicationName: medicineToSave.name || medicineToSave.customName || '',
                strength: medicineToSave.strength || '',
                type: medicineToSave.type || '',
                packaging: medicineToSave.packaging || '',
                instructions:
                    medicineToSave.instructions || '1 goutte 2 fois par jour pendant 7 jours',
            });
            setSaveDialogOpen(false);
            setMedicineToSave(null);
        } catch (err) {
            console.error('Error saving medicine:', err);
        }
    }, [medicineToSave, addMedicine]);

    /** Handle save medicine dialog - optimized with useCallback */
    const handleSaveMedicine = useCallback((treatment: Treatment) => {
        setMedicineToSave(treatment);
        setSaveDialogOpen(true);
    }, []);

    const handleEditTreatment = useCallback((index: number) => {
        const blockingIndex = getBlockingEditingIndex(index);
        if (blockingIndex !== null) {
            showMedicineSelectionRequired();
            return;
        }

        setEditingIndex(index);
        setExpandedIndex(index);
    }, [getBlockingEditingIndex, showMedicineSelectionRequired]);

    const handleToggleExpand = useCallback((index: number) => {
        const isClosingCurrentEditingCard = expandedIndex === index && editingIndex === index;
        const isSwitchingAwayFromCurrentEditingCard = editingIndex !== null && expandedIndex === editingIndex && index !== editingIndex;

        if ((isClosingCurrentEditingCard || isSwitchingAwayFromCurrentEditingCard) && getBlockingEditingIndex() !== null) {
            showMedicineSelectionRequired();
            return;
        }

        setExpandedIndex(prev => prev === index ? null : index);
    }, [editingIndex, expandedIndex, getBlockingEditingIndex, showMedicineSelectionRequired]);

    // Stable callbacks to prevent TreatmentItem re-renders
    const handleSaveStable = useCallback(() => {
        if (getBlockingEditingIndex() !== null) {
            showMedicineSelectionRequired();
            return;
        }

        finalizeEditing(editingIndex);
        setEditingIndex(null);
    }, [editingIndex, finalizeEditing, getBlockingEditingIndex, showMedicineSelectionRequired]);

    const handleCancelStable = useCallback(() => {
        if (getBlockingEditingIndex() !== null) {
            showMedicineSelectionRequired();
            return;
        }

        finalizeEditing(editingIndex);
        setEditingIndex(null);
    }, [editingIndex, finalizeEditing, getBlockingEditingIndex, showMedicineSelectionRequired]);

    /** Memoized treatments list - optimized to only re-render changed items */
    const treatmentsList = useMemo(() => {
        return prescriptionData.treatments.map((treatment, index) => {
            const isEditing = editingIndex === index || (treatment as any).isNew;
            const treatmentOrder = (treatment as any).order || index;
            const canExitEditing = isValidTreatmentName(treatment);

            return (
                <TreatmentItem
                    key={`treatment-${treatmentOrder}`}
                    treatment={treatment as Treatment & { order: number; isNew?: boolean }}
                    index={index}
                    isEditing={isEditing}
                    isExpanded={expandedIndex === index}
                    onToggleExpand={handleToggleExpand}
                    onUpdate={updateTreatment}
                    onRemove={handleRemoveTreatment}
                    onMedicineSelect={handleMedicineSelect}
                    onEdit={() => handleEditTreatment(index)}
                    onSave={handleSaveStable}
                    onCancel={handleCancelStable}
                    onSaveMedicine={handleSaveMedicine}
                    canExitEditing={canExitEditing}
                />
            );
        });
    }, [
        prescriptionData.treatments,
        editingIndex,
        updateTreatment,
        handleRemoveTreatment,
        handleMedicineSelect,
        handleEditTreatment,
        handleSaveMedicine,
        handleSaveStable,
        handleCancelStable,
        handleToggleExpand,
        expandedIndex, // Dependency
    ]);

    return (
        <div className="space-y-3 font-sans text-sm pb-4">
            <div className="bg-card rounded-xl p-3 border border-border shadow-sm space-y-3">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                            <Pill className="text-primary h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground text-sm uppercase">Médicaments</h4>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Gérer l'ordonnance</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleAddTreatment}
                        size="sm"
                        className="h-7 rounded-lg px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs uppercase tracking-tight shadow-sm"
                    >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Ajouter
                    </Button>
                </div>

                {/* Treatments List */}
                <div className="space-y-2">
                    {treatmentsList}

                    {/* Empty State */}
                    {prescriptionData.treatments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/30">
                            <div className="p-2.5 bg-card rounded-full shadow-sm mb-2">
                                <Pill className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="text-xs font-semibold text-foreground uppercase tracking-tight mb-1">Aucun médicament prescrit</span>
                            <span className="text-[10px] text-muted-foreground">Cliquez sur "Ajouter" pour rédiger une ordonnance</span>
                        </div>
                    )}
                </div>

                {/* Save Medicine Dialog */}
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Sauvegarder dans la base de données</DialogTitle>
                            <DialogDescription>
                                Voulez-vous ajouter ce médicament à votre liste de favoris ?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            {medicineToSave && (
                                <div className="bg-card p-3 rounded-lg border border-border text-sm space-y-2 shadow-sm">
                                    <div className="text-foreground">{DocumentUtils.toTitleCase(medicineToSave.name || medicineToSave.customName || '')}</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                        {medicineToSave.type && <div><span className="font-semibold text-foreground">Type:</span> {medicineToSave.type}</div>}
                                        {medicineToSave.strength && <div><span className="font-semibold text-foreground">Dosage:</span> {medicineToSave.strength}</div>}
                                        {medicineToSave.packaging && <div className="col-span-2"><span className="font-semibold text-foreground">Conditionnement:</span> {medicineToSave.packaging}</div>}
                                    </div>
                                    {medicineToSave.instructions && (
                                        <div className="pt-2 border-t border-border mt-2">
                                            <span className="font-semibold text-foreground text-xs block mb-1">Instructions:</span>
                                            <p className="italic text-muted-foreground text-xs leading-relaxed">"{medicineToSave.instructions}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSaveDialogOpen(false)} className="h-7 text-xs font-semibold uppercase tracking-tight">
                                Annuler
                            </Button>
                            <Button
                                onClick={handleConfirmSaveMedicine}
                                disabled={!medicineToSave?.name && !medicineToSave?.customName}
                                className="h-7 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold uppercase tracking-tight"
                            >
                                Sauvegarder
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(CompactPrescriptionForm);
