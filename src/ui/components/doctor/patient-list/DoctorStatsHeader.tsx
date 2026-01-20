import { Calendar, UserPlus, Activity, Search } from 'lucide-react';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { cn } from '@/ui/lib/utils';

interface DoctorStatsHeaderProps {
    stats: any;
    isLoading: boolean;
    patientCount: number;
    activeFilter: 'all' | 'waiting' | 'consultation' | 'completed';
    onFilterChange: (filter: 'all' | 'waiting' | 'consultation' | 'completed') => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export default function DoctorStatsHeader({
    stats,
    isLoading,
    patientCount,
    activeFilter,
    onFilterChange,
    searchTerm,
    onSearchChange
}: DoctorStatsHeaderProps) {
    return (
        <div className="p-5 border-b bg-white z-10 sticky top-0 space-y-4">
            {/* Stats of the Day */}
            <div className="grid grid-cols-3 gap-3">
                {isLoading ? (
                    <>
                        <Skeleton className="h-16 rounded-xl bg-slate-50" />
                        <Skeleton className="h-16 rounded-xl bg-slate-50" />
                        <Skeleton className="h-16 rounded-xl bg-slate-50" />
                    </>
                ) : (
                    <>
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">RDV</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-800 leading-none">{stats?.totalAppointments || 0}</span>
                        </div>
                        <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                                <UserPlus className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Sans RDV</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-800 leading-none">{stats?.totalWalkIns || 0}</span>
                        </div>
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                                <Activity className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Consult.</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-800 leading-none">{stats?.patientsInConsultation || 0}</span>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-slate-900 text-xl leading-none">Patients</h2>
                    <p className="text-xs text-slate-500 mt-1">{patientCount} patient(s) aujourd'hui</p>
                </div>
                {/* Filter Buttons */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFilterChange('all')}
                        className={cn("h-7 px-2.5 text-xs rounded-md", activeFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        Tous
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFilterChange('waiting')}
                        className={cn("h-7 px-2.5 text-xs rounded-md", activeFilter === 'waiting' ? "bg-white text-amber-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        Attente
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFilterChange('consultation')}
                        className={cn("h-7 px-2.5 text-xs rounded-md", activeFilter === 'consultation' ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        En cours
                    </Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Rechercher nom, prénom..."
                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all h-10"
                />
            </div>
        </div>
    );
}
