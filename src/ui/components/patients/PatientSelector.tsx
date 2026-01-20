import React, { useState } from 'react';
import { Search, UserPlus, User } from 'lucide-react';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { usePatientSearch, Patient } from '@/ui/hooks/usePatients';
import { cn } from '@/ui/lib/utils';


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
                                    "w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                                )}
                                onClick={() => onSelect(patient)}
                            >

                                <div className="flex-1 overflow-hidden">
                                    <div className="font-medium truncate">
                                        {patient.surname} {patient.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {patient.dob && <span>{new Date(patient.dob).toLocaleDateString('fr-FR')}</span>}
                                        {patient.phone_number && <span> • {patient.phone_number}</span>}
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
