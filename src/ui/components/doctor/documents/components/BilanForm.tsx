import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { cn } from '@/ui/lib/utils';
import { InternalBilanFields } from '../hooks/useDocumentsState';

interface BilanFormProps {
    bilanType: keyof InternalBilanFields;
    title: string;
    fields: Array<{ key: string; label: string }>;
    bilanFields: InternalBilanFields;
    customFieldInput: string;
    onFieldChange: (bilanType: string, field: string, checked: boolean) => void;
    onCustomFieldInputChange: (value: string) => void;
    onAddCustomField: () => void;
    onRemoveCustomField: (index: number) => void;
}

const BilanForm: React.FC<BilanFormProps> = ({
    bilanType,
    title,
    fields,
    bilanFields,
    customFieldInput,
    onFieldChange,
    onCustomFieldInputChange,
    onAddCustomField,
    onRemoveCustomField,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && customFieldInput?.trim()) {
            e.preventDefault();
            onAddCustomField();
        }
    };

    return (
        <div className="space-y-3 font-sans text-sm pb-4">
            <div className="bg-card rounded-xl p-3 border border-border shadow-sm space-y-3">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-border pb-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground text-sm uppercase">{title}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sélectionnez les examens à inclure</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Standard Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {fields.map((field) => (
                            <div key={field.key} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                <Checkbox
                                    id={`${bilanType}-${field.key}`}
                                    checked={(bilanFields[bilanType][field.key as keyof typeof bilanFields[typeof bilanType]] as unknown) as boolean}
                                    onCheckedChange={(checked) =>
                                        onFieldChange(bilanType, field.key, checked === true)
                                    }
                                    className="mt-0.5 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
                                />
                                <Label
                                    htmlFor={`${bilanType}-${field.key}`}
                                    className="text-xs font-semibold text-slate-600 uppercase tracking-tight cursor-pointer select-none leading-relaxed"
                                >
                                    {field.label}
                                </Label>
                            </div>
                        ))}
                    </div>

                    {/* Custom Fields Section - single persistent input to prevent focus loss */}
                    <div className="pt-2 border-t border-border border-dashed mt-2 space-y-2">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Examens personnalisés</Label>

                        {(bilanFields[bilanType].customFields && bilanFields[bilanType].customFields.length > 0) && (
                            <div className="space-y-2">
                                {bilanFields[bilanType].customFields.map((field, index) => (
                                    <div key={`${field}-${index}`} className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20 group">
                                        <Checkbox checked={true} disabled className="data-[state=checked]:bg-primary data-[state=checked]:border-primary opacity-70" />
                                        <span className="text-xs font-semibold text-foreground uppercase tracking-tight flex-1">{field}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemoveCustomField(index)}
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Input
                                placeholder="Ajouter un examen personnalisé..."
                                value={customFieldInput ?? ''}
                                onChange={(e) => onCustomFieldInputChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-7 text-sm font-semibold text-foreground bg-background border-border focus:border-primary focus:ring-primary/20"
                            />
                            <Button
                                size="sm"
                                onClick={onAddCustomField}
                                disabled={!customFieldInput?.trim()}
                                className="h-7 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs uppercase tracking-tight shrink-0"
                            >
                                Ajouter
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BilanForm;
