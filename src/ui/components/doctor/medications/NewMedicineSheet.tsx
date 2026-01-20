import { useState } from "react";
import { Plus } from "lucide-react";
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
    SheetTrigger,
} from "@/ui/components/ui/sheet";

export function NewMedicineSheet() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const [data, setData] = useState({
        medication_name: "",
        strength: "",
        type: "",
        packaging: "",
        instructions: "",
        category: ""
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => orpcClient.medications.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medications'] });
            setOpen(false);
            setData({
                medication_name: "",
                strength: "",
                type: "",
                packaging: "",
                instructions: "",
                category: ""
            });
        }
    });

    const handleSubmit = () => {
        if (!data.medication_name) return;
        createMutation.mutate(data);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                    <Plus className="w-4 h-4" /> Nouveau médicament
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[500px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Ajouter un médicament</SheetTitle>
                    <SheetDescription>
                        Ajoutez un nouveau médicament à la base de données.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom du médicament <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={data.medication_name}
                            onChange={(e) => setData({ ...data, medication_name: e.target.value })}
                            placeholder="Ex: Paracétamol"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="strength">Dosage (Force)</Label>
                        <Input
                            id="strength"
                            value={data.strength}
                            onChange={(e) => setData({ ...data, strength: e.target.value })}
                            placeholder="Ex: 500mg"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Forme galénique</Label>
                        <Input
                            id="type"
                            value={data.type}
                            onChange={(e) => setData({ ...data, type: e.target.value })}
                            placeholder="Ex: Comprimé"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="packaging">Conditionnement</Label>
                        <Input
                            id="packaging"
                            value={data.packaging}
                            onChange={(e) => setData({ ...data, packaging: e.target.value })}
                            placeholder="Ex: Boîte de 16"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Catégorie</Label>
                        <Input
                            id="category"
                            value={data.category}
                            onChange={(e) => setData({ ...data, category: e.target.value })}
                            placeholder="Ex: Antalgique"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="instructions">Instructions par défaut</Label>
                        <Textarea
                            id="instructions"
                            value={data.instructions}
                            onChange={(e) => setData({ ...data, instructions: e.target.value })}
                            placeholder="Ex: 1 comprimé 3 fois par jour"
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={!data.medication_name || createMutation.isPending}>
                        {createMutation.isPending ? "Ajout..." : "Ajouter"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
