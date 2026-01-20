import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpcClient } from "@/ui/lib/orpc/client";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Textarea } from "@/ui/components/ui/textarea";
import { Plus, Trash, Pencil, Search, MapPin, Phone, Mail, UserRound } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/ui/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui/components/ui/select";
import { Badge } from "@/ui/components/ui/badge";

export function ProfessionalContactsParams() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        type: "Doctor",
        specialty: "",
        address: "",
        phone: "",
        email: "",
        notes: ""
    });

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ['professionalContacts', searchQuery],
        queryFn: async () => {
            if (searchQuery) {
                return orpcClient.professionalContacts.search({ query: searchQuery });
            }
            return orpcClient.professionalContacts.list(undefined);
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return orpcClient.professionalContacts.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionalContacts'] });
            setIsAddOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (params: { id: string, data: Partial<typeof formData> }) => {
            return orpcClient.professionalContacts.update({ id: params.id, data: params.data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionalContacts'] });
            setEditingId(null);
            setIsAddOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.professionalContacts.delete({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionalContacts'] });
        }
    });

    const resetForm = () => {
        setFormData({
            name: "",
            type: "Doctor",
            specialty: "",
            address: "",
            phone: "",
            email: "",
            notes: ""
        });
        setEditingId(null);
    };

    const handleEdit = (contact: any) => {
        setFormData({
            name: contact.name,
            type: contact.type || "Doctor",
            specialty: contact.specialty || "",
            address: contact.address || "",
            phone: contact.phone || "",
            email: contact.email || "",
            notes: contact.notes || ""
        });
        setEditingId(contact.id);
        setIsAddOpen(true);
    };

    const handleSubmit = () => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-sm relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher un contact..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Dialog open={isAddOpen} onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Contact
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Modifier le contact" : "Ajouter un contact"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom / Raison Sociale</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Dr. Benali / Clinique..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Doctor">Médecin</SelectItem>
                                            <SelectItem value="Clinic">Clinique</SelectItem>
                                            <SelectItem value="Laboratory">Laboratoire</SelectItem>
                                            <SelectItem value="Optician">Opticien</SelectItem>
                                            <SelectItem value="Pharmacy">Pharmacie</SelectItem>
                                            <SelectItem value="Other">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="specialty">Spécialité</Label>
                                    <Input
                                        id="specialty"
                                        value={formData.specialty}
                                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                        placeholder="Ex: Cardiologue, Radiologie..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0550..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contact@exemple.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Adresse</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Adresse complète..."
                                    className="resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Informations supplémentaires..."
                                    className="resize-none h-20"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                            <Button onClick={handleSubmit}>{editingId ? "Enregistrer" : "Ajouter"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b sticky top-0 bg-slate-50 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-slate-500 w-[25%]">Nom</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500 w-[15%]">Type</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500 w-[30%]">Contact</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500 w-[20%]">Adresse</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-500 w-[10%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                        Aucun contact trouvé.
                                    </td>
                                </tr>
                            ) : (
                                contacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-slate-50 group">
                                        <td className="px-4 py-3 align-top">
                                            <div className="font-medium text-slate-900">{contact.name}</div>
                                            {contact.specialty && (
                                                <div className="text-xs text-blue-600 mt-0.5">{contact.specialty}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <Badge variant="secondary" className="font-normal text-xs">
                                                {contact.type}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 align-top text-slate-600 space-y-1">
                                            {contact.phone && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Phone className="h-3 w-3" />
                                                    {contact.phone}
                                                </div>
                                            )}
                                            {contact.email && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Mail className="h-3 w-3" />
                                                    {contact.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 align-top text-slate-600 text-xs">
                                            {contact.address && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                                    <span className="line-clamp-2">{contact.address}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right align-top">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEdit(contact)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteMutation.mutate(contact.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
