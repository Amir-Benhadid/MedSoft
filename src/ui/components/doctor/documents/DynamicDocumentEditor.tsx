/**
 * Dynamic Document Editor
 * 
 * Allows doctors to fill out radiography documents based on templates.
 * Supports:
 * - Template Selection from 'radiography_document_definitions'
 * - Eye Selection: Same vs Separate
 * - Dynamic Fields: Add unlimited fields per section
 * - Autocomplete: Title (from field defs) and Content (from default values)
 * - Conclusion: List of bullets or text
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";
import { Plus, Trash, Eye, AlignJustify, Check } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/ui/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/ui/popover";
import { cn } from "@/ui/lib/utils";

// --- Types ---
interface DynamicField {
    id: string; // Random client-side ID for list key
    title: string;
    content: string;
}

interface DynamicDocumentState {
    templateId: string | null;
    templateTitle?: string;
    eyeTreatment: 'same' | 'separate';

    // Data Storage
    bothLines: DynamicField[];
    odLines: DynamicField[];
    ogLines: DynamicField[];

    conclusion: string[]; // Bullets
}

export function DynamicDocumentEditor() {
    // Stores
    const { documentOverrides, setDocumentOverride } = useConsultationStore();

    // Local state for UI, syncs to store on change
    // We use a unique ID 'radiography_dynamic' for now, or we could support multiple instances
    const DOC_ID = 'radiography_dynamic';
    const storeData = documentOverrides[DOC_ID] as DynamicDocumentState | undefined;

    // Queries
    const { data: templates = [] } = useQuery({
        queryKey: ['radiography', 'documents', 'list'],
        queryFn: () => orpcClient.radiography.listDocuments(),
    });

    // Helper to get field suggestions for a template
    const activeTemplate = templates.find(t => t.id === storeData?.templateId);

    // Initial State Setup
    useEffect(() => {
        if (!storeData) {
            setDocumentOverride(DOC_ID, {
                templateId: null,
                eyeTreatment: 'same',
                bothLines: [],
                odLines: [],
                ogLines: [],
                conclusion: []
            });
        }
    }, [storeData, setDocumentOverride]);

    // Update Helpers
    const updateState = (updates: Partial<DynamicDocumentState>) => {
        setDocumentOverride(DOC_ID, { ...storeData, ...updates });
    };

    if (!storeData) return <div>Chargement...</div>;

    return (
        <div className="h-full flex flex-col space-y-4 p-1">
            {/* Header: Template & Eye Mode Selection */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border">
                <div className="flex-1 max-w-sm space-y-1">
                    <Label className="text-xs text-muted-foreground">Modèle de Document</Label>
                    <Select
                        value={storeData.templateId || "none"}
                        onValueChange={(val) => {
                            const selected = templates.find(t => t.id === val);
                            updateState({
                                templateId: val === "none" ? null : val,
                                templateTitle: selected?.title || undefined
                            });
                        }}
                    >
                        <SelectTrigger className="h-9 bg-white">
                            <SelectValue placeholder="Choisir un modèle..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Aucun / Vide</SelectItem>
                            {templates.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 max-w-[200px] space-y-1">
                    <Label className="text-xs text-muted-foreground">Mode de Traitement</Label>
                    <div className="flex bg-white rounded-md border p-1 h-9 items-center">
                        <button
                            className={cn(
                                "flex-1 text-xs font-medium rounded-sm px-2 py-1 transition-colors",
                                storeData.eyeTreatment === 'same' ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                            )}
                            onClick={() => updateState({ eyeTreatment: 'same' })}
                        >
                            OD = OG
                        </button>
                        <button
                            className={cn(
                                "flex-1 text-xs font-medium rounded-sm px-2 py-1 transition-colors",
                                storeData.eyeTreatment === 'separate' ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                            )}
                            onClick={() => updateState({ eyeTreatment: 'separate' })}
                        >
                            Séparé
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto space-y-6">

                {storeData.eyeTreatment === 'same' ? (
                    <SectionBlock
                        title="Détails (OD & OG)"
                        lines={storeData.bothLines}
                        onChange={lines => updateState({ bothLines: lines })}
                        template={activeTemplate}
                    />
                ) : (
                    <div className="flex flex-col gap-4">
                        <SectionBlock
                            title="OD"
                            lines={storeData.odLines}
                            onChange={lines => updateState({ odLines: lines })}
                            template={activeTemplate}
                            colorClass="border-blue-200 bg-blue-50/30"
                        />
                        <SectionBlock
                            title="OG"
                            lines={storeData.ogLines}
                            onChange={lines => updateState({ ogLines: lines })}
                            template={activeTemplate}
                            colorClass="border-green-200 bg-green-50/30"
                        />
                    </div>
                )}

                <div className="pt-4 border-t">
                    <ConclusionBlock
                        bullets={storeData.conclusion}
                        onChange={bullets => updateState({ conclusion: bullets })}
                    />
                </div>
            </div>
        </div>
    );
}

