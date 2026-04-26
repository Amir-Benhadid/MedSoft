import { useState, useEffect } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@/ui/components/ui/command';
import { orpcClient } from '@/ui/lib/orpc/client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Phone, MapPin, Loader2, History, Calendar, PlusCircle, FolderOpen, ArrowLeft, User, Send } from 'lucide-react';
import { useDebounce } from '@/ui/hooks/use-debounce';
import { format } from 'date-fns';
import { useConfig } from '@/ui/contexts/ConfigContext';
import { useToast } from '@/ui/hooks/use-toast';

interface PatientSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPatientSelect: (patientId: string, action?: 'file' | 'consultation' | 'agenda') => void;
    mode?: 'doctor' | 'secretary';
}

interface Patient {
    id: string;
    name: string;
    surname: string;
    dob?: string | null;
    city?: string | null;
    phone_number?: string | null;
}

export function PatientSearchDialog({
    open,
    onOpenChange,
    onPatientSelect,
    mode
}: PatientSearchDialogProps) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [recentSearches, setRecentSearches] = useState<Patient[]>([]);
    const { appMode } = useConfig();
    const { toast } = useToast();

    const persistRecents = (patients: Patient[]) => {
        setRecentSearches(patients);
        localStorage.setItem('recent_patient_searches', JSON.stringify(patients));
    };

    // Robust check for secretary mode (including URL check for dev/mixed environments)
    // If explicit mode is passed, use it. Otherwise fall back to detection.
    const isSecretary = mode ? mode === 'secretary' : (appMode === 'secretary' || (typeof window !== 'undefined' && window.location.hash.includes('secretary')));

    // Load recents from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('recent_patient_searches');
        if (stored) {
            try {
                persistRecents(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recent searches", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!open || recentSearches.length === 0) return;

        let cancelled = false;

        const pruneDeletedRecents = async () => {
            const results = await Promise.all(
                recentSearches.map(async (patient) => {
                    try {
                        await orpcClient.patients.get({ id: patient.id });
                        return patient;
                    } catch {
                        return null;
                    }
                })
            );

            if (cancelled) return;

            const validRecents = results.filter((patient): patient is Patient => patient !== null);
            if (validRecents.length !== recentSearches.length) {
                persistRecents(validRecents);
                if (selectedPatient && !validRecents.some(patient => patient.id === selectedPatient.id)) {
                    setSelectedPatient(null);
                }
            }
        };

        void pruneDeletedRecents();

        return () => {
            cancelled = true;
        };
    }, [open, recentSearches, selectedPatient]);

    const addToRecents = (patient: Patient) => {
        const newRecents = [patient, ...recentSearches.filter(p => p.id !== patient.id)].slice(0, 5);
        persistRecents(newRecents);
    };

    const { data: patients, isLoading } = useQuery({
        queryKey: ['patients', 'search', debouncedSearch],
        queryFn: () => orpcClient.patients.search({ term: debouncedSearch }),
        enabled: open && debouncedSearch.length > 1 && !selectedPatient,
    });

    // Reset state when closed
    useEffect(() => {
        if (!open) {
            setSearch('');
            setSelectedPatient(null);
        }
    }, [open]);

    // Handle patient selection (Step 1)
    const handlePatientClick = (patient: Patient) => {
        addToRecents(patient);
        setSelectedPatient(patient);
        setSearch(''); // Clear search to show actions
    };

    // Handle action selection (Step 2)
    const handleAction = async (action: 'file' | 'agenda' | 'send_to_doctor' | 'send_to_secretary') => {
        if (!selectedPatient) return;

        try {
            await orpcClient.patients.get({ id: selectedPatient.id });
        } catch {
            const cleanedRecents = recentSearches.filter(patient => patient.id !== selectedPatient.id);
            persistRecents(cleanedRecents);
            setSelectedPatient(null);
            toast({
                title: 'Patient introuvable',
                description: 'Ce dossier a ete supprime et a ete retire des recherches recentes.',
                variant: 'destructive'
            });
            return;
        }

        if (action === 'send_to_doctor' || action === 'send_to_secretary') {
            try {
                const receiver = action === 'send_to_doctor' ? 'DOCTOR' : 'SECRETARY';
                const sender = action === 'send_to_doctor' ? 'SECRETARY' : 'DOCTOR';

                await orpcClient.sharedRecords.create({
                    patientId: selectedPatient.id,
                    sender: sender,
                    receiver: receiver
                });
            } catch (error) {
                console.error("Failed to send patient file", error);
            }
            onOpenChange(false);
            return;
        }

        onPatientSelect(selectedPatient.id, action as any);
        onOpenChange(false);
    };

    const handleBack = () => {
        setSelectedPatient(null);
        setSearch('');
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
            <CommandInput
                placeholder={selectedPatient
                    ? `Actions pour ${selectedPatient.surname}   ${selectedPatient.name}...`
                    : "Rechercher un dossier patient..."}
                value={search}
                onValueChange={setSearch}
            />
            <CommandList key={selectedPatient ? 'actions' : 'search'} className="h-[350px] max-h-[350px] overflow-y-auto outline-none focus:outline-none focus:ring-0">
                {!selectedPatient ? (
                    <>
                        <CommandEmpty className="h-full flex flex-col items-center justify-center text-slate-500">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <p className="text-sm font-medium">Recherche en cours...</p>
                                </div>
                            ) : (
                                search.length > 1 ? "Aucun patient trouvé." : "Commencez à taper..."
                            )}
                        </CommandEmpty>

                        {!search && recentSearches.length > 0 && (
                            <CommandGroup heading="Récents">
                                {recentSearches.map((patient) => (
                                    <CommandItem
                                        key={patient.id}
                                        value={`${patient.surname}   ${patient.name} ${patient.id}`} // Unique value
                                        onSelect={() => handlePatientClick(patient)}
                                        className="flex items-center justify-between p-3 cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-900 antialiased"
                                    >
                                        <div className="flex items-center gap-3">
                                            <History className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <div className="font-extrabold text-slate-900 capitalize text-base">
                                                    {patient.surname}{"   "}{patient.name}
                                                </div>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {patients && (
                            <CommandGroup heading="Résultats">
                                {patients.map((patient) => (
                                    <CommandItem
                                        key={patient.id}
                                        value={`${patient.surname}   ${patient.name} ${patient.id}`}
                                        onSelect={() => handlePatientClick(patient)}
                                        className="flex items-center justify-between p-3 cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-900 data-[disabled]:pointer-events-auto data-[disabled]:opacity-100 antialiased"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-extrabold text-slate-900 capitalize text-base">
                                                    {patient.surname}{"   "}{patient.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                                                    {patient.dob && (
                                                        <span>Né(e) en {patient.dob}</span>
                                                    )}
                                                    {patient.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {patient.city}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {patient.phone_number && (
                                            <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                                                <Phone className="w-3 h-3" />
                                                {patient.phone_number}
                                            </div>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </>
                ) : (
                    <>
                        <CommandGroup>
                            <CommandItem value="back" onSelect={handleBack} className="flex items-center gap-2 text-slate-500 font-medium">
                                <ArrowLeft className="w-4 h-4" />
                                Retour à la recherche
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading={`Actions pour ${selectedPatient.surname}   ${selectedPatient.name}`}>
                            <CommandItem value="open_file" onSelect={() => handleAction('file')} className="gap-3 py-3 cursor-pointer data-[disabled]:pointer-events-auto data-[disabled]:opacity-100">
                                <FolderOpen className="w-5 h-5 text-blue-600" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900">Ouvrir le dossier médical</span>
                                    <span className="text-xs text-slate-500">Accéder à l'historique et aux consultations</span>
                                </div>
                            </CommandItem>



                            <CommandItem value="view_agenda" onSelect={() => handleAction('agenda')} className="gap-3 py-3 cursor-pointer data-[disabled]:pointer-events-auto data-[disabled]:opacity-100">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900">Voir les Rendez-vous</span>
                                    <span className="text-xs text-slate-500">Consulter l'agenda du patient</span>
                                </div>
                            </CommandItem>

                            <CommandItem
                                value={isSecretary ? "send_to_doctor" : "send_to_secretary"}
                                onSelect={() => handleAction(isSecretary ? 'send_to_doctor' : 'send_to_secretary')}
                                className="gap-3 py-3 cursor-pointer data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                            >
                                <Send className="w-5 h-5 text-blue-600" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900">{isSecretary ? 'Envoyer au médecin' : 'Envoyer au secrétariat'}</span>
                                    <span className="text-xs text-slate-500">Transférer le dossier dans la liste d'attente</span>
                                </div>
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
}
