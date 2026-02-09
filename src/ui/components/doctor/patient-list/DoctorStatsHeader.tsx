import { Calendar, UserPlus, Activity, Search } from 'lucide-react';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { cn } from '@/ui/lib/utils';

interface DoctorStatsHeaderProps {
    stats: any;
    isLoading: boolean;
    patientCount: number;
    activeFilter: 'all' | 'present' | 'waiting' | 'consultation';
    onFilterChange: (filter: 'all' | 'present' | 'waiting' | 'consultation') => void;
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
    const statItems = [
        {
            label: 'Total Prévus',
            value: stats?.totalAppointments || 0,
            icon: Calendar,
            color: 'text-slate-600',
            bg: 'bg-slate-100'
        },
        {
            label: 'Présents',
            value: stats?.totalPresent || 0,
            icon: UserPlus,
            color: 'text-violet-600',
            bg: 'bg-violet-500/10'
        },
        {
            label: 'Waitlist',
            value: stats?.patientsWaiting || 0,
            icon: Activity,
            color: 'text-amber-600',
            bg: 'bg-amber-500/10'
        },
        {
            label: 'Consultation',
            value: stats?.patientsInConsultation || 0,
            icon: Activity,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10'
        }
    ];

    return (
        <div className="flex flex-col gap-2 bg-white z-10 sticky top-0 pb-2">
            {/* Gradient Header - Matching Waitlist Style */}
            <div className="px-4 py-3 mx-4 mt-3 rounded-2xl shadow-lg flex justify-between items-center shrink-0 border border-white/15" style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.2), 0 8px 10px -6px rgba(79, 70, 229, 0.1)'
            }}>
                <div className="flex items-center gap-3">
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Patients
                    </h2>
                    <span className="text-xs font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-full shadow-sm">
                        {patientCount}
                    </span>
                </div>

                {/* Search in Header */}
                <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-200" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher..."
                        className="pl-8 h-8 bg-white/10 border-white/20 text-white placeholder:text-indigo-200 focus:bg-white/20 focus:ring-0 focus:border-white/40 transition-all text-xs rounded-lg"
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 px-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-20 rounded-2xl bg-slate-50" />
                        <Skeleton className="h-20 rounded-2xl bg-slate-50" />
                        <Skeleton className="h-20 rounded-2xl bg-slate-50" />
                        <Skeleton className="h-20 rounded-2xl bg-slate-50" />
                    </>
                ) : (
                    <>
                        {statItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    className="flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all hover:bg-slate-50 hover:shadow-sm group cursor-default border border-transparent hover:border-slate-100"
                                >
                                    <div className={`p-2 rounded-xl ${item.bg} mb-1.5 group-hover:scale-110 transition-transform`}>
                                        <Icon className={`h-4 w-4 ${item.color}`} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest leading-none opacity-60 mb-1",
                                        item.color
                                    )}>
                                        {item.label}
                                    </span>
                                    <span className={cn(
                                        "text-2xl font-extrabold tracking-tighter leading-none",
                                        item.color
                                    )}>
                                        {item.value}
                                    </span>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="px-4 flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange('present')}
                    className={cn(
                        "flex-1 h-8 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all border",
                        activeFilter === 'present'
                            ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-violet-50 hover:text-violet-700"
                    )}
                >
                    Présents
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange('all')}
                    className={cn(
                        "flex-1 h-8 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all border",
                        activeFilter === 'all'
                            ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                    )}
                >
                    Prévus
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange('consultation')}
                    className={cn(
                        "flex-1 h-8 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all border",
                        activeFilter === 'consultation'
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                    )}
                >
                    En Cours
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange('waiting')}
                    className={cn(
                        "flex-1 h-8 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all border",
                        activeFilter === 'waiting'
                            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-amber-50 hover:text-amber-700"
                    )}
                >
                    En Attente
                </Button>
            </div>
        </div>
    );
}
