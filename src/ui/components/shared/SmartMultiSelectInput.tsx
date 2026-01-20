import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Badge } from "@/ui/components/ui/badge";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/ui/components/ui/command";
import { orpcClient } from "@/ui/lib/orpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/ui/popover";

interface SmartMultiSelectInputProps {
    category: string;
    value?: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SmartMultiSelectInput({
    category,
    value = "",
    onSelect,
    placeholder = "Type to add...",
    className,
    disabled = false
}: SmartMultiSelectInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Parse current values
    const selectedValues = value.split(',').map(s => s.trim()).filter(Boolean);

    // Fetch options
    const { data: options = [], isLoading } = useQuery({
        queryKey: ['autocomplete', category],
        queryFn: async () => {
            return orpcClient.autocomplete.list({ category });
        }
    });

    // Increment freq
    const incrementMutation = useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.autocomplete.increment({ id });
        }
    });

    const handleAdd = (newValue: string, id?: string) => {
        const trimmed = newValue.trim();
        if (!trimmed) return;

        // Split by comma in case user pastes a list
        // clean up spaces
        const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);

        const newSelectedValues = [...selectedValues];
        let changed = false;

        parts.forEach(part => {
            // check if case-insensitive match exists in current selection
            if (!newSelectedValues.some(v => v.toLowerCase() === part.toLowerCase())) {
                newSelectedValues.push(part);
                changed = true;
            }
        });

        if (changed) {
            onSelect(newSelectedValues.join(', '));
        }

        setInputValue("");
        setOpen(false); // Close dropdown after selection

        if (id) {
            incrementMutation.mutate(id);
        }
    };

    const handleRemove = (valueToRemove: string) => {
        const newValues = selectedValues.filter(v => v !== valueToRemove);
        onSelect(newValues.join(', '));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget;

        if (e.key === 'Backspace' && input.value === '' && selectedValues.length > 0) {
            handleRemove(selectedValues[selectedValues.length - 1]);
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                if (!open || filteredOptions.length === 0) {
                    const existing = options.find(o => o.value.toLowerCase() === inputValue.toLowerCase());
                    if (existing) {
                        handleAdd(existing.value, existing.id);
                    } else {
                        handleAdd(inputValue);
                    }
                }
            }
        }

        if (e.key === 'Tab' && inputValue.trim()) {
            e.preventDefault();
            const existing = options.find(o => o.value.toLowerCase() === inputValue.toLowerCase());
            if (existing) {
                handleAdd(existing.value, existing.id);
            } else {
                handleAdd(inputValue);
            }
        }
    };

    const filteredOptions = options.filter(opt =>
        !selectedValues.includes(opt.value) &&
        opt.value.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <Popover open={open && (!isLoading) && (filteredOptions.length > 0 || !!inputValue)} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    ref={containerRef}
                    className={cn(
                        "flex flex-wrap gap-1.5 p-2 min-h-[40px] w-full rounded-md border border-input bg-background/50 text-sm ring-offset-background cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                        className
                    )}
                    onClick={() => inputRef.current?.focus()}
                >
                    {selectedValues.map((val) => (
                        <Badge key={val} variant="secondary" className="hover:bg-secondary/80 gap-1 pr-1 font-normal text-sm py-0.5">
                            {val}
                            <button
                                type="button"
                                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemove(val);
                                }}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedValues.length === 0 ? placeholder : ""}
                        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
                        disabled={disabled}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command>
                    <CommandList>
                        <CommandGroup>
                            {filteredOptions.slice(0, 10).map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.value}
                                    onSelect={() => handleAdd(option.value, option.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 opacity-0"
                                        )}
                                    />
                                    {option.value}
                                </CommandItem>
                            ))}
                            {inputValue && !filteredOptions.some(o => o.value.toLowerCase() === inputValue.toLowerCase()) && (
                                <CommandItem
                                    value={inputValue}
                                    onSelect={() => handleAdd(inputValue)}
                                >
                                    <span className="text-muted-foreground mr-2">Ajouter</span> "{inputValue}"
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
