import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WaitlistCard, WaitlistEntry } from './WaitlistCard';
import './Waitlist.css';
import { Loader2, Plus, UserPlus, Users, Activity, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from "@/ui/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/components/ui/alert-dialog";
import { format } from 'date-fns';
import { useToast } from "@/ui/hooks/use-toast";
import { useWaitlist, useRemoveWaitlistEntry, useUpdateWaitlistStatus, useWaitlistToggleDilation } from '@/ui/hooks/useWaitlist';
import { WaitlistEntrySheet } from './WaitlistEntrySheet';
import { ScrollArea } from "@/ui/components/ui/scroll-area";
import { Separator } from "@/ui/components/ui/separator";
import { Badge } from "@/ui/components/ui/badge";

interface WaitlistProps {
    date?: Date;
}

export default function Waitlist({ date = new Date() }: WaitlistProps) {
    // State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    const { toast } = useToast();

    // Hooks
    const { data: waitlist, isLoading } = useWaitlist(format(date, 'yyyy-MM-dd'));
    const removeMutation = useRemoveWaitlistEntry();
    const updateStatusMutation = useUpdateWaitlistStatus();
    const toggleDilationMutation = useWaitlistToggleDilation();

    // Handlers
    const handleRemove = (id: string) => {
        setEntryToDelete(id);
    };

    const confirmRemove = () => {
        if (entryToDelete) {
            removeMutation.mutate(entryToDelete, {
                onSuccess: () => {
                    toast({ description: "Patient retiré de la file d'attente", variant: "default" });
                    setEntryToDelete(null);
                },
                onError: (err: any) => toast({ description: "Erreur lors de la suppression: " + err.message, variant: "destructive" })
            });
        }
    };

    const handleUpdateStatus = (id: string, state: string) => {
        updateStatusMutation.mutate({ id, state }, {
            onError: (err: any) => toast({ description: "Erreur lors de la mise à jour: " + err.message, variant: "destructive" })
        });
    };

    const handleToggleDilation = (entry: WaitlistEntry) => {
        if (entry.needs_dilation) {
            toggleDilationMutation.mutate({ id: entry.id, needsDilation: false });
        } else {
            toggleDilationMutation.mutate({
                id: entry.id,
                needsDilation: true,
                dilationType: 'Mydriaticum'
            });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
    }

    const waitingPatients = waitlist?.filter(e => e.state === 'waiting') || [];
    const inProgressPatients = waitlist?.filter(e => e.state === 'in_consultation') || [];
    const rehabilitationPatients = waitlist?.filter(e => e.state === 'in_rehabilitation') || [];
    const completedPatients = waitlist?.filter(e => ['completed', 'paid', 'creance'].includes(e.state)) || [];

    return (
        <div className="flex flex-col h-full">
            {/* Header Section */}
            {/* Header Section */}
            <div className="pb-4 pt-0 px-4 bg-transparent border-0 flex justify-between items-center shrink-0 mx-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-foreground capitalize flex items-center gap-2 -ml-1">
                        <Users className="h-6 w-6" />
                        File d'attente
                    </h2>
                    {waitlist && waitlist.length > 0 && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-2 border border-slate-200">
                            {waitlist.length}
                        </span>
                    )}
                </div>
                <Button
                    size="sm"
                    onClick={() => setIsSheetOpen(true)}
                    className="h-9 shadow-sm"
                >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Ajouter
                </Button>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-6 max-w-full">
                    {/* En Consultation - Highlighted */}
                    {inProgressPatients.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest">
                                <Activity className="h-3.5 w-3.5" />
                                En Consultation
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 ml-auto border-emerald-200">
                                    {inProgressPatients.length}
                                </Badge>
                            </div>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                {inProgressPatients.map(entry => (
                                    <div key={entry.id} className="relative transform transition-all duration-200 hover:scale-[1.01]">
                                        <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-sm"></div>
                                        <WaitlistCard
                                            entry={entry as any}
                                            onRemove={handleRemove}
                                            onToggleDilation={handleToggleDilation}
                                            onUpdateStatus={handleUpdateStatus}
                                            onClick={() => { }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {inProgressPatients.length > 0 && <Separator className="bg-slate-200" />}

                    {/* En Rééducation (Kinesis) */}
                    {rehabilitationPatients.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest">
                                <Activity className="h-3.5 w-3.5" />
                                En Rééducation
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 ml-auto border-indigo-200">
                                    {rehabilitationPatients.length}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {rehabilitationPatients.map(entry => (
                                    <div key={entry.id} className="relative transform transition-all duration-200 hover:scale-[1.01]">
                                        <div className="absolute inset-0 bg-indigo-500/5 rounded-xl blur-sm"></div>
                                        <WaitlistCard
                                            entry={entry as any}
                                            onRemove={handleRemove}
                                            onToggleDilation={handleToggleDilation}
                                            onUpdateStatus={handleUpdateStatus}
                                            onClick={() => { }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Separator className="bg-slate-200" />
                        </div>
                    )}

                    {/* En Attente */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                            <Users className="h-3.5 w-3.5" />
                            En Attente
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 ml-auto">
                                {waitingPatients.length}
                            </Badge>
                        </div>

                        <div className="space-y-2 min-h-[100px]">
                            {waitingPatients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-center mx-2">
                                    <Users className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Aucun patient en attente</p>
                                    <p className="text-xs mt-1 opacity-70">Ajoutez un patient pour commencer</p>
                                </div>
                            ) : (
                                waitingPatients.map(entry => (
                                    <WaitlistCard
                                        key={entry.id}
                                        entry={entry as any}
                                        onRemove={handleRemove}
                                        onToggleDilation={handleToggleDilation}
                                        onUpdateStatus={handleUpdateStatus}
                                        onClick={() => { }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {(completedPatients.length > 0) && <Separator className="bg-slate-200" />}

                    {/* Terminé / Paiement */}
                    {completedPatients.length > 0 && (
                        <div className="space-y-3 opacity-90 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Terminé / Paiement
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 ml-auto">
                                    {completedPatients.length}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {completedPatients.map(entry => (
                                    <WaitlistCard
                                        key={entry.id}
                                        entry={entry as any}
                                        onRemove={handleRemove}
                                        onToggleDilation={handleToggleDilation}
                                        onUpdateStatus={handleUpdateStatus}
                                        onClick={() => { }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <WaitlistEntrySheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />

            <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retirer le patient ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir retirer ce patient de la file d'attente ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={confirmRemove}
                        >
                            Retirer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
