import React, { useState } from 'react';
import { Search, UserPlus, GitMerge } from 'lucide-react';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Badge } from '@/ui/components/ui/badge';
import { useMergePatients, usePatientSearch, Patient, PatientSearchResult } from '@/ui/hooks/usePatients';
import { cn } from '@/ui/lib/utils';
import { formatDateDisplay } from '@/ui/lib/time';
import { PatientDuplicateMergeDialog } from './PatientDuplicateMergeDialog';


interface PatientSelectorProps {
    onSelect: (patient: Patient) => void;
    onCreateNew: () => void;
}

export function PatientSelector({ onSelect, onCreateNew }: PatientSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: searchResults, isLoading } = usePatientSearch(searchTerm);
    const [patientToMerge, setPatientToMerge] = useState<PatientSearchResult | null>(null);
    const mergePatients = useMergePatients();



    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex gap-2 flex-none">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un patient..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" onClick={onCreateNew} title="Nouveau patient">
                    <UserPlus className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-md">
                <div className="p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Recherche...</div>
                    ) : searchResults && searchResults.length > 0 ? (
                        searchResults.map((patient) => (
                            <div
                                key={patient.id}
                                className={cn(
                                    "rounded-lg border border-slate-100 bg-white shadow-sm mb-2 last:mb-0"
                                )}
                            >
                                <button
                                    className="w-full flex items-center gap-3 p-3 text-left group hover:bg-blue-50/50 rounded-t-lg transition-all"
                                    onClick={() => onSelect(patient)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                                {patient.surname}{"   "}{patient.name}
                                            </div>
                                            {patient.duplicate_count > 0 && (
                                                <Badge variant={patient.duplicate_candidates.some(candidate => candidate.confidence === 'high') ? 'default' : 'secondary'}>
                                                    {patient.duplicate_count} doublon{patient.duplicate_count > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 truncate mt-0.5">
                                            {patient.dob && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-70">Né(e) le</span>
                                                    <span className="font-medium text-slate-700">{formatDateDisplay(patient.dob)}</span>
                                                </span>
                                            )}
                                            {patient.phone_number && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-medium">{patient.phone_number}</span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {patient.duplicate_count > 0 && (
                                    <div className="flex items-center justify-between gap-2 border-t px-3 py-2 bg-amber-50/60 rounded-b-lg">
                                        <div className="text-xs text-amber-800">
                                            Des doublons potentiels ont ete detectes pour ce patient.
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setPatientToMerge(patient)}>
                                            <GitMerge className="h-4 w-4 mr-1" />
                                            Fusionner
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : searchTerm.length >= 2 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Aucun patient trouvé.
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Entrez au moins 2 caractères pour rechercher.
                        </div>
                    )}
                </div>
            </ScrollArea>

            <PatientDuplicateMergeDialog
                open={!!patientToMerge}
                onOpenChange={(open) => {
                    if (!open) setPatientToMerge(null);
                }}
                patient={patientToMerge}
                isSubmitting={mergePatients.isPending}
                onConfirm={async (input) => {
                    const mergedPatient = await mergePatients.mutateAsync(input);
                    setPatientToMerge(null);
                    onSelect(mergedPatient);
                }}
            />
        </div>
    );
}
