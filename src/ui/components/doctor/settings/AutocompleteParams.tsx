import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpcClient } from "@/ui/lib/orpc/client";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Trash, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui/components/ui/select";

export function AutocompleteParams() {
    const [category, setCategory] = useState("diagnostic");
    const [newValue, setNewValue] = useState("");
    const queryClient = useQueryClient();

    const { data: options = [], isLoading } = useQuery({
        queryKey: ['autocomplete', category],
        queryFn: async () => orpcClient.autocomplete.list({ category })
    });

    const createMutation = useMutation({
        mutationFn: async (val: string) => {
            return orpcClient.autocomplete.create({ category, value: val });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['autocomplete', category] });
            setNewValue("");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.autocomplete.delete({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['autocomplete', category] });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (params: { id: string, value: string }) => {
            return orpcClient.autocomplete.update({ id: params.id, value: params.value });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['autocomplete', category] });
        }
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium">Listes de Saisie Rapide</h3>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="diagnostic">Diagnostics</SelectItem>
                            <SelectItem value="anterior_segment">Segment Antérieur</SelectItem>
                            <SelectItem value="antecedent_oph">Antécédents Ophtalmologiques</SelectItem>
                            <SelectItem value="antecedent_gen">Antécédents Généraux</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Nouvelle entrée..."
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && newValue && createMutation.mutate(newValue)}
                />
                <Button onClick={() => newValue && createMutation.mutate(newValue)} disabled={!newValue}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {options.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group">
                        <Input
                            className="border-none shadow-none focus-visible:ring-0 px-0 h-auto font-medium"
                            defaultValue={option.value}
                            onBlur={(e) => {
                                if (e.target.value !== option.value) {
                                    updateMutation.mutate({ id: option.id, value: e.target.value });
                                }
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
                            onClick={() => deleteMutation.mutate(option.id)}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            {options.length === 0 && !isLoading && (
                <div className="text-center py-10 text-muted-foreground">
                    Aucune entrée pour cette catégorie.
                </div>
            )}
        </div>
    );
}
