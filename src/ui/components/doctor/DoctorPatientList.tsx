import { useState } from 'react';
import DoctorHeader from './DoctorHeader';
import DoctorPatientListContent from './DoctorPatientListContent';
import { TodayResume } from '@/ui/components/shared/stats/TodayResume';
import { MonthlyResume } from '@/ui/components/doctor/resume/MonthlyResume';
import { SettingsContainer } from './settings/SettingsContainer';
import { BooksLibrary } from './books/BookLibrary';
import Calendar from '@/ui/components/secretary/calendar/Calendar';
import Waitlist from '@/ui/components/secretary/waitlist/Waitlist';

interface DoctorPatientListProps {
    onSelectPatient: (patientId: string, mode?: 'normal' | 'radiography', action?: 'view' | 'consultation', entrySource?: 'shared_record') => void;
    selectedPatientId?: string | null;
}

export default function DoctorPatientList({ onSelectPatient, selectedPatientId }: DoctorPatientListProps) {
    const [currentTab, setCurrentTab] = useState('patients');

    return (
        <div className="flex flex-col h-full w-full bg-white overflow-hidden">
            {/* Main Header */}
            <DoctorHeader
                currentTab={currentTab}
                onTabChange={setCurrentTab}
            />

            <div className="flex-1 overflow-hidden bg-slate-50 relative">
                {currentTab === 'patients' && (
                    <DoctorPatientListContent
                        onSelectPatient={onSelectPatient}
                        selectedPatientId={selectedPatientId}
                    />
                )}

                {currentTab === 'resume' && (
                    <div className="h-full overflow-y-auto w-full flex justify-center">
                        <TodayResume />
                    </div>
                )}

                {currentTab === 'calendar' && (
                    <div className="h-full overflow-hidden w-full p-4">
                        <div className="flex h-full overflow-hidden gap-4">
                            <div className="flex-1 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <Calendar />
                            </div>
                            <div className="hidden lg:flex lg:w-[420px] xl:w-[450px] shrink-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <Waitlist />
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'monthly' && (
                    <div className="h-full overflow-y-auto w-full">
                        <MonthlyResume />
                    </div>
                )}

                {currentTab === 'settings' && (
                    <div className="h-full overflow-hidden w-full">
                        <SettingsContainer />
                    </div>
                )}

                {currentTab === 'books' && (
                    <div className="h-full overflow-hidden w-full">
                        <BooksLibrary />
                    </div>
                )}
            </div>
        </div>
    );
}
