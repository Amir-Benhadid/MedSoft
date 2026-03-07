import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Plus } from "lucide-react";
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
    placeholder = "-",
    className,
    disabled = false
}: SmartMultiSelectInputProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // To suppress the autocomplete when user dismisses or selects something
    const [lastSegmentStart, setLastSegmentStart] = useState(-1);
    const [isSuppressed, setIsSuppressed] = useState(false);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data: options = [], isLoading } = useQuery({
        queryKey: ['autocomplete', category],
        queryFn: async () => {
            return orpcClient.autocomplete.list({ category });
        }
    });

    const incrementMutation = useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.autocomplete.increment({ id });
        }
    });

    // Reset selected index when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPosition = e.target.selectionStart;
        onSelect(newValue);

        const lastCommaIndex = newValue.lastIndexOf(',', cursorPosition - 1);
        const segmentStart = lastCommaIndex + 1;
        const segmentText = newValue.slice(segmentStart, cursorPosition);

        let shouldSuppress = isSuppressed;
        if (segmentStart !== lastSegmentStart) {
            setLastSegmentStart(segmentStart);
            shouldSuppress = false;
        }

        setIsSuppressed(shouldSuppress);

        const trimmedSegment = segmentText.trimStart();
        setSearchQuery(trimmedSegment);

        if (trimmedSegment.length > 0 && !shouldSuppress) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    const handleAdd = (optionValue: string, optionId?: string) => {
        if (!textareaRef.current) return;

        const cursorPosition = textareaRef.current.selectionStart;
        const lastCommaIndex = value.lastIndexOf(',', cursorPosition - 1);
        const segmentStart = lastCommaIndex + 1;
        const nextCommaIndex = value.indexOf(',', cursorPosition);

        const pre = value.slice(0, segmentStart);
        const post = nextCommaIndex === -1 ? "" : value.slice(nextCommaIndex);

        // Preserve leading whitespace
        const originalSegment = value.slice(segmentStart, cursorPosition);
        const leadingSpace = originalSegment.match(/^\s*/)?.[0] || "";

        const newValueInsert = leadingSpace + optionValue;
        const newValue = pre + newValueInsert + post;

        onSelect(newValue);
        setIsSuppressed(true);
        setOpen(false);

        if (optionId) {
            incrementMutation.mutate(optionId);
        }

        // Restore focus and cursor
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursor = pre.length + newValueInsert.length;
                textareaRef.current.setSelectionRange(newCursor, newCursor);
            }
        }, 0);
    };

    const filteredOptions = options.filter(opt =>
        opt.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showPopover = open && !isLoading && filteredOptions.length > 0;

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (showPopover) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((p) => Math.min(p + 1, filteredOptions.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((p) => Math.max(p - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = filteredOptions[selectedIndex];
                if (selected) {
                    handleAdd(selected.value, selected.id);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsSuppressed(true);
                setOpen(false);
            }
        }
    };

    const handleOuterClick = () => {
        textareaRef.current?.focus();
    };

    const handleTextareaClick = () => {
        if (open) {
            setOpen(false);
            setIsSuppressed(true);
        }
    };

    return (
        <Popover open={showPopover} onOpenChange={(updatedOpen) => {
            if (!updatedOpen) {
                setOpen(false);
                setIsSuppressed(true);
            }
        }}>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "flex flex-col min-h-[38px] w-full rounded-lg border border-slate-200 bg-white/90 text-sm shadow-sm cursor-text transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 hover:border-slate-300",
                        className
                    )}
                    onClick={handleOuterClick}
                >
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                        onClick={handleTextareaClick}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="flex-1 w-full h-full bg-transparent outline-none placeholder:text-slate-400 text-slate-700 resize-none p-2"
                        style={{ overflowY: 'auto' }}
                    />
                </div>
            </PopoverTrigger>

            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-1 rounded-xl border-slate-200 shadow-lg bg-white"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={() => setOpen(false)}
            >
                <Command shouldFilter={false}>
                    <CommandList className="max-h-[280px]">
                        <CommandGroup>
                            {filteredOptions.slice(0, 12).map((option, idx) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.value}
                                    onSelect={() => handleAdd(option.value, option.id)}
                                    className={cn(
                                        "rounded-lg py-2.5 cursor-pointer gap-2 transition-colors",
                                        idx === selectedIndex && "bg-slate-100/80 text-slate-900"
                                    )}
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                                        <Plus className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="font-medium text-slate-700">{option.value}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
