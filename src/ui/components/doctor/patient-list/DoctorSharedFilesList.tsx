import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { FileText, X, ExternalLink, Loader2, User } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { useToast } from '@/ui/hooks/use-toast';
import { cn } from '@/ui/lib/utils';

interface DoctorSharedFilesListProps {
    onSelectPatient?: (patientId: string) => void;
}

export default function DoctorSharedFilesList({ onSelectPatient }: DoctorSharedFilesListProps) {
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

    // Filter to show only unread files
    const unreadFiles = sharedFiles.filter((file: any) => file.status === 'unread');

    if (isLoading && !unreadFiles.length) return null;
    if (unreadFiles.length === 0) return null;

    return (
        <div className="mx-4 mt-4 mb-2 p-3 bg-[#fef3c7] border border-[#f59e0b] rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-[#f59e0b]"></div>
                <h3 className="text-sm font-bold text-[#92400e] flex items-center gap-2">
                    📨 Dossiers Envoyés par la Secrétaire
                </h3>
            </div>

            <div className="space-y-2">
                {unreadFiles.map((file: any) => (
                    <div
                        key={file.id}
                        className="bg-white rounded-lg border border-[#f59e0b]/30 p-2 flex items-center justify-between shadow-sm hover:border-[#f59e0b] transition-all"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            {/* Avatar */}
                            <div className="h-8 w-8 bg-[#f59e0b] text-white rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
                                {file.patient_surname?.charAt(0)}{file.patient_name?.charAt(0)}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex items-center gap-3">
                                <h4 className="font-bold text-sm text-slate-800 truncate">
                                    {file.patient_surname} {file.patient_name}
                                </h4>

                                <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                                    👤 {file.patient_dob ? (() => {
                                        try {
                                            const today = new Date();
                                            const birthDate = new Date(file.patient_dob);
                                            const age = today.getFullYear() - birthDate.getFullYear();
                                            return `${age} ans`;
                                        } catch { return 'Age inconnu'; }
                                    })() : 'Age inconnu'}
                                </span>

                                {file.patient_gen_ants && (
                                    <span className="text-xs text-slate-400 italic truncate max-w-[150px] hidden md:inline-block">
                                        🩺 {file.patient_gen_ants}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                className="h-7 px-3 text-xs bg-[#f59e0b] hover:bg-[#d97706] text-white border-none shadow-none font-semibold"
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
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs border-[#f59e0b] text-[#f59e0b] hover:bg-[#fef3c7] hover:text-[#d97706] font-semibold bg-transparent"
                                onClick={() => markAsReadMutation.mutate(file.id)}
                                disabled={markAsReadMutation.isPending}
                            >
                                {markAsReadMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    "Retirer"
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
