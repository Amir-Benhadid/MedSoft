/**
 * Radiography Parameters Setting
 * 
 * Allows doctors to manage dynamic document definitions (templates) and their fields.
 * This corresponds to the requirement: "selection of the document title from a database list... editable only via the parameters tab"
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Separator } from '@/ui/components/ui/separator';
import { useToast } from "@/ui/hooks/use-toast";
import { Plus, Trash, Save, Edit, X } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/ui/components/ui/table";
import { Badge } from '@/ui/components/ui/badge';

export function RadiographyParams() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isCreatingDoc, setIsCreatingDoc] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');

    // --- Queries ---
    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['radiography', 'documents', 'list'],
        queryFn: () => orpcClient.radiography.listDocuments(),
    });

    const selectedDoc = documents.find(d => d.id === selectedDocId);

    // --- Mutations ---
    const createDocMutation = useMutation({
        mutationFn: (title: string) => orpcClient.radiography.createDocument({ title }),
        onSuccess: (newDoc) => {
            queryClient.invalidateQueries({ queryKey: ['radiography'] });
            setSelectedDocId(newDoc.id);
            setIsCreatingDoc(false);
            setNewDocTitle('');
            toast({ title: "Document créé" });
        }
    });

    const deleteDocMutation = useMutation({
        mutationFn: (id: string) => orpcClient.radiography.deleteDocument({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['radiography'] });
            if (selectedDocId) setSelectedDocId(null);
            toast({ title: "Document supprimé" });
        }
    });

    const createFieldMutation = useMutation({
        mutationFn: (data: { documentId: string, label: string, defaultValues: string[] }) =>
            orpcClient.radiography.createField(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['radiography'] });
            toast({ title: "Champ ajouté" });
        }
    });

    const deleteFieldMutation = useMutation({
        mutationFn: (id: string) => orpcClient.radiography.deleteField({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['radiography'] });
            toast({ title: "Champ supprimé" });
        }
    });

    // --- UI Helpers ---
    const handleCreateDoc = () => {
        if (!newDocTitle.trim()) return;
        createDocMutation.mutate(newDocTitle);
    };

    return (
        <div className="flex h-full gap-6">
            {/* Left Pane: Document List */}
            <div className="w-1/3 flex flex-col gap-4">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Types de Documents</CardTitle>
                        <CardDescription>
                            Gérez les modèles de documents dynamiques.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto min-h-0 space-y-2">
                        {isLoading && <div className="text-sm text-muted-foreground p-2">Chargement...</div>}
                        {!isLoading && documents.length === 0 && (
                            <div className="text-sm text-muted-foreground p-2 italic">Aucun document défini.</div>
                        )}
                        {documents.map(doc => (
                            <div
                                key={doc.id}
                                className={`flex items-center justify-between p-3 rounded-md cursor-pointer border transition-colors ${selectedDocId === doc.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                                onClick={() => setSelectedDocId(doc.id)}
                            >
                                <span className="font-medium">{doc.title}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Supprimer ce document et tous ses champs ?")) {
                                            deleteDocMutation.mutate(doc.id);
                                        }
                                    }}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="pt-2 border-t">
                        {isCreatingDoc ? (
                            <div className="flex w-full items-center gap-2">
                                <Input
                                    placeholder="Titre..."
                                    value={newDocTitle}
                                    onChange={e => setNewDocTitle(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleCreateDoc()}
                                />
                                <Button size="icon" onClick={handleCreateDoc} disabled={!newDocTitle.trim()}>
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setIsCreatingDoc(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full" variant="outline" onClick={() => setIsCreatingDoc(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Nouveau Document
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* Right Pane: Field Details */}
            <div className="flex-1">
                {selectedDoc ? (
                    <DocumentFieldEditor
                        documentId={selectedDoc.id}
                        fields={selectedDoc.fields || []}
                        onCreateField={createFieldMutation.mutate}
                        onDeleteField={deleteFieldMutation.mutate}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center border rounded-xl bg-slate-50 text-muted-foreground">
                        Sélectionnez un document pour éditer ses champs.
                    </div>
                )}
            </div>
        </div>
    );
}

function DocumentFieldEditor({
    documentId,
    fields,
    onCreateField,
    onDeleteField
}: {
    documentId: string,
    fields: any[],
    onCreateField: (data: any) => void,
    onDeleteField: (id: string) => void
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [label, setLabel] = useState('');
    const [valuesStr, setValuesStr] = useState(''); // Comma separated

    const handleAdd = () => {
        if (!label.trim()) return;
        const values = valuesStr.split(',').map(s => s.trim()).filter(s => !!s);
        onCreateField({ documentId, label, defaultValues: values });
        setIsAdding(false);
        setLabel('');
        setValuesStr('');
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Champs du Document</CardTitle>
                <CardDescription>
                    Définissez les champs automatiques et leurs valeurs suggérées (séparées par des virgules).
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Titre du Champ</TableHead>
                            <TableHead>Valeurs d'Autocomplete</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map(field => (
                            <TableRow key={field.id}>
                                <TableCell className="font-medium">{field.label}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {field.default_values?.map((v: string) => (
                                            <Badge key={v} variant="secondary" className="text-xs font-normal">
                                                {v}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDeleteField(field.id)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {fields.length === 0 && !isAdding && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    Aucun champ défini.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="border-t pt-4 bg-muted/20">
                {isAdding ? (
                    <div className="flex w-full items-end gap-3 p-2 bg-background rounded-md border shadow-sm">
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs">Titre du champ</Label>
                            <Input
                                placeholder="Ex: Anesthésie"
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                            />
                        </div>
                        <div className="flex-[2] space-y-1">
                            <Label className="text-xs">Valeurs (séparées par virgule)</Label>
                            <Input
                                placeholder="Ex: Topique, Péribulbaire..."
                                value={valuesStr}
                                onChange={e => setValuesStr(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={!label.trim()}>Ajouter</Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)}>Annuler</Button>
                    </div>
                ) : (
                    <Button className="w-full" variant="secondary" onClick={() => setIsAdding(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un champ
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
