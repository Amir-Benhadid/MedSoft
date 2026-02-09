import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { FileText, X, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { useToast } from '@/ui/hooks/use-toast';

interface DoctorSharedFilesListProps {
    onSelectPatient?: (patientId: string) => void;
}

export default function DoctorSharedFilesList({ onSelectPatient }: DoctorSharedFilesListProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: sharedFiles = [], isLoading } = useQuery({
        queryKey: ['sharedRecords', 'doctor'],
        queryFn: () => orpcClient.sharedRecords.list({ receiver: 'DOCTOR' }),
        refetchInterval: 5000
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
        <div className="bg-white border-b border-slate-200">
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 bg-amber-50/50">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-1.5 rounded-lg">
                        <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-bold text-amber-900">
                        Dossiers Reçus ({unreadFiles.length})
                    </span>
                </div>
            </div>

            <ScrollArea className="max-h-48">
                <div className="divide-y divide-slate-100">
                    {unreadFiles.map((file: any) => (
                        <div key={file.id} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">
                                    {file.patient_surname?.charAt(0)}{file.patient_name?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm text-slate-900 truncate">
                                            {file.patient_surname} {file.patient_name}
                                        </h4>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(file.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>
                                            {file.patient_dob ? `Né(e) le ${file.patient_dob}` : 'DDN Inconnue'}
                                        </span>
                                        {file.notes && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate max-w-[200px] italic">"{file.notes}"</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5"
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
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">Ouvrir</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => markAsReadMutation.mutate(file.id)}
                                    disabled={markAsReadMutation.isPending}
                                >
                                    {markAsReadMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
