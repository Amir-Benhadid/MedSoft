import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpcClient } from "@/ui/lib/orpc/client";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Textarea } from "@/ui/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/ui/components/ui/sheet";

interface Medicine {
    id: string;
    medication_name: string;
    strength?: string | null;
    type?: string | null;
    packaging?: string | null;
    instructions?: string | null;
    category?: string | null;
}

interface EditMedicineSheetProps {
    medicine: Medicine | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditMedicineSheet({ medicine, open, onOpenChange }: EditMedicineSheetProps) {
    const queryClient = useQueryClient();
    const [data, setData] = useState({
        medication_name: "",
        strength: "",
        type: "",
        packaging: "",
        instructions: "",
        category: ""
    });

    useEffect(() => {
        if (medicine) {
            setData({
                medication_name: medicine.medication_name,
                strength: medicine.strength ?? "",
                type: medicine.type ?? "",
                packaging: medicine.packaging ?? "",
                instructions: medicine.instructions ?? "",
                category: medicine.category ?? ""
            });
        }
    }, [medicine]);

    const updateMutation = useMutation({
        mutationFn: (payload: { id: string; data: Record<string, unknown> }) =>
            orpcClient.medications.update({ id: payload.id, data: payload.data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medications'] });
            onOpenChange(false);
        }
    });

    const handleSubmit = () => {
        if (!medicine || !data.medication_name) return;
        updateMutation.mutate({
            id: medicine.id,
            data: {
                medication_name: data.medication_name,
                strength: data.strength || undefined,
                type: data.type || undefined,
                packaging: data.packaging || undefined,
                instructions: data.instructions || undefined,
                category: data.category || undefined,
            }
        });
    };

    if (!medicine) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Modifier le médicament</SheetTitle>
                    <SheetDescription>
                        Modifiez les informations du médicament.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Nom du médicament <span className="text-red-500">*</span></Label>
                        <Input
                            id="edit-name"
                            value={data.medication_name}
                            onChange={(e) => setData({ ...data, medication_name: e.target.value })}
                            placeholder="Ex: Paracétamol"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-strength">Dosage (Force)</Label>
                        <Input
                            id="edit-strength"
                            value={data.strength}
                            onChange={(e) => setData({ ...data, strength: e.target.value })}
                            placeholder="Ex: 500mg"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-type">Forme galénique</Label>
                        <Input
                            id="edit-type"
                            value={data.type}
                            onChange={(e) => setData({ ...data, type: e.target.value })}
                            placeholder="Ex: Comprimé"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-packaging">Conditionnement</Label>
                        <Input
                            id="edit-packaging"
                            value={data.packaging}
                            onChange={(e) => setData({ ...data, packaging: e.target.value })}
                            placeholder="Ex: Boîte de 16"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-category">Catégorie</Label>
                        <Input
                            id="edit-category"
                            value={data.category}
                            onChange={(e) => setData({ ...data, category: e.target.value })}
                            placeholder="Ex: Antalgique"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-instructions">Instructions par défaut</Label>
                        <Textarea
                            id="edit-instructions"
                            value={data.instructions}
                            onChange={(e) => setData({ ...data, instructions: e.target.value })}
                            placeholder="Ex: 1 comprimé 3 fois par jour"
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={!data.medication_name || updateMutation.isPending}>
                        {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
