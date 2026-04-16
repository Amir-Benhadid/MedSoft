import * as React from 'react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Popover, PopoverContent, PopoverAnchor } from "@/ui/components/ui/popover";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/ui/lib/utils";

export interface OptionType {
    value: string;
    label: string;
}

interface DashboardSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: OptionType[];
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    bold?: boolean;
}

export function DashboardSelect({ 
    value, 
    onChange, 
    options, 
    disabled, 
    placeholder, 
    className, 
    bold 
}: DashboardSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Internal state for the input value
    const [inputValue, setInputValue] = useState(() => (value ?? '') === '' ? '' : (value ?? ''));

    // Sync state if external value changes
    useEffect(() => {
        setInputValue((value ?? '') === '' ? '' : (value ?? ''));
    }, [value]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const scrollContainerCallbackRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const hasVal = value && value !== '';
        // Special case for scrolling to a default or current value
        const targetValue = hasVal ? value : '';

        const element = node.querySelector(`[data-value="${targetValue}"]`);
        if (element) {
            element.scrollIntoView({ block: 'start', behavior: 'auto' });
        } else if (!hasVal) {
            // If no value, try to scroll to center or "0.00" if exists
            const zeroElement = node.querySelector(`[data-value="0.00"]`) || node.querySelector(`[data-value="550"]`);
            if (zeroElement) zeroElement.scrollIntoView({ block: 'center' });
        }
    }, [value]);

    const handleFocus = () => {
        if (!disabled) setOpen(true);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        setOpen(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            onChange(val === '' ? '' : val);
        }, 300);
    };

    const handleSelect = (optionValue: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onChange(optionValue);
        setInputValue(optionValue === '' ? '' : optionValue);
        setOpen(false);
        inputRef.current?.blur();
    };

    const filteredOptions = useMemo(() => {
        if (!inputValue) return options;

        const cleanInput = inputValue.replace(/[+-]/g, '').trim();
        if (!cleanInput) return options;

        const isDecimalField = options.some(o => o.value.includes('.') && !o.value.includes('/'));

        return options.filter(opt => {
            if (opt.value === '') return false;

            if (!isDecimalField && !/^[+-]?\d/.test(opt.value)) {
                return opt.label.toLowerCase().includes(inputValue.toLowerCase());
            }

            const optVal = opt.value;
            const cleanOpt = optVal.replace(/[+-]/g, '');

            if (cleanOpt.startsWith(cleanInput)) {
                if (isDecimalField) {
                    const charAfter = cleanOpt[cleanInput.length];
                    return charAfter === undefined || charAfter === '.';
                }
                return true;
            }
            return false;
        });
    }, [options, inputValue]);

    const hasValue = !!inputValue;

    return (
        <Popover open={open && !disabled}>
            <PopoverAnchor asChild>
                <div className={cn("relative w-full", className)} ref={containerRef}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={cn(
                            "flex w-full rounded-md border border-slate-200 bg-white/80 font-bold text-slate-900 ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 pr-5 xl:pr-6 cursor-text hover:bg-white transition-all shadow-sm",
                            bold && "font-extrabold text-slate-900 border-slate-300 ring-1 ring-slate-100",
                            className
                        )}
                        style={{ height: 'var(--dash-h)', paddingInline: 'var(--dash-input-p)', fontSize: 'calc(var(--dash-label) + 1px)' }}
                        value={inputValue ?? ''}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onPointerDown={() => !disabled && setOpen(true)}
                        disabled={disabled}
                        placeholder={placeholder}
                    />
                    {hasValue && !disabled ? (
                        <X
                            className="absolute right-1.5 xl:right-2 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                            onClick={handleClear}
                        />
                    ) : (
                        <ChevronDown className="absolute right-1.5 xl:right-2 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400 pointer-events-none opacity-50" />
                    )}
                </div>
            </PopoverAnchor>

            <PopoverContent
                className="p-0 w-[--radix-popover-trigger-width] min-w-[80px] z-[100]"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => {
                    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                        setOpen(false);
                    }
                }}
            >
                <div ref={scrollContainerCallbackRef} className="max-h-60 overflow-auto py-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={`${option.value}-${option.label}`}
                                data-value={option.value}
                                className={cn(
                                    "px-2 cursor-pointer hover:bg-slate-100 font-medium text-slate-700",
                                    option.value === value && "bg-slate-50 text-slate-900 font-bold"
                                )}
                                style={{ paddingBlock: 'calc(var(--dash-p) / 2.5)', fontSize: 'var(--dash-label)' }}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="px-2 py-2 text-[10px] xl:text-xs text-slate-400 text-center italic">
                            Aucun résultat
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
