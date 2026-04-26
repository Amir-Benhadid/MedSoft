import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { useToast } from '@/ui/hooks/use-toast';
import { getAge } from './utils';

interface DoctorSharedFilesListProps {
    onSelectPatient?: (patientId: string) => void;
    activePatientId?: string;
}

export default function DoctorSharedFilesList({ onSelectPatient, activePatientId }: DoctorSharedFilesListProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: sharedFiles = [], isLoading } = useQuery({
        queryKey: ['sharedRecords', 'doctor'],
        queryFn: () => orpcClient.sharedRecords.list({ receiver: 'DOCTOR' }),
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => orpcClient.sharedRecords.markAsRead({ ids: [id] }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sharedRecords'] });
            toast({
                title: "Dossier retiré de la liste",
                className: "bg-green-500 text-white border-none",
                duration: 2000
            });
        }
    });

    const unreadFiles = useMemo(() => {
        const filtered = sharedFiles.filter((file: any) => file.status === 'unread');
        return [...filtered].sort((a: any, b: any) => {
            if (activePatientId) {
                if (a.patient_id === activePatientId) return -1;
                if (b.patient_id === activePatientId) return 1;
            }
            return 0;
        });
    }, [sharedFiles, activePatientId]);

    if (isLoading && !unreadFiles.length) return null;
    if (unreadFiles.length === 0) return null;

    return (
        <div className="px-4 pt-4 shrink-0">
            {/* Title - exactly like Consultation en cours */}
            <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                    Dossiers Partagés
                </h3>
            </div>

            {/* Rows - same design as consultation card, yellow/amber, with Ouvrir + Retirer */}
            <div className="flex flex-col gap-2">
                {unreadFiles.map((file: any) => (
                    <div
                        key={file.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all border-2 bg-amber-500/10 border-amber-300 hover:border-amber-500 hover:bg-amber-500/20 shadow-md shadow-amber-500/10"
                    >
                        {/* Patient name - like consultation card */}
                        <span className="font-black text-base text-amber-800 truncate flex-1 min-w-0 flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                            {file.patient_surname}{"   "}{file.patient_name}
                        </span>

                        {/* Age */}
                        <span className="text-xs font-bold text-amber-600/80 shrink-0">
                            {file.patient_dob ? getAge(file.patient_dob) : '—'}
                        </span>

                        {/* Gen ants if present */}
                        {file.patient_gen_ants && (
                            <span className="text-[11px] text-amber-600/70 font-bold italic truncate max-w-[150px] shrink-0">
                                {file.patient_gen_ants}
                            </span>
                        )}

                        {/* Ouvrir + Retirer buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                                size="sm"
                                className="h-7 px-3 text-[11px] font-bold uppercase tracking-tight bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (file.patient_id && onSelectPatient) {
                                        onSelectPatient(file.patient_id);
                                    } else {
                                        toast({ title: "Impossible d'ouvrir le dossier", variant: "destructive" });
                                    }
                                }}
                            >
                                Ouvrir
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-100/50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAsReadMutation.mutate(file.id);
                                }}
                                disabled={markAsReadMutation.isPending}
                                title="Retirer de la liste"
                            >
                                {markAsReadMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <X className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
