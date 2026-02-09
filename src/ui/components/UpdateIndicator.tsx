import { useUpdateStore } from '@/ui/store/updateStore';
import { Button } from '@/ui/components/ui/button';
import { Loader2, DownloadCloud, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/ui/lib/utils';
import { useEffect, useState } from 'react';

interface UpdateIndicatorProps {
    className?: string;
    mini?: boolean; // For smaller displays
}

export function UpdateIndicator({ className, mini }: UpdateIndicatorProps) {
    const { status, progress, version, quitAndInstall } = useUpdateStore();
    const [showLabel, setShowLabel] = useState(false);

    // Auto-show label when status changes to something interesting
    useEffect(() => {
        if (status === 'available' || status === 'ready') {
            setShowLabel(true);
            const timer = setTimeout(() => setShowLabel(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    if (status === 'idle' || status === 'checking') return null;

    if (status === 'downloading') {
        return (
            <div className={cn("flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium animate-pulse border border-blue-100", className)}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Téléchargement {progress.toFixed(0)}%</span>
            </div>
        );
    }

    if (status === 'ready') {
        return (
            <Button
                size="sm"
                className={cn("bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm animate-bounce-subtle", className)}
                onClick={quitAndInstall}
            >
                <RefreshCw className="w-4 h-4" />
                <span className={cn(mini && "hidden sm:inline")}>
                    Redémarrer (v{version})
                </span>
            </Button>
        );
    }

    if (status === 'available') {
        return (
            <div className={cn("flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100", className)}>
                <DownloadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mise à jour disponible</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div title="Erreur de mise à jour" className={cn("flex items-center justify-center p-2 text-red-500", className)}>
                <AlertCircle className="w-4 h-4" />
            </div>
        );
    }

    return null;
}
