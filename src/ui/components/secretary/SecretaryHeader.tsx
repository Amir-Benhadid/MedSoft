import { Button } from "@/ui/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/ui/components/ui/alert-dialog";
import {
    Activity,
    Calendar,
    FileText,
    Folder,
    BarChart2,
    CreditCard,
    RefreshCw,
    Search,
    Bell,
    Settings,
    LogOut,
    Users,
    X
} from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { useNavigation } from "@/ui/hooks/useNavigation";
import { useState } from "react";
import { PatientSearchDialog } from "../shared/PatientSearchDialog";
import { SecretaryPatientFileSheet } from "./SecretaryPatientFileSheet";
import { orpcClient } from "@/ui/lib/orpc/client";
import { useQuery } from "@tanstack/react-query";
import { useConfig } from "@/ui/contexts/ConfigContext";

interface SecretaryHeaderProps {
    currentTab?: string;
    onTabChange?: (tab: string) => void;
}

export default function SecretaryHeader({ currentTab = 'agenda', onTabChange }: SecretaryHeaderProps) {
    const { goToLanding } = useNavigation();
    const { logoPath, businessName, appMode } = useConfig();

    const tabs = [
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'resume', label: 'Résumé Jour', icon: BarChart2 },
        ...(appMode === 'both' ? [
            { id: 'tarifs', label: 'Tarifs', icon: CreditCard },
            { id: 'annuaire', label: 'Agenda', icon: Users },
        ] : []),
        ...(appMode === 'secretary' ? [
            { id: 'monthly', label: 'Résumé Mois', icon: Calendar },
            { id: 'books', label: 'Livres', icon: FileText },
            { id: 'settings', label: 'Paramètres', icon: Settings },
        ] : []),
    ];

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    // Note: Secretary navigation to patient file is limited for now, but we'll allow search.
    // If we want to open key patient info, we might need a dialog or navigation to 'Dossiers' tab with state.

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [isPatientInfoOpen, setIsPatientInfoOpen] = useState(false);
    const [initialSheetTab, setInitialSheetTab] = useState<string>('info');

    const handlePatientSelect = (patientId: string, action?: 'file' | 'consultation' | 'agenda') => {
        setInitialSheetTab(action === 'agenda' ? 'rdv' : 'info');
        setSelectedPatientId(patientId);
        setIsPatientInfoOpen(true);
        setIsSearchOpen(false);
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20 shadow-sm" style={{ WebkitAppRegion: 'drag' } as any}>
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                {logoPath ? (
                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl border-2 border-white shadow-sm bg-white">
                        <img src={`local-resource:///${logoPath.replace(/\\/g, '/')}`} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-blue-50 border-2 border-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                )}
                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-tight">Secrétaire Médical</h1>
                    <p className="text-xs text-slate-500 font-medium">{businessName || 'Cabinet Médical'}</p>
                </div>
            </div>

            {/* Navigation Tabs - Centered with Search */}
            <div className="flex-1 flex items-center justify-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <nav className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
                    {tabs.map((tab) => (
                        <TabButton
                            key={tab.id}
                            tab={tab}
                            isActive={currentTab === tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                        />
                    ))}
                </nav>

                <Button
                    variant="outline"
                    className="w-64 justify-start text-muted-foreground bg-slate-50/50 border-slate-200 hover:bg-white hover:text-slate-700 hover:border-blue-200 transition-all shadow-sm"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher un dossier...
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
                    {false && <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <RefreshCw className="h-4 w-4" />
                    </Button>}
                    {false && appMode === 'secretary' && <MessageNotificationButton />}
                </div>

                {appMode !== 'secretary' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 h-9 px-3 rounded-lg"
                        onClick={goToLanding}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline font-medium">Déconnexion</span>
                    </Button>
                )}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Quitter l'application ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Êtes-vous sûr de vouloir fermer l'application ?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => window.electronAPI.closeWindow()}>
                                Quitter
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <PatientSearchDialog
                open={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                onPatientSelect={handlePatientSelect}
            />

            <SecretaryPatientFileSheet
                patientId={selectedPatientId}
                open={isPatientInfoOpen}
                onOpenChange={setIsPatientInfoOpen}
                initialTab={initialSheetTab}
            />
        </header>
    );
}

function MessageNotificationButton() {
    const { data } = useQuery({
        queryKey: ['messages', 'unread', 'doctor'],
        queryFn: () => orpcClient.messages.countUnread({ sender: 'doctor' }),
        refetchInterval: 5000
    });

    const count = data?.count || 0;

    return (
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg relative">
            <Bell className="h-4 w-4" />
            {count > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
        </Button>
    );
}

function TabButton({ tab, isActive, onClick }: { tab: any, isActive: boolean, onClick: () => void }) {
    const isTarifs = tab.id === 'tarifs';
    const { data } = useQuery({
        queryKey: ['invoices', 'pending'],
        queryFn: async () => {
            const res = await orpcClient.invoices.countPending();
            return res;
        },
        refetchInterval: 5000,
        enabled: isTarifs
    });

    const pendingCount = isTarifs ? (data?.count || 0) : 0;

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                isActive
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
        >
            <tab.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
            {tab.label}
            {pendingCount > 0 && (
                <span className="ml-1 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                </span>
            )}
        </button>
    )
}
