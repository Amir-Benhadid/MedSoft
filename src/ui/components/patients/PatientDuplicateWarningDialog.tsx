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
import { PatientDuplicateCandidate } from '@/ui/hooks/usePatients';
import { formatDateDisplay } from '@/ui/lib/time';

interface PatientDuplicateWarningDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidates: PatientDuplicateCandidate[];
    isCreating?: boolean;
    onUseExisting: (patient: PatientDuplicateCandidate) => void;
    onCreateAnyway: () => void;
}

export function PatientDuplicateWarningDialog({
    open,
    onOpenChange,
    candidates,
    isCreating,
    onUseExisting,
    onCreateAnyway,
}: PatientDuplicateWarningDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Patient deja present ?</DialogTitle>
                    <DialogDescription>
                        Des dossiers proches existent deja. Utilisez un dossier existant si c'est le meme patient, ou forcez la creation si ce n'est pas un doublon.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 max-h-[55vh] overflow-y-auto">
                    {candidates.map(candidate => (
                        <div key={candidate.id} className="rounded-lg border p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="font-semibold">
                                        {candidate.surname}   {candidate.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {candidate.dob ? formatDateDisplay(candidate.dob) : 'Date inconnue'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {candidate.street || 'Adresse vide'}{candidate.city ? `, ${candidate.city}` : ''}
                                    </div>
                                </div>
                                <Badge variant={candidate.confidence === 'high' ? 'default' : 'secondary'}>
                                    {candidate.confidence === 'high' ? 'Doublon probable' : 'A verifier'}
                                </Badge>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                {formatReasons(candidate.reasons)}
                            </div>
                            <Button type="button" className="mt-3" variant="outline" onClick={() => onUseExisting(candidate)}>
                                Utiliser ce dossier
                            </Button>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button type="button" onClick={onCreateAnyway} disabled={isCreating}>
                        {isCreating ? 'Creation...' : 'Creer quand meme'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function formatReasons(reasons: string[]) {
    const labels: Record<string, string> = {
        'same-full-name': 'meme nom complet',
        'same-dob': 'meme date de naissance',
        'same-birth-year': 'annee de naissance proche',
        'same-city': 'meme ville',
        'close-spelling': 'orthographe tres proche',
    };

    return reasons.map(reason => labels[reason] || reason).join(', ');
}
