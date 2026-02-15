import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { X, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Separator } from '@/ui/components/ui/separator';
import { useToast } from '@/ui/hooks/use-toast';
import { cn } from '@/ui/lib/utils';

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

    // Filter to show only unread files and sort them
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
        <div className="mx-3 mt-3 mb-2 animate-in slide-in-from-top-2 duration-300">
            <Card className="p-0 overflow-hidden border-amber-200/80 bg-gradient-to-b from-amber-50/80 to-white shadow-sm">
                {/* Header */}
                <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-amber-100/80">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm shadow-amber-200/60 flex items-center justify-center">
                            <FolderOpen className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h3 className="text-xs font-bold text-amber-900 tracking-wide">Dossiers Partagés</h3>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100/80 text-amber-700 text-[10px] font-bold border border-amber-200/50 px-2 py-0.5">
                        {unreadFiles.length}
                    </Badge>
                </div>

                {/* File List */}
                <div className="divide-y divide-slate-100/80">
                    {unreadFiles.map((file: any, index: number) => {
                        const isActiveConsultation = activePatientId === file.patient_id;

                        return (
                            <div
                                key={file.id}
                                className={cn(
                                    "px-3.5 py-2.5 flex items-center justify-between transition-colors",
                                    isActiveConsultation
                                        ? "bg-indigo-50/60"
                                        : "hover:bg-amber-50/40"
                                )}
                            >
                                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                                    {/* Avatar */}
                                    <div className={cn(
                                        "h-8 w-8 text-white rounded-lg flex items-center justify-center shrink-0 font-bold text-[10px] shadow-sm",
                                        isActiveConsultation
                                            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-200/60"
                                            : "bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-200/60"
                                    )}>
                                        {file.patient_surname?.charAt(0)}{file.patient_name?.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn(
                                                "font-bold text-[13px] truncate",
                                                isActiveConsultation ? "text-indigo-900" : "text-slate-800"
                                            )}>
                                                {file.patient_surname} {file.patient_name}
                                            </h4>
                                            {isActiveConsultation && (
                                                <Badge className="bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 h-4 hover:bg-indigo-600 border-none shadow-sm shadow-indigo-300/40">
                                                    En Consultation
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                                {file.patient_dob ? (() => {
                                                    try {
                                                        const today = new Date();
                                                        const birthDate = new Date(file.patient_dob);
                                                        const age = today.getFullYear() - birthDate.getFullYear();
                                                        const m = today.getMonth() - birthDate.getMonth();
                                                        const ageResult = (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
                                                        return `${ageResult} ans`;
                                                    } catch { return 'Age inconnu'; }
                                                })() : 'Age inconnu'}
                                            </span>

                                            {file.patient_gen_ants && (
                                                <>
                                                    <Separator orientation="vertical" className="h-3 bg-slate-200" />
                                                    <span className="text-[11px] text-slate-400 italic truncate max-w-[180px]">
                                                        {file.patient_gen_ants}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 pl-2 shrink-0">
                                    <Button
                                        size="sm"
                                        className={cn(
                                            "h-7 px-3 text-[11px] font-bold uppercase tracking-tight shadow-sm border-none transition-all active:scale-[0.97]",
                                            isActiveConsultation
                                                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-300/40"
                                                : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-300/40"
                                        )}
                                        onClick={() => {
                                            if (file.patient_id && onSelectPatient) {
                                                onSelectPatient(file.patient_id);
                                            } else {
                                                toast({
                                                    title: "Impossible d'ouvrir le dossier",
                                                    variant: "destructive"
                                                });
                                            }
                                        }}
                                    >
                                        Ouvrir
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-7 w-7 p-0 rounded-lg",
                                            isActiveConsultation
                                                ? "text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100/50"
                                                : "text-slate-300 hover:text-slate-500 hover:bg-slate-100/50"
                                        )}
                                        onClick={() => markAsReadMutation.mutate(file.id)}
                                        disabled={markAsReadMutation.isPending}
                                        title="Retirer de la liste"
                                    >
                                        {markAsReadMutation.isPending ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                                        ) : (
                                            <X className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
