import { useState } from 'react';
import { cn } from '@/ui/lib/utils';
import DoctorStatsHeader from './patient-list/DoctorStatsHeader';
import PatientListView from './patient-list/PatientListView';
import PatientDetailsPanel from './patient-list/PatientDetailsPanel';
import { usePatientListLogic } from './patient-list/usePatientListLogic';
import { UnifiedPatientItem } from './patient-list/types';

interface DoctorPatientListContentProps {
    onSelectPatient: (patientId: string, mode?: 'normal' | 'radiography') => void;
    selectedPatientId?: string | null;
}

export default function DoctorPatientListContent({ onSelectPatient, selectedPatientId: propSelectedPatientId }: DoctorPatientListContentProps) {
    const {
        filteredList,
        unifiedList,
        stats,
        isStatsLoading,
        isWaitlistLoading,
        isAppointmentsLoading,
        searchTerm,
        setSearchTerm,
        activeFilter,
        setActiveFilter,
    } = usePatientListLogic();

    // Internal selection state if not controlled prop provided (though it is in route)
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
    const selectedId = propSelectedPatientId || internalSelectedId;

    const selectedItem = unifiedList.find(i => i.patientId === selectedId);

    const handleSelect = (item: UnifiedPatientItem) => {
        setInternalSelectedId(item.patientId);
    };

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Left Panel: Patient List */}
            <div className={cn(
                "flex flex-col border-r bg-white h-full transition-all duration-300 ease-in-out",
                selectedId ? "w-1/2" : "w-full"
            )}>
                {/* Header with Stats */}
                <DoctorStatsHeader
                    stats={stats}
                    isLoading={isStatsLoading}
                    patientCount={filteredList.length}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                {/* List Content */}
                <PatientListView
                    list={filteredList}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    isLoading={isWaitlistLoading || isAppointmentsLoading}
                />

                {/* Footer Count */}
                <div className="p-3 border-t bg-white text-[10px] text-center text-slate-300 font-bold tracking-widest uppercase">
                    Fin de la liste
                </div>
            </div>

            {/* Right Panel: Detail View (50% width) */}
            {selectedId && selectedItem && (
                <PatientDetailsPanel
                    item={selectedItem}
                    onStartConsultation={onSelectPatient}
                />
            )}
        </div>
    );
}
