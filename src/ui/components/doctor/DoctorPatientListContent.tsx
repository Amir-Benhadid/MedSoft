import { useState } from 'react';
import { cn } from '@/ui/lib/utils';
import DoctorStatsHeader from './patient-list/DoctorStatsHeader';
import DoctorSharedFilesList from './patient-list/DoctorSharedFilesList';
import PatientListView from './patient-list/PatientListView';
import { usePatientListLogic } from './patient-list/usePatientListLogic';
import { UnifiedPatientItem } from './patient-list/types';
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';
import { format } from 'date-fns';
import { getAge } from './patient-list/utils';
import { Badge } from '@/ui/components/ui/badge';

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

    // Identify the active consultation patient to highlight at the absolute top
    const activePatientInConsultation = unifiedList.find(item => item.status === 'in_consultation');

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

                {/* 1. TOP BANNER: ACTIVE CONSULTATION (The "Green Row") */}
                {activePatientInConsultation && (
                    <div className="px-4 pt-4 shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                Consultation en cours
                            </h3>
                        </div>
                        <div
                            onClick={() => handleSelect(activePatientInConsultation)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border-2 bg-emerald-500/10 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-500/20 shadow-md shadow-emerald-500/10"
                            )}
                        >
                            {/* Patient name */}
                            <span className="font-black text-base text-emerald-800 truncate w-[35%] min-w-0 flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                {activePatientInConsultation.patient?.name} {activePatientInConsultation.patient?.surname}
                            </span>

                            {/* Time */}
                            <span className="text-xs font-black text-emerald-700 tabular-nums w-[10%] min-w-[50px]">
                                {format(activePatientInConsultation.time, 'HH:mm')}
                            </span>

                            {/* Age */}
                            {activePatientInConsultation.patient?.dob && (
                                <span className="text-xs font-bold text-emerald-600/80 w-[10%] min-w-[40px]">
                                    {getAge(activePatientInConsultation.patient.dob)}
                                </span>
                            )}

                            {/* Phone */}
                            {activePatientInConsultation.patient?.phone && (
                                <span className="text-xs font-bold text-emerald-600/80 w-[15%] min-w-[80px]">
                                    {activePatientInConsultation.patient.phone}
                                </span>
                            )}

                            {/* Dilation badge */}
                            {activePatientInConsultation.needsDilation && (
                                <Badge className="h-5 px-2.5 text-[10px] bg-emerald-600/25 text-emerald-800 border-0 shrink-0 font-black uppercase">
                                    Dilatation
                                </Badge>
                            )}

                            {/* Notes */}
                            {activePatientInConsultation.notes && (
                                <span className="text-[11px] text-emerald-600/70 font-bold italic truncate max-w-[200px] shrink-0">
                                    🩺 {activePatientInConsultation.notes}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. SHARED FILES LIST */}
                <DoctorSharedFilesList
                    activePatientId={activePatientInConsultation?.patientId}
                    onSelectPatient={(patientId) => {
                        onSelectPatient(patientId);
                    }}
                />

                {/* 3. HEADER WITH STATS */}
                <DoctorStatsHeader
                    stats={stats}
                    isLoading={isStatsLoading}
                    patientCount={filteredList.length}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                {/* 4. LIST CONTENT (Excluding the active patient since they're in the banner) */}
                <PatientListView
                    list={filteredList.filter(item => item.status !== 'in_consultation')}
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
