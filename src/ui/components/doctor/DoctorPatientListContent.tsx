import { useState } from 'react';
import { cn } from '@/ui/lib/utils';
import DoctorStatsHeader from './patient-list/DoctorStatsHeader';
import DoctorSharedFilesList from './patient-list/DoctorSharedFilesList';
import PatientListView from './patient-list/PatientListView';
import { usePatientListLogic } from './patient-list/usePatientListLogic';
import { UnifiedPatientItem } from './patient-list/types';
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';

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

    const { data: consultationTypes = [] } = useConsultationTypes();

    // We don't need internal selection state anymore since we navigate immediately
    const selectedId = propSelectedPatientId;

    const handleSelect = (item: UnifiedPatientItem) => {
        // Determine target mode based on consultation type
        const consultationType = consultationTypes.find(t => t.id === item.consultationTypeId);
        const targetMode = (consultationType?.nature === 'radiography') ? 'radiography' : 'normal';

        onSelectPatient(item.patientId, targetMode);
    };

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Main Panel: Patient List - Always full width now */}
            <div className="flex flex-col border-r bg-white h-full w-full transition-all duration-300 ease-in-out">
                {/* Shared Files List */}
                <DoctorSharedFilesList
                    onSelectPatient={(patientId) => {
                        onSelectPatient(patientId);
                    }}
                />

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
        </div>
    );
}
