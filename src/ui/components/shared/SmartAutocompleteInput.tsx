import { useState, useRef } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { orpcClient } from "@/ui/lib/orpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SmartAutocompleteInputProps {
    category: string; // 'diagnostic', 'anterior_segment', etc.
    value?: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    className?: string;
    modal?: boolean;
}

export function SmartAutocompleteInput({
    category,
    value,
    onSelect,
    placeholder = "Sélectionner...",
    className,
    modal = false
}: SmartAutocompleteInputProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch options
    const { data: options = [], isLoading } = useQuery({
        queryKey: ['autocomplete', category],
        queryFn: async () => {
            return orpcClient.autocomplete.list({ category });
        }
    });

    // Increment freq mutation
    const incrementMutation = useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.autocomplete.increment({ id });
        }
    });

    const handleSelect = (optionValue: string, id?: string) => {
        onSelect(optionValue);
        setOpen(false);
        if (id) {
            incrementMutation.mutate(id);
        }
    };

    const handleCustomValue = () => {
        if (!searchTerm) return;
        onSelect(searchTerm);
        setOpen(false);
    };

    const filteredOptions = options.filter(opt =>
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Popover open={open} onOpenChange={setOpen} modal={modal}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
                >
                    {value ? (
                        <span className="truncate">{value}</span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={placeholder}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        ref={inputRef}
                    />
                    <CommandList>
                        {isLoading && <div className="py-2 px-2 text-sm text-muted-foreground">Chargement...</div>}

                        {!isLoading && filteredOptions.length === 0 && searchTerm && (
                            <div className="p-1">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm"
                                    onClick={handleCustomValue}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Utiliser "{searchTerm}"
                                </Button>
                            </div>
                        )}

                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.value} // Use precise value for filtering matching
                                    onSelect={() => handleSelect(option.value, option.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.value}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
