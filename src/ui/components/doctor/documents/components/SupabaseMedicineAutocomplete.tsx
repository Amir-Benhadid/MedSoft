import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MedicineOption } from '../../../../hooks/useMedicinesPaginated';
import { useSupabaseMedicinesPaginated } from '../../../../hooks/useSupabaseMedicinesPaginated';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/ui/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/ui/components/ui/dialog";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Textarea } from "@/ui/components/ui/textarea";
import { Plus, Pill, Search, Loader2 } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/ui/popover";
import { Badge } from "@/ui/components/ui/badge";

interface SupabaseMedicineAutocompleteProps {
    value: string;
    onChange: (selected: MedicineOption | null, input: string) => void;
    placeholder?: string;
    size?: 'small' | 'medium';
    disabled?: boolean;
    className?: string;
}

const SupabaseMedicineAutocomplete: React.FC<SupabaseMedicineAutocompleteProps> = ({
    value,
    onChange,
    placeholder = 'Rechercher un médicament...',
    size = 'medium',
    disabled = false,
    className,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const prevValueRef = useRef(value);
    const [open, setOpen] = useState(false); // Controls the popover/list visibility

    // Sync internal inputValue with external value prop
    useEffect(() => {
        if (prevValueRef.current !== value && inputValue !== value) {
            setInputValue(value);
        }
        prevValueRef.current = value;
    }, [value, inputValue]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        medicationName: '',
        strength: '',
        type: '',
        packaging: '',
        instructions: '',
        category: '',
        activeIngredient: '',
        manufacturer: '',
        prescriptionRequired: true,
    });

    const {
        medicines,
        loading,
        hasMore,
        searchTerm,
        setSearchTerm,
        loadMore,
        addMedicine,
        error,
    } = useSupabaseMedicinesPaginated(20);

    const handleInputChange = useCallback(
        (newValue: string) => {
            setInputValue(newValue);
            setSearchTerm(newValue);
            onChange(null, newValue);
            setOpen(true);
        },
        [setSearchTerm, onChange]
    );

    const handleSelectOption = useCallback(
        (option: MedicineOption) => {
            setInputValue(option.value);
            onChange(option, option.value);
            setOpen(false);
        },
        [onChange]
    );

    // Infinite scroll trigger
    const listRef = useRef<HTMLDivElement>(null);
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
            loadMore();
        }
    };

    const handleAddNewMedicine = useCallback(() => {
        setNewMedicine({
            medicationName: inputValue,
            strength: '',
            type: '',
            packaging: '',
            instructions: '',
            category: '',
            activeIngredient: '',
            manufacturer: '',
            prescriptionRequired: true,
        });
        setDialogOpen(true);
        setOpen(false);
    }, [inputValue]);

    const handleSaveNewMedicine = useCallback(async () => {
        try {
            await addMedicine(newMedicine);
            const newMedicineOption: MedicineOption = {
                value: newMedicine.medicationName,
                label: newMedicine.strength
                    ? `${newMedicine.medicationName} - ${newMedicine.strength}`
                    : newMedicine.medicationName,
                category: newMedicine.category || 'Other',
                form: newMedicine.type || '',
                strength: newMedicine.strength || '',
                defaultDosage: newMedicine.instructions || '',
                prescriptionRequired: newMedicine.prescriptionRequired,
                packaging: newMedicine.packaging || '',
                manufacturer: newMedicine.manufacturer || '',
                activeIngredient: newMedicine.activeIngredient || '',
            };
            setDialogOpen(false);
            setNewMedicine({
                medicationName: '',
                strength: '',
                type: '',
                packaging: '',
                instructions: '',
                category: '',
                activeIngredient: '',
                manufacturer: '',
                prescriptionRequired: true,
            });
            setInputValue(newMedicine.medicationName);
            onChange(newMedicineOption, newMedicine.medicationName);
            setSearchTerm(newMedicine.medicationName);
        } catch (err) {
            console.error('Error saving new medicine:', err);
        }
    }, [newMedicine, addMedicine, onChange, setSearchTerm]);

    // Construct options list
    const options = useMemo(() => {
        const baseOptions = medicines.map((medicine) => ({
            ...medicine,
            label: medicine.label || medicine.value,
        }));

        // Add "Add new" option logic
        // We will render this directly in the list
        return baseOptions;
    }, [medicines]);

    const showAddNew = inputValue.trim() && !medicines.some(m => m.value.toLowerCase() === inputValue.toLowerCase());

    return (
        <div className="relative w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative w-full">
                        {/* We use a simple Input as trigger presentation, but standard PopoverTrigger wraps it.
                             Actually, better to use Command primitive directly?
                             Popover with Command inside is standard for Combobox.
                             But we want to type into the "Button"? No.
                             We'll use the CommandInput AS the input.
                             But needs to look like an Input.
                          */}
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                                "w-full justify-between px-3 font-normal text-left",
                                !inputValue && "text-muted-foreground",
                                size === "small" && "h-8 text-xs",
                                className
                            )}
                            onClick={() => setOpen(true)}
                            disabled={disabled}
                        >
                            {inputValue || placeholder}
                            <Search className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                        </Button>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={placeholder}
                            value={inputValue}
                            onValueChange={handleInputChange}
                        />
                        <CommandList onScroll={handleScroll} className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>
                                {loading ? (
                                    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Chargement...
                                    </div>
                                ) : (
                                    <div className="py-2 text-center text-sm">
                                        {error ? `Erreur: ${error}` : 'Aucun médicament trouvé.'}
                                        {showAddNew && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 w-full justify-start text-primary"
                                                onClick={handleAddNewMedicine}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Ajouter "{inputValue}"
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {options.map((option, index) => (
                                    <CommandItem
                                        key={option.id || index}
                                        value={option.value}
                                        onSelect={() => handleSelectOption(option)}
                                        className="flex flex-col items-start py-2 cursor-pointer"
                                    >
                                        <div className="flex w-full items-center">
                                            <Pill className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium flex-1">{option.value}</span>
                                            {option.category && (
                                                <Badge variant="outline" className="ml-2 text-[10px] h-5">
                                                    {option.category}
                                                </Badge>
                                            )}
                                        </div>
                                        {(option.strength || option.form || option.defaultDosage) && (
                                            <span className="ml-6 text-xs text-muted-foreground mt-0.5">
                                                {[
                                                    option.strength,
                                                    option.form,
                                                    option.defaultDosage
                                                        ? (option.defaultDosage.length > 10
                                                            ? option.defaultDosage.slice(0, 10) + '...'
                                                            : option.defaultDosage)
                                                        : null,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ')}
                                            </span>
                                        )}
                                    </CommandItem>
                                ))}
                                {loading && (
                                    <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    </div>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau médicament</DialogTitle>
                        <DialogDescription>
                            Ajoutez les détails du médicaments pour la base de données.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="medicationName">Nom du médicament</Label>
                            <Input
                                id="medicationName"
                                value={newMedicine.medicationName}
                                onChange={(e) => setNewMedicine({ ...newMedicine, medicationName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="strength">Concentration/Force</Label>
                                <Input
                                    id="strength"
                                    placeholder="ex: 35mg, 1%"
                                    value={newMedicine.strength}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, strength: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type/Forme</Label>
                                <Input
                                    id="type"
                                    placeholder="ex: collyre, cp"
                                    value={newMedicine.type}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, type: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="packaging">Conditionnement</Label>
                                <Input
                                    id="packaging"
                                    placeholder="ex: 01 fl"
                                    value={newMedicine.packaging}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, packaging: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <Input
                                    id="category"
                                    placeholder="ex: Ophthalmic"
                                    value={newMedicine.category}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="instructions">Instructions par défaut</Label>
                            <Textarea
                                id="instructions"
                                placeholder="ex: 1 goutte 2 fois par jour..."
                                value={newMedicine.instructions}
                                onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveNewMedicine} disabled={!newMedicine.medicationName.trim()}>Sauvegarder</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SupabaseMedicineAutocomplete;
