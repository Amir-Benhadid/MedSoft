import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form';
import { Textarea } from '@/ui/components/ui/textarea';
import { Activity, Maximize2, FileEdit, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/ui/components/ui/badge';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { cn } from '@/ui/lib/utils';
import { SmartMultiSelectInput } from '@/ui/components/shared/SmartMultiSelectInput';
import { useConfig } from '@/ui/contexts/ConfigContext';

interface CompactAntecedentsSectionProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    control: Control<any>;
}

export const CompactAntecedentsSection = ({ register, errors, control }: CompactAntecedentsSectionProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { appMode } = useConfig();

    return (
        <div className="space-y-3">
            <div
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
            >
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-amber-50 group-hover:bg-amber-100 transition-colors">
                        <Activity className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700 transition-colors">Antécédents</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 opacity-80 uppercase tracking-tighter">Optionnel</Badge>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                >
                    <Maximize2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-500" />
                </Button>
            </div>

            <div className="grid gap-2.5">
                {appMode !== 'secretary' && (
                    <div className="relative group">
                        <Controller
                            name="oph_ants"
                            control={control}
                            render={({ field }) => (
                                <SmartMultiSelectInput
                                    category="antecedent_oph"
                                    value={field.value}
                                    onSelect={field.onChange}
                                    className="h-auto min-h-[50px] whitespace-normal bg-white"
                                />
                            )}
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 pointer-events-none">
                            <Badge className="h-4 px-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none text-[9px] font-bold uppercase shadow-none ring-0">
                                Oph
                            </Badge>
                        </div>
                    </div>
                )}

                <div className="relative group">
                    <Controller
                        name="gen_ants"
                        control={control}
                        render={({ field }) => (
                            <SmartMultiSelectInput
                                category="antecedent_gen"
                                value={field.value}
                                onSelect={field.onChange}
                                className="h-auto min-h-[50px] whitespace-normal bg-white"
                            />
                        )}
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 pointer-events-none">
                        <Badge className="h-4 px-1 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none text-[9px] font-bold uppercase shadow-none ring-0">
                            Gen
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Expander Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden outline-none border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-amber-50 to-white border-b border-amber-100/50">
                        <DialogTitle className="flex items-center gap-3 text-slate-900">
                            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200">
                                <FileEdit className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold">Modifier les Antécédents</span>
                                <span className="text-xs font-normal text-slate-500 uppercase tracking-widest leading-none">Historique Médical du Patient</span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 bg-white">
                        {appMode !== 'secretary' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Ophtalmologiques
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium italic">Glaucome, Chirurgies, etc.</span>
                                </div>
                                <Controller
                                    name="oph_ants"
                                    control={control}
                                    render={({ field }) => (
                                        <SmartMultiSelectInput
                                            category="antecedent_oph"
                                            value={field.value || ''}
                                            onSelect={field.onChange}
                                            className="min-h-[140px] p-4 border-slate-200 focus:ring-2 focus:ring-amber-500/20 transition-all rounded-xl"
                                        />
                                    )}
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    Généraux
                                </label>
                                <span className="text-[10px] text-slate-400 font-medium italic">Diabète, HTA, Allergies...</span>
                            </div>
                            <Controller
                                name="gen_ants"
                                control={control}
                                render={({ field }) => (
                                    <SmartMultiSelectInput
                                        category="antecedent_gen"
                                        value={field.value || ''}
                                        onSelect={field.onChange}
                                        className="min-h-[140px] p-4 border-slate-200 focus:ring-2 focus:ring-amber-500/20 transition-all rounded-xl"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-slate-50/80 border-t border-slate-100/80 flex items-center gap-2">
                        <Button
                            onClick={() => setIsDialogOpen(false)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2 h-auto rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2 ml-auto"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Terminer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

CompactAntecedentsSection.displayName = 'CompactAntecedentsSection';

