import { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpcClient } from "@/ui/lib/orpc/client";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Plus, Search, Trash, Pencil } from "lucide-react";
import { NewMedicineSheet } from "@/ui/components/doctor/medications/NewMedicineSheet";
import { EditMedicineSheet } from "@/ui/components/doctor/medications/EditMedicineSheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/ui/components/ui/dialog";

const PAGE_SIZE = 30;

export function MedicationsParams() {
    const [search, setSearch] = useState("");
    const [editMedicine, setEditMedicine] = useState<{ id: string; medication_name: string; strength?: string | null; type?: string | null; packaging?: string | null; instructions?: string | null; category?: string | null } | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const loadMoreRef = useRef<HTMLTableRowElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useInfiniteQuery({
        queryKey: ['medications', search],
        queryFn: async ({ pageParam = 0 }) => {
            if (search.trim()) {
                return orpcClient.medications.search({ query: search, limit: PAGE_SIZE, offset: pageParam });
            }
            return orpcClient.medications.list({ limit: PAGE_SIZE, offset: pageParam });
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < PAGE_SIZE) return undefined;
            return allPages.reduce((acc, p) => acc + p.length, 0);
        }
    });

    const medications = data?.pages.flat() ?? [];

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const el = loadMoreRef.current;
        const root = scrollContainerRef.current;
        if (!el || !root || !hasNextPage) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    handleLoadMore();
                }
            },
            { root, rootMargin: '150px', threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleLoadMore, hasNextPage, isFetchingNextPage, medications.length]);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.medications.delete({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medications'] });
        }
    });

    const handleEdit = (med: typeof medications[0]) => {
        setEditMedicine(med);
        setEditOpen(true);
    };

    return (
        <div className="h-full flex flex-col p-6 gap-6">
            <div className="shrink-0 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un médicament..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <NewMedicineSheet />
            </div>

            <div ref={scrollContainerRef} className="flex-1 border rounded-lg overflow-auto relative min-h-0">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Nom</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Dosage</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Forme</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Catégorie</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    Chargement...
                                </td>
                            </tr>
                        ) : medications.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    Aucun médicament trouvé.
                                </td>
                            </tr>
                        ) : (
                            <>
                                {medications.map((med) => (
                                    <tr key={med.id} className="bg-white hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{med.medication_name}</td>
                                        <td className="px-4 py-3">{med.strength || "-"}</td>
                                        <td className="px-4 py-3">{med.type || "-"}</td>
                                        <td className="px-4 py-3">
                                            {med.category && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {med.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-0.5">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                                    onClick={() => handleEdit(med)}
                                                    title="Modifier"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" title="Supprimer">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Êtes-vous sûr ?</DialogTitle>
                                                            <DialogDescription>
                                                                Cette action ne peut pas être annulée. Cela supprimera définitivement
                                                                <strong> {med.medication_name}</strong> de la base de données.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button variant="outline">Annuler</Button>
                                                            </DialogClose>
                                                            <DialogClose asChild>
                                                                <Button
                                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                                    onClick={() => deleteMutation.mutate(med.id)}
                                                                >
                                                                    Supprimer
                                                                </Button>
                                                            </DialogClose>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {hasNextPage && (
                                    <tr ref={loadMoreRef}>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">
                                            {isFetchingNextPage ? "Chargement..." : "Faites défiler pour charger plus"}
                                        </td>
                                    </tr>
                                )}
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="shrink-0 text-xs text-muted-foreground text-center">
                {medications.length} médicament(s) affiché(s)
                {search && " (recherche active)"}
            </div>

            <EditMedicineSheet medicine={editMedicine} open={editOpen} onOpenChange={setEditOpen} />
        </div>
    );
}
