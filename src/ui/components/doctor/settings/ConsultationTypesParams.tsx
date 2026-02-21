import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpcClient } from "@/ui/lib/orpc/client";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Plus, Trash, Pencil, Check, X, FlaskConical, FileText } from "lucide-react";
import { useConfig } from "@/ui/contexts/ConfigContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/ui/components/ui/dialog";

interface ConsultationTypesParamsProps {
    readonly?: boolean;
}

export function ConsultationTypesParams({ readonly = false }: ConsultationTypesParamsProps) {
    const queryClient = useQueryClient();
    const { businessType } = useConfig();
    const isOphthalmology = businessType === "cabinet-ophthalmologie";
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ label: "", amount: 0, color: "#3b82f6", nature: "normal" as "normal" | "radiography" });

    const { data: types = [], isLoading } = useQuery({
        queryKey: ['consultationTypes'],
        queryFn: async () => orpcClient.consultationTypes.list()
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return orpcClient.consultationTypes.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
            setIsAddOpen(false);
            setFormData({ label: "", amount: 0, color: "#3b82f6", nature: "normal" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (params: { id: number, data: Partial<typeof formData> }) => {
            return orpcClient.consultationTypes.update({ id: params.id, data: params.data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
            setEditingId(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return orpcClient.consultationTypes.delete({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
        }
    });

    const handleSaveEdit = (id: number) => {
        updateMutation.mutate({ id, data: formData });
    };

    const startEdit = (type: any) => {
        setEditingId(type.id);
        setFormData({ label: type.label, amount: type.amount, color: type.color, nature: type.nature || 'normal' });
    };

    return (
        <div className="h-full flex flex-col p-4 min-h-0">
            <div className="shrink-0 flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-slate-800">Activités</h3>
                    <p className="text-xs text-slate-500">Gérez les activités et tarifs</p>
                </div>
                {!readonly && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setFormData({ label: "", amount: 0, color: "#3b82f6", nature: "normal" })}>
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Nouveau
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle className="text-base">Ajouter une activité</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-3 py-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-xs">Nom</Label>
                                    <Input id="name" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="h-9" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount" className="text-xs">Prix (DZD)</Label>
                                        <Input id="amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="h-9" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="color" className="text-xs">Couleur</Label>
                                        <DebouncedColorInput id="color" value={formData.color} onChange={(val) => setFormData({ ...formData, color: val })} className="h-9 w-full p-1" />
                                    </div>
                                </div>
                                {isOphthalmology && (
                                    <div className="flex gap-2">
                                        <Button type="button" variant={formData.nature === "normal" ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, nature: "normal" })} className="flex-1 h-8"><FileText className="w-3.5 h-3.5 mr-1.5" />Normal</Button>
                                        <Button type="button" variant={formData.nature === "radiography" ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, nature: "radiography" })} className="flex-1 h-8"><FlaskConical className="w-3.5 h-3.5 mr-1.5" />Exploration</Button>
                                    </div>
                                )}
                            </div>
                            <Button size="sm" onClick={() => createMutation.mutate(formData)} className="mt-1">Ajouter</Button>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="flex-1 min-h-0 overflow-auto space-y-4">
            {/* Normal Activities Section */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> Activités Normales
                </h4>
                <div className="space-y-1">
                    {types.filter(type => type.nature !== 'radiography').map((type) => (
                        <div key={type.id} className="group flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                            {editingId === type.id ? (
                                <div className="flex-1 flex items-center gap-3 flex-wrap">
                                    <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Nom" className="h-8 w-40 text-sm" />
                                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} placeholder="Prix" className="h-8 w-24 text-sm" />
                                    <DebouncedColorInput value={formData.color} onChange={(val) => setFormData({ ...formData, color: val })} className="h-8 w-12 p-1" />
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSaveEdit(type.id)}><Check className="h-3 w-3" /></Button>
                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-6 h-6 rounded shrink-0" style={{ backgroundColor: type.color }} />
                                    <span className="flex-1 min-w-0 text-sm font-medium truncate">{type.label}</span>
                                    <span className="text-sm text-slate-600 tabular-nums">{type.amount.toLocaleString()} DZD</span>
                                    {!readonly && (
                                        <div className="flex gap-0.5 shrink-0">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-blue-600" onClick={() => startEdit(type)} title="Modifier"><Pencil className="h-3.5 w-3.5" /></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-red-600" onClick={() => deleteMutation.mutate(type.id)} title="Supprimer"><Trash className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Exploration Activities Section */}
            {isOphthalmology && types.some(type => type.nature === 'radiography') && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                        <FlaskConical className="h-4 w-4 text-purple-600" /> Explorations
                    </h4>
                    <div className="space-y-1">
                        {types.filter(type => type.nature === 'radiography').map((type) => (
                            <div key={type.id} className="group flex items-center gap-3 px-3 py-2 rounded-lg border border-purple-100 bg-white hover:bg-purple-50/30 transition-colors">
                                {editingId === type.id ? (
                                    <div className="flex-1 flex items-center gap-3 flex-wrap">
                                        <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Nom" className="h-8 w-40 text-sm" />
                                        <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} placeholder="Prix" className="h-8 w-24 text-sm" />
                                        <DebouncedColorInput value={formData.color} onChange={(val) => setFormData({ ...formData, color: val })} className="h-8 w-12 p-1" />
                                        <div className="flex gap-2">
                                            <Button size="sm" variant={formData.nature === "normal" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setFormData({ ...formData, nature: "normal" })}><FileText className="h-3 w-3 mr-1" />Normal</Button>
                                            <Button size="sm" variant={formData.nature === "radiography" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setFormData({ ...formData, nature: "radiography" })}><FlaskConical className="h-3 w-3 mr-1" />Exploration</Button>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSaveEdit(type.id)}><Check className="h-3 w-3" /></Button>
                                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-6 h-6 rounded shrink-0" style={{ backgroundColor: type.color }} />
                                        <span className="flex-1 min-w-0 text-sm font-medium truncate">{type.label}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">Exploration</span>
                                        <span className="text-sm text-slate-600 tabular-nums">{type.amount.toLocaleString()} DZD</span>
                                        {!readonly && (
                                            <div className="flex gap-0.5 shrink-0">
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-blue-600" onClick={() => startEdit(type)} title="Modifier"><Pencil className="h-3.5 w-3.5" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-red-600" onClick={() => deleteMutation.mutate(type.id)} title="Supprimer"><Trash className="h-3.5 w-3.5" /></Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

// Helper component to fix slow renders on color picker input
// It debounces the onChange event so the parent state doesn't update on every drag frame
import { useEffect } from "react";

function DebouncedColorInput({ value, onChange, className, id }: { value: string, onChange: (val: string) => void, className?: string, id?: string }) {
    const [localValue, setLocalValue] = useState(value);

    // Sync from parent if external value changes significantly (e.g. form reset)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounce updates to parent
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, 100); // 100ms debounce
        return () => clearTimeout(timer);
    }, [localValue, onChange, value]);

    return (
        <Input
            id={id}
            type="color"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={className}
        />
    );
}
