import React, { useState } from 'react';
import { Search, UserPlus, User } from 'lucide-react';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { usePatientSearch, Patient } from '@/ui/hooks/usePatients';
import { cn } from '@/ui/lib/utils';
import { formatDateDisplay } from '@/ui/lib/time';


interface PatientSelectorProps {
    onSelect: (patient: Patient) => void;
    onCreateNew: () => void;
}

export function PatientSelector({ onSelect, onCreateNew }: PatientSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: searchResults, isLoading } = usePatientSearch(searchTerm);



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
                            <button
                                key={patient.id}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group bg-white shadow-sm mb-2 last:mb-0 border-slate-100"
                                )}
                                onClick={() => onSelect(patient)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                        {patient.surname} {patient.name}
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
        </div>
    );
}
