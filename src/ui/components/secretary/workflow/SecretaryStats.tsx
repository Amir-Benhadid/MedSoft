import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { Calendar, UserPlus, Stethoscope } from 'lucide-react';
import { Skeleton } from "@/ui/components/ui/skeleton";
import { cn } from "@/ui/lib/utils";

export default function SecretaryStats() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['todayStats'],
        queryFn: () => orpcClient.stats.getTodayStats(),
        refetchInterval: 5000,
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-4 py-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
            </div>
        );
    }

    const statItems = [
        {
            label: 'RDV',
            value: stats?.totalAppointments ?? 0,
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'SA',
            value: stats?.totalWalkIns ?? 0,
            icon: UserPlus,
            color: 'text-rose-600',
            bg: 'bg-rose-500/10'
        },
        {
            label: 'Consult.',
            value: stats?.patientsInConsultation ?? 0,
            icon: Stethoscope,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10'
        }
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {statItems.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.label}
                        className="flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all hover:bg-white hover:shadow-sm group cursor-default"
                    >
                        <div className={`p-1.5 rounded-xl ${item.bg} mb-1.5 group-hover:scale-110 transition-transform`}>
                            <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest leading-none opacity-80",
                            item.color
                        )}>
                            {item.label}
                        </span>
                        <span className={cn(
                            "text-3xl font-extrabold tracking-tighter mt-1 leading-none",
                            item.color
                        )}>
                            {item.value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
