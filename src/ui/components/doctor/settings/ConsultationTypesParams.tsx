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
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Types de Consultation</h3>
                {!readonly && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setFormData({ label: "", amount: 0, color: "#3b82f6", nature: "normal" })}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nouveau Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter un type de consultation</DialogTitle>
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
                                                Radiographie
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

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="w-[40%] px-4 py-3 text-left font-medium text-slate-500">Nom</th>
                            <th className="w-[30%] px-4 py-3 text-left font-medium text-slate-500">Prix</th>
                            {isOphthalmology && <th className="w-[15%] px-4 py-3 text-left font-medium text-slate-500">Nature</th>}
                            <th className="w-[15%] px-4 py-3 text-left font-medium text-slate-500">Couleur</th>
                            {!readonly && <th className="w-[15%] px-4 py-3 text-right font-medium text-slate-500">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {types.map((type) => (
                            <tr key={type.id} className="bg-white">
                                <td className="px-4 py-3">
                                    {editingId === type.id ? (
                                        <Input
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        />
                                    ) : (
                                        <span className="font-medium">{type.label}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === type.id ? (
                                        <Input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        />
                                    ) : (
                                        <span className="font-mono">{type.amount.toLocaleString()} DZD</span>
                                    )}
                                </td>
                                {isOphthalmology && (
                                    <td className="px-4 py-3">
                                        {editingId === type.id ? (
                                            <div className="flex gap-1">
                                                <Button
                                                    size="icon"
                                                    variant={formData.nature === "normal" ? "default" : "outline"}
                                                    className="h-8 w-8"
                                                    onClick={() => setFormData({ ...formData, nature: "normal" })}
                                                    title="Normal"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant={formData.nature === "radiography" ? "default" : "outline"}
                                                    className="h-8 w-8"
                                                    onClick={() => setFormData({ ...formData, nature: "radiography" })}
                                                    title="Radiographie"
                                                >
                                                    <FlaskConical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {type.nature === "radiography" ? (
                                                    <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                                        <FlaskConical className="w-3 h-3 mr-1" />
                                                        Radiographie
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        Normal
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                )}
                                <td className="px-4 py-3">
                                    {editingId === type.id ? (
                                        <DebouncedColorInput
                                            value={formData.color}
                                            onChange={(val) => setFormData({ ...formData, color: val })}
                                            className="w-12 h-8 p-1"
                                        />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
                                    )}
                                </td>
                                {!readonly && (
                                    <td className="px-4 py-3 text-right">
                                        {editingId === type.id ? (
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSaveEdit(type.id)}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingId(null)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => startEdit(type)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteMutation.mutate(type.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