// --- Sub Components ---

/**
 * Renders a list of dynamic fields (Title + Content)
 */
function SectionBlock({
    title,
    lines,
    onChange,
    template,
    colorClass
}: {
    title: string,
    lines: DynamicField[],
    onChange: (lines: DynamicField[]) => void,
    template?: any,
    colorClass?: string
}) {

    const addLine = () => {
        onChange([...lines, { id: Math.random().toString(), title: '', content: '' }]);
    };

    const updateLine = (id: string, updates: Partial<DynamicField>) => {
        onChange(lines.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const removeLine = (id: string) => {
        onChange(lines.filter(l => l.id !== id));
    };

    // Prepare Auto-complete options
    const availableFields = template?.fields || [];

    return (
        <div className={cn("rounded-lg border p-4", colorClass || "bg-white")}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <AlignJustify className="w-4 h-4 text-muted-foreground" />
                    {title}
                </h3>
                <Button variant="ghost" size="sm" onClick={addLine} className="h-7 text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Ajouter Champ
                </Button>
            </div>

            <div className="space-y-3">
                {lines.map((line, idx) => {
                    // Find field def if title matches (for content autocomplete)
                    const fieldDef = availableFields.find((f: any) => f.label === line.title);
                    const contentSuggestions = fieldDef?.default_values || [];

                    return (
                        <div key={line.id} className="flex gap-2 items-start group">
                            {/* Title Autocomplete */}
                            <div className="w-1/3 min-w-[150px]">
                                <AutocompleteInput
                                    value={line.title}
                                    onChange={(val) => updateLine(line.id, { title: val })}
                                    suggestions={availableFields.map((f: any) => f.label)}
                                    placeholder="Titre..."
                                    className="font-medium"
                                />
                            </div>

                            {/* Content Autocomplete (dependent on Title) */}
                            <div className="flex-1">
                                <AutocompleteInput
                                    value={line.content}
                                    onChange={(val) => updateLine(line.id, { content: val })}
                                    suggestions={contentSuggestions}
                                    placeholder="Contenu..."
                                    freeText
                                />
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLine(line.id)}
                                className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}

                {lines.length === 0 && (
                    <div
                        className="border-2 border-dashed rounded-md p-4 text-center text-xs text-muted-foreground cursor-pointer hover:bg-black/5 transition-colors"
                        onClick={addLine}
                    >
                        Cliquez pour ajouter un champ
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Renders the conclusion section (Bullet points)
 */
function ConclusionBlock({ bullets, onChange }: { bullets: string[], onChange: (b: string[]) => void }) {
    const addBullet = () => onChange([...bullets, ""]);
    const updateBullet = (idx: number, val: string) => {
        const next = [...bullets];
        next[idx] = val;
        onChange(next);
    };
    const removeBullet = (idx: number) => {
        onChange(bullets.filter((_, i) => i !== idx));
    };

    return (
        <div className="bg-slate-50/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold text-sm">Conclusion / Résumé</Label>
                <Button variant="ghost" size="sm" onClick={addBullet} className="h-7 text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Ajouter Puce
                </Button>
            </div>

            <div className="space-y-2">
                {bullets.map((txt, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                        <Textarea
                            value={txt}
                            onChange={e => updateBullet(idx, e.target.value)}
                            className="min-h-[38px] h-[38px] py-2 resize-none bg-white"
                            placeholder="..."
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBullet(idx)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {bullets.length === 0 && (
                    <div
                        className="text-xs text-muted-foreground italic cursor-pointer p-2 hover:bg-black/5 rounded"
                        onClick={addBullet}
                    >
                        Aucune conclusion. Cliquez pour ajouter.
                    </div>
                )}
            </div>
        </div>
    );
}


/**
 * Generic Autocomplete Input
 */
function AutocompleteInput({
    value,
    onChange,
    suggestions = [],
    placeholder,
    className,
    freeText = true
}: {
    value: string,
    onChange: (v: string) => void,
    suggestions: string[],
    placeholder?: string,
    className?: string,
    freeText?: boolean
}) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-full">
                    <Input
                        value={value}
                        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
                        // onFocus removed to prevent conflict with Popover toggle
                        placeholder={placeholder}
                        className={cn("w-full bg-white", className)}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command>
                    {/* We don't use CommandInput to avoid double input feel, we filter manually or let user type in main input */}
                    <CommandList>
                        <CommandEmpty className="py-2 px-4 text-xs text-muted-foreground">
                            {freeText ? "Tapez pour créer..." : "Aucun résultat."}
                        </CommandEmpty>
                        <CommandGroup>
                            {suggestions.map((s) => (
                                <CommandItem
                                    key={s}
                                    value={s}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? currentValue : currentValue); // CommandItem lowercases value, use original 's' if needed but s is value
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === s ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {s}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
