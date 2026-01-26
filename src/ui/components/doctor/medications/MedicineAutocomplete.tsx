import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Pill } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Button } from "@/ui/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/ui/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/ui/components/ui/popover";

import { Label } from "@/ui/components/ui/label";
import { Input } from "@/ui/components/ui/input";
import { Textarea } from "@/ui/components/ui/textarea";
import { orpcClient } from "@/ui/lib/orpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/ui/hooks/use-debounce";

interface MedicineAutocompleteProps {
    value?: string;
    onSelect: (medicine: any) => void;
    className?: string;
}

export function MedicineAutocomplete({ value, onSelect, className }: MedicineAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    const queryClient = useQueryClient();

    // Search Medicines
    const { data: medicines = [], isLoading } = useQuery({
        queryKey: ['medications', debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch) {
                return orpcClient.medications.list({ limit: 10 });
            }
            return orpcClient.medications.search({ query: debouncedSearch, limit: 10 });
        }
    });



    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {value ? (
                            <span className="truncate">{value}</span>
                        ) : (
                            <span className="text-muted-foreground flex items-center gap-2 text-sm">
                                <SearchIcon className="h-4 w-4" />
                                Médicament...
                            </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Médicament..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList>
                            {isLoading && <div className="py-2 px-2 text-sm text-muted-foreground">Chargement...</div>}

                            {!isLoading && medicines.length === 0 && (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Aucun médicament trouvé.</p>
                                </div>
                            )}

                            {medicines.length > 0 && (
                                <CommandSeparator />
                            )}
                            <CommandGroup>
                                {medicines.map((med) => (
                                    <CommandItem
                                        key={med.id}
                                        value={`${med.medication_name}-${med.id}`}
                                        onSelect={() => {
                                            onSelect(med);
                                            setOpen(false);
                                        }}
                                        disabled={false}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === med.medication_name ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{med.medication_name}</span>
                                            {(med.strength || med.type) && (
                                                <span className="text-xs text-muted-foreground">
                                                    {[med.strength, med.type].filter(Boolean).join(' - ')}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>


        </div >
    );
}

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
