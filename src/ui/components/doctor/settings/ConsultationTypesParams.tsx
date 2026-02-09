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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Activités</h3>
                    <p className="text-sm text-slate-500 mt-1">Gérez les différentes activités et leurs tarifs</p>
                </div>
                {!readonly && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setFormData({ label: "", amount: 0, color: "#3b82f6", nature: "normal" })} className="shadow-sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Nouveau Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter une activité</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Nom</Label>
                                    <Input
                                        id="name"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">Prix</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="color" className="text-right">Couleur</Label>
                                    <div className="col-span-3 flex gap-2">
                                        <DebouncedColorInput
                                            id="color"
                                            value={formData.color}
                                            onChange={(val) => setFormData({ ...formData, color: val })}
                                            className="w-12 h-10 p-1"
                                        />
                                    </div>
                                </div>
                                {isOphthalmology && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Nature</Label>
                                        <div className="col-span-3 flex gap-2">
                                            <Button
                                                type="button"
                                                variant={formData.nature === "normal" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setFormData({ ...formData, nature: "normal" })}
                                                className="flex-1"
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                Normal
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={formData.nature === "radiography" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setFormData({ ...formData, nature: "radiography" })}
                                                className="flex-1"
                                            >
                                                <FlaskConical className="w-4 h-4 mr-2" />
                                                Exploration
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button onClick={() => createMutation.mutate(formData)}>Ajouter</Button>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Normal Activities Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-600" />
                    <h4 className="text-lg font-bold text-slate-900">Activités Normales</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {types.filter(type => type.nature !== 'radiography').map((type) => (
                        <div key={type.id} className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            {editingId === type.id ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Nom</Label>
                                        <Input
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                            className="font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Prix</Label>
                                        <Input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                            className="font-mono font-bold"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Couleur</Label>
                                        <DebouncedColorInput
                                            value={formData.color}
                                            onChange={(val) => setFormData({ ...formData, color: val })}
                                            className="w-full h-10 p-1"
                                        />
                                    </div>
                                    {isOphthalmology && (
                                        <div>
                                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Nature</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="icon"
                                                    variant={formData.nature === "normal" ? "default" : "outline"}
                                                    className="flex-1 h-10"
                                                    onClick={() => setFormData({ ...formData, nature: "normal" })}
                                                    title="Normal"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant={formData.nature === "radiography" ? "default" : "outline"}
                                                    className="flex-1 h-10"
                                                    onClick={() => setFormData({ ...formData, nature: "radiography" })}
                                                    title="Exploration"
                                                >
                                                    <FlaskConical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" variant="default" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSaveEdit(type.id)}>
                                            <Check className="h-4 w-4 mr-1" />
                                            Sauvegarder
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingId(null)}>
                                            <X className="h-4 w-4 mr-1" />
                                            Annuler
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${type.color}20` }}>
                                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: type.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-bold text-slate-900 truncate">{type.label}</h4>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Activité</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{type.amount.toLocaleString()}</span>
                                            <span className="text-sm text-slate-500 font-medium">DZD</span>
                                        </div>
                                    </div>

                                    {!readonly && (
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                            <Button size="sm" variant="outline" className="flex-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" onClick={() => startEdit(type)}>
                                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                                Modifier
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" onClick={() => deleteMutation.mutate(type.id)}>
                                                <Trash className="h-3.5 w-3.5 mr-1.5" />
                                                Supprimer
                                            </Button>
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
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-bold text-slate-900">Explorations</h4>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {types.filter(type => type.nature === 'radiography').map((type) => (
                            <div key={type.id} className="group p-5 rounded-2xl bg-white border border-purple-200 shadow-sm hover:shadow-md transition-all">
                                {editingId === type.id ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Nom</Label>
                                            <Input
                                                value={formData.label}
                                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                                className="font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Prix</Label>
                                            <Input
                                                type="number"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                                className="font-mono font-bold"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Couleur</Label>
                                            <DebouncedColorInput
                                                value={formData.color}
                                                onChange={(val) => setFormData({ ...formData, color: val })}
                                                className="w-full h-10 p-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Nature</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="icon"
                                                    variant={formData.nature === "normal" ? "default" : "outline"}
                                                    className="flex-1 h-10"
                                                    onClick={() => setFormData({ ...formData, nature: "normal" })}
                                                    title="Normal"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant={formData.nature === "radiography" ? "default" : "outline"}
                                                    className="flex-1 h-10"
                                                    onClick={() => setFormData({ ...formData, nature: "radiography" })}
                                                    title="Exploration"
                                                >
                                                    <FlaskConical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" variant="default" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSaveEdit(type.id)}>
                                                <Check className="h-4 w-4 mr-1" />
                                                Sauvegarder
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingId(null)}>
                                                <X className="h-4 w-4 mr-1" />
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${type.color}20` }}>
                                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: type.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-bold text-slate-900 truncate">{type.label}</h4>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Activité</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{type.amount.toLocaleString()}</span>
                                                <span className="text-sm text-slate-500 font-medium">DZD</span>
                                            </div>

                                            <div>
                                                <span className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full bg-purple-100 text-purple-700">
                                                    <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                                                    Exploration
                                                </span>
                                            </div>
                                        </div>

                                        {!readonly && (
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                                <Button size="sm" variant="outline" className="flex-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" onClick={() => startEdit(type)}>
                                                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                                    Modifier
                                                </Button>
                                                <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" onClick={() => deleteMutation.mutate(type.id)}>
                                                    <Trash className="h-3.5 w-3.5 mr-1.5" />
                                                    Supprimer
                                                </Button>
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
