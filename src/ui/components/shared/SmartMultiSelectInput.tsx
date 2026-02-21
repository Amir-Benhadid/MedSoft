import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/ui/components/ui/command";
import { orpcClient } from "@/ui/lib/orpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/ui/popover";

/** Delimiter between base (option) and details. Stored in value as "Base | details" */
const DETAILS_DELIMITER = " | ";

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
    placeholder = "Ajouter...",
    className,
    disabled = false
}: SmartMultiSelectInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [open, setOpen] = useState(false);
    const [justAddedIndex, setJustAddedIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const extraInputRefs = useRef<Record<number, HTMLInputElement>>({});

    // Parse current values
    const selectedValues = value.split(',').map(s => s.trimStart()).filter(s => s.trim() !== "");

    // Fetch options
    const { data: options = [], isLoading } = useQuery({
        queryKey: ['autocomplete', category],
        queryFn: async () => {
            return orpcClient.autocomplete.list({ category });
        }
    });

    // Parse each item: "Base | details" → { base, details }, else { base: item, details: "" }
    // Backwards compat: legacy "Base extra text" without delimiter → match options to split
    const parsedValues = selectedValues.map((val) => {
        const delimIndex = val.indexOf(DETAILS_DELIMITER);
        if (delimIndex >= 0) {
            const base = val.slice(0, delimIndex).trim();
            const details = val.slice(delimIndex + DETAILS_DELIMITER.length);
            return { original: val, base: base || val, details };
        }
        // Legacy: no delimiter - match longest option as base
        let base = val.trim();
        let details = "";
        let longestMatch = "";
        for (const opt of options) {
            const optVal = opt.value.trim();
            if (!optVal) continue;
            const optLower = optVal.toLowerCase();
            const valLower = val.toLowerCase();
            if ((valLower === optLower || valLower.startsWith(optLower + " ")) && optVal.length > longestMatch.length) {
                longestMatch = optVal;
            }
        }
        if (longestMatch) {
            base = val.slice(0, longestMatch.length).trim();
            details = val.slice(longestMatch.length).trimStart();
        }
        return { original: val, base, details };
    });

    useEffect(() => {
        if (justAddedIndex !== null) {
            const el = extraInputRefs.current[justAddedIndex];
            if (el) {
                el.focus();
                setJustAddedIndex(null);
            }
        }
    }, [parsedValues, justAddedIndex]);

    // Increment freq
    const incrementMutation = useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.autocomplete.increment({ id });
        }
    });

    const getBase = (item: string) => {
        const i = item.indexOf(DETAILS_DELIMITER);
        return i >= 0 ? item.slice(0, i).trim() : item.trim();
    };

    const handleAdd = (newValue: string, id?: string) => {
        const trimmed = newValue.trim();
        if (!trimmed) return;

        const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
        const newSelectedValues = [...selectedValues];
        let changed = false;

        parts.forEach(part => {
            const partBase = getBase(part);
            const alreadyExists = newSelectedValues.some(v => getBase(v).toLowerCase() === partBase.toLowerCase());
            if (!alreadyExists) {
                newSelectedValues.push(part);
                changed = true;
            }
        });

        if (changed) {
            onSelect(newSelectedValues.join(', '));
            setJustAddedIndex(newSelectedValues.length - 1);
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
        !selectedValues.some(v => getBase(v).toLowerCase() === opt.value.toLowerCase()) &&
        opt.value.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <Popover open={open && !isLoading && (filteredOptions.length > 0 || !!inputValue)} onOpenChange={setOpen}>
            <div
                ref={containerRef}
                className={cn(
                    "flex flex-wrap items-center gap-2 p-2.5 min-h-[44px] max-h-[120px] overflow-y-auto overflow-x-hidden w-full rounded-xl border border-slate-200 bg-white/90 text-sm shadow-sm cursor-text transition-[box-shadow,border-color] focus-within:ring-2 focus-within:ring-slate-300/60 focus-within:ring-offset-1 focus-within:border-slate-300 hover:border-slate-300/80",
                    className
                )}
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('input') && !target.closest('button')) inputRef.current?.focus();
                }}
            >
                {parsedValues.map(({ original, base, details }, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/90 pl-2.5 pr-1 py-1 text-sm shadow-sm max-w-full group/badge"
                    >
                        <span className="font-medium text-slate-700 truncate">{base}</span>
                        <span className="shrink-0 w-px h-3.5 bg-slate-200 rounded-full" aria-hidden />
                        <input
                            ref={(el) => {
                                if (el) extraInputRefs.current[index] = el;
                                else delete extraInputRefs.current[index];
                            }}
                            type="text"
                            autoComplete="off"
                            className="min-w-[6ch] max-w-[200px] bg-slate-100/90 border border-slate-200/60 rounded-md outline-none text-xs px-2 py-1 text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-300/40 transition-[width]"
                            style={{ width: `${Math.max(details.length + 3, 8)}ch` }}
                            placeholder="détails…"
                            value={details}
                            onChange={(e) => {
                                const newDetails = e.target.value;
                                const newValues = [...selectedValues];
                                newValues[index] = newDetails !== "" ? `${base}${DETAILS_DELIMITER}${newDetails}` : base;
                                onSelect(newValues.join(', '));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                }
                                e.stopPropagation(); // Prevent cmdk/popover from capturing keys when typing in details
                            }}
                            disabled={disabled}
                        />
                        <button
                            type="button"
                            className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 transition-colors"
                            aria-label="Supprimer"
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(original); }}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </span>
                ))}
                <PopoverTrigger asChild>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => { setInputValue(e.target.value); setOpen(true); }}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedValues.length === 0 ? placeholder : "Ajouter…"}
                        className="flex-1 min-w-[100px] bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
                        disabled={disabled}
                    />
                </PopoverTrigger>
            </div>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-1 rounded-xl border-slate-200 shadow-lg bg-white"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command>
                    <CommandList className="max-h-[280px]">
                        <CommandGroup>
                            {filteredOptions.slice(0, 12).map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.value}
                                    onSelect={() => handleAdd(option.value, option.id)}
                                    className="rounded-lg py-2.5 cursor-pointer gap-2"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                                        <Plus className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="font-medium text-slate-700">{option.value}</span>
                                </CommandItem>
                            ))}
                            {inputValue && !filteredOptions.some(o => o.value.toLowerCase() === inputValue.toLowerCase()) && (
                                <CommandItem
                                    value={inputValue}
                                    onSelect={() => handleAdd(inputValue)}
                                    className="rounded-lg py-2.5 cursor-pointer gap-2 bg-amber-50/80 text-amber-900 border border-amber-200/60"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                                        <Plus className="h-3.5 w-3.5" />
                                    </span>
                                    <span><span className="text-amber-700">Ajouter</span> « {inputValue} »</span>
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
