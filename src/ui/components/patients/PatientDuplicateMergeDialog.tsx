import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import { PatientDraft, PatientSearchResult } from '@/ui/hooks/usePatients';
import { formatDateDisplay } from '@/ui/lib/time';

interface PatientDuplicateMergeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: PatientSearchResult | null;
    isSubmitting?: boolean;
    onConfirm: (input: {
        survivor_id: string;
        duplicate_ids: string[];
        resolved_patient: Partial<PatientDraft>;
    }) => Promise<void> | void;
}

const fieldLabels: Record<keyof PatientDraft, string> = {
    surname: 'Nom',
    name: 'Prenom',
    dob: 'Date de naissance',
    phone_number: 'Telephone',
    street: 'Adresse',
    city: 'Ville',
    oph_ants: 'Antecedents ophtalmologiques',
    gen_ants: 'Antecedents generaux',
};

const textAreaFields = new Set<keyof PatientDraft>(['oph_ants', 'gen_ants']);

export function PatientDuplicateMergeDialog({
    open,
    onOpenChange,
    patient,
    isSubmitting,
    onConfirm,
}: PatientDuplicateMergeDialogProps) {
    const records = useMemo(() => {
        if (!patient) return [];
        return [patient, ...patient.duplicate_candidates];
    }, [patient]);

    const [survivorId, setSurvivorId] = useState('');
    const [resolvedPatient, setResolvedPatient] = useState<Partial<PatientDraft>>({});

    useEffect(() => {
        if (!patient || !open) return;

        setSurvivorId(patient.id);
        const initialValues: Partial<PatientDraft> = {};

        for (const field of Object.keys(fieldLabels) as Array<keyof PatientDraft>) {
            const preferredValue = pickPreferredValue(records.map(record => record[field] ?? null));
            initialValues[field] = preferredValue ?? undefined;
        }

        setResolvedPatient(initialValues);
    }, [patient, open, records]);

    const conflictingFields = useMemo(() => {
        return (Object.keys(fieldLabels) as Array<keyof PatientDraft>).filter(field => {
            const distinctValues = Array.from(new Set(
                records
                    .map(record => normalizeValue(record[field] ?? null))
                    .filter((value): value is string => value !== null)
            ));

            return distinctValues.length > 1;
        });
    }, [records]);

    if (!patient) return null;

    const handleSubmit = async () => {
        await onConfirm({
            survivor_id: survivorId,
            duplicate_ids: records.map(record => record.id).filter(id => id !== survivorId),
            resolved_patient: resolvedPatient,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Fusionner les doublons patient</DialogTitle>
                    <DialogDescription>
                        Choisissez le dossier principal puis la valeur a conserver pour chaque champ en conflit.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <Label>Dossiers concernes</Label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {records.map(record => {
                                const isPrimary = record.id === survivorId;

                                return (
                                    <div key={record.id} className={`rounded-lg border p-3 ${isPrimary ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-semibold">
                                                    {record.surname}   {record.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {record.dob ? formatDateDisplay(record.dob) : 'Date inconnue'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {record.street || 'Adresse vide'}{record.city ? `, ${record.city}` : ''}
                                                </div>
                                            </div>
                                            <Badge variant={isPrimary ? 'default' : 'secondary'}>
                                                {isPrimary ? 'Original' : getDuplicateBadgeLabel(record)}
                                            </Badge>
                                        </div>
                                        <Button
                                            type="button"
                                            variant={isPrimary ? 'default' : 'outline'}
                                            className="mt-3 w-full"
                                            onClick={() => setSurvivorId(record.id)}
                                        >
                                            {isPrimary ? 'Dossier principal selectionne' : 'Conserver comme original'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Resolution des champs</Label>
                        {conflictingFields.length === 0 && (
                            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                                Aucun conflit detecte. La fusion conservera les valeurs non vides du dossier principal et des doublons.
                            </div>
                        )}

                        {conflictingFields.map(field => (
                            <div key={field} className="rounded-lg border p-3 space-y-3">
                                <div className="font-medium">{fieldLabels[field]}</div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {records.map(record => {
                                        const rawValue = record[field] ?? '';
                                        const displayValue = field === 'dob' && rawValue ? formatDateDisplay(rawValue) : rawValue || 'Vide';
                                        const isSelected = normalizeValue(resolvedPatient[field] ?? null) === normalizeValue(rawValue || null);

                                        return (
                                            <Button
                                                key={`${field}-${record.id}`}
                                                type="button"
                                                variant={isSelected ? 'default' : 'outline'}
                                                className="h-auto justify-start whitespace-normal text-left"
                                                onClick={() => setResolvedPatient(prev => ({ ...prev, [field]: rawValue || undefined }))}
                                            >
                                                <div>
                                                    <div className="text-xs opacity-80">{record.surname} {record.name}</div>
                                                    <div>{displayValue}</div>
                                                </div>
                                            </Button>
                                        );
                                    })}
                                </div>
                                {textAreaFields.has(field) ? (
                                    <Textarea
                                        value={resolvedPatient[field] ?? ''}
                                        onChange={(event) => setResolvedPatient(prev => ({ ...prev, [field]: event.target.value || undefined }))}
                                        rows={3}
                                    />
                                ) : (
                                    <Input
                                        value={resolvedPatient[field] ?? ''}
                                        onChange={(event) => setResolvedPatient(prev => ({ ...prev, [field]: event.target.value || undefined }))}
                                        type={field === 'dob' ? 'date' : 'text'}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Fusion en cours...' : 'Fusionner'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function normalizeValue(value: string | null | undefined) {
    if (!value || !value.trim()) return null;
    return value.trim().toLowerCase();
}

function pickPreferredValue(values: Array<string | null | undefined>) {
    for (const value of values) {
        if (value && value.trim()) return value.trim();
    }

    return null;
}

function getDuplicateBadgeLabel(record: PatientSearchResult | (PatientSearchResult['duplicate_candidates'][number])) {
    if ('confidence' in record) {
        return record.confidence === 'high' ? 'Doublon probable' : 'A verifier';
    }

    return 'Dossier';
}
