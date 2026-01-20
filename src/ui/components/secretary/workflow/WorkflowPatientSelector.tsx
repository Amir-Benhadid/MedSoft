import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { getLocalTodayDate, getDayRangeEncoded } from '@/ui/lib/time';
import { useConfig } from '@/ui/contexts/ConfigContext';
import { Patient } from '@/ui/hooks/usePatients';
import { cn } from '@/ui/lib/utils';
import { Search, User, Clock, Calendar, Activity, ArrowRight } from 'lucide-react';
import { Input } from '@/ui/components/ui/input';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Badge } from '@/ui/components/ui/badge';
import { PatientSelector } from '@/ui/components/patients/PatientSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";

interface WorkflowPatientSelectorProps {
    onSelect: (patient: Patient) => void;
    onCreateNew?: () => void;
}

export function WorkflowPatientSelector({ onSelect, onCreateNew }: WorkflowPatientSelectorProps) {
    const { businessType } = useConfig();
    const [searchMode, setSearchMode] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    // --- Data Fetching ---
    const today = useMemo(() => getLocalTodayDate(), []);

    const { data: appointments = [], isLoading: isLoadingApt } = useQuery({
        queryKey: ['appointments', today],
        queryFn: () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.appointments.list(range);
        }
    });

    const { data: waitlist = [], isLoading: isLoadingWait } = useQuery({
        queryKey: ['waitlist', today],
        queryFn: () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.waitlist.list(range);
        }
    });

    // --- Filtering & Logic ---
    // --- Filtering & Logic ---
    const availablePatients = useMemo(() => {
        // 1. Available (Present Appointments OR Waiting Waitlist)
        type AppointmentItem = (typeof appointments)[0] & { source: 'appointment' };
        type WaitlistItem = (typeof waitlist)[0] & { source: 'waitlist' };
        type WorkflowItem = AppointmentItem | WaitlistItem;

        let list: WorkflowItem[] = [
            ...appointments.filter(a => a.state === 'present').map(a => ({ ...a, source: 'appointment' as const })),
            ...waitlist.filter(w => w.state === 'waiting').map(w => ({ ...w, source: 'waitlist' as const }))
        ];

        // Filter by local search term
        if (localSearchTerm.trim()) {
            const term = localSearchTerm.toLowerCase();
            list = list.filter((item: WorkflowItem) => {
                let name = '';
                if (item.source === 'appointment') {
                    // item is inferred as AppointmentItem here
                    name = item.patient ? `${item.patient.surname} ${item.patient.name}` : (item.title || '');
                } else {
                    // item is inferred as WaitlistItem here
                    name = item.patient_name ? `${item.patient_surname} ${item.patient_name}` : '';
                }
                return name.toLowerCase().includes(term);
            });
        }

        return list.sort((a, b) => {
            const timeA = (a as any).arrived_at || (a as any).start_time || (a as any).created_at;
            const timeB = (b as any).arrived_at || (b as any).start_time || (b as any).created_at;
            return new Date(timeA).getTime() - new Date(timeB).getTime();
        });
    }, [appointments, waitlist, localSearchTerm]);

    // --- Render Helpers ---
    const renderPatientItem = (item: any, type: string) => (
        <button
            key={`${item.source}-${item.id}`}
            onClick={() => onSelect({
                ...(item.patient || {}),
                id: item.patient_id,
                name: item.patient?.name || item.patient_name || item.title?.split(' ')[1] || '?',
                surname: item.patient?.surname || item.patient_surname || item.title?.split(' ')[0] || 'Patient'
            } as any)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
        >
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                type === 'available' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
            )}>
                {type === 'available' ? <User className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">
                    {item.patient ? `${item.patient.surname} ${item.patient.name}` :
                        (item.patient_name ? `${item.patient_surname} ${item.patient_name}` :
                            item.title || "Patient Sans Nom")}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                    {item.source === 'appointment' ? (
                        <span className="flex items-center gap-1 text-blue-600/80 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Calendar className="h-3 w-3" />
                            RDV
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-orange-600/80 bg-orange-50 px-1.5 py-0.5 rounded">
                            <Clock className="h-3 w-3" />
                            Attente
                        </span>
                    )}
                    {item.start_time && <span>{new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    {item.arrived_at && <span>Arrivé: {new Date(item.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
            </div>

            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </button>
    );

    if (searchMode) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500">Recherche Global</h3>
                    <button onClick={() => setSearchMode(false)} className="text-xs text-blue-600 hover:underline">
                        Retour au flux
                    </button>
                </div>
                <PatientSelector onSelect={onSelect} onCreateNew={onCreateNew || (() => { })} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[450px]">
            {/* Header / Mode Switch */}
            <div className="mb-4 flex flex-col gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Filtrer la file d'attente..."
                        className="pl-9 bg-slate-50 border-slate-200"
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                </div>
                {appointments.length === 0 && waitlist.length === 0 && (
                    <button
                        onClick={() => setSearchMode(true)}
                        className="text-xs text-blue-600 hover:underline text-center w-full"
                    >
                        Pas trouvable ? Chercher dans la base de données
                    </button>
                )}
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-6">
                    {/* Available Patients Only */}
                    {availablePatients.length > 0 ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                                <Clock className="h-3.5 w-3.5" />
                                Patients en Attente (Disponibles)
                                <Badge variant="secondary" className="ml-auto">{availablePatients.length}</Badge>
                            </div>
                            <div className="space-y-1">
                                {availablePatients.map(item => renderPatientItem(item, 'available'))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                <Activity className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-slate-900 font-medium">Aucun patient disponible</p>
                            <p className="text-sm text-slate-500 max-w-[200px]">
                                {localSearchTerm ? "Aucun résultat pour votre recherche." : "Il n'y a pas de patients en attente pour le moment."}
                            </p>
                            <button
                                onClick={() => setSearchMode(true)}
                                className="text-blue-600 font-medium text-sm hover:underline mt-2"
                            >
                                Rechercher dans la base de données
                            </button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
