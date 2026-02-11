import { Button } from "@/ui/components/ui/button";
import { ModeToggle } from "@/ui/components/mode-toggle";
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
    X,
    Menu,
    List
} from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { useNavigation } from "@/ui/hooks/useNavigation";
import { useState } from "react";
import { PatientSearchDialog } from "../shared/PatientSearchDialog";
import { SecretaryPatientFileSheet } from "./SecretaryPatientFileSheet";
import { orpcClient } from "@/ui/lib/orpc/client";
import { useQuery } from "@tanstack/react-query";
import { useConfig } from "@/ui/contexts/ConfigContext";
import { useDoctorCall } from "@/ui/hooks/useDoctorCall";
import { UpdateIndicator } from "@/ui/components/UpdateIndicator";
import { GuestCertificateSheet } from "./sheet/GuestCertificateSheet";

interface SecretaryHeaderProps {
    currentTab?: string;
    onTabChange?: (tab: string) => void;
}

export default function SecretaryHeader({ currentTab = 'agenda', onTabChange }: SecretaryHeaderProps) {
    const { goToLanding } = useNavigation();
    const { logoPath, businessName, appMode } = useConfig();
    const { isCalling, cancelCall } = useDoctorCall();

    const tabs = [
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'resume', label: 'Recette', icon: BarChart2 },
        ...(appMode === 'both' ? [
            { id: 'tarifs', label: 'Activités', icon: CreditCard },
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
    const [isGuestCertOpen, setIsGuestCertOpen] = useState(false);

    const handlePatientSelect = (patientId: string, action?: 'file' | 'consultation' | 'agenda') => {
        setInitialSheetTab(action === 'agenda' ? 'rdv' : 'info');
        setSelectedPatientId(patientId);
        setIsPatientInfoOpen(true);
        setIsSearchOpen(false);
    };

    return (
        <header className="h-14 sm:h-16 bg-card/80 backdrop-blur-md border-b border-border/60 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 sticky top-0" style={{ WebkitAppRegion: 'drag' } as any}>
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                {logoPath ? (
                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl border-2 border-card shadow-sm bg-card">
                        <img src={`local-resource:///${logoPath.replace(/\\/g, '/')}`} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center shadow-sm">
                        <Activity className="h-5 w-5 text-primary" />
                    </div>
                )}
                <div>
                    <h1 className="text-lg font-bold text-foreground leading-tight">Secrétaire Médical</h1>
                    <p className="text-xs text-muted-foreground font-medium">{businessName || 'Cabinet Médical'}</p>
                </div>
            </div>

            {/* Navigation Tabs - Centered with Search */}
            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => onTabChange?.('toggle-sidebar')}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <nav className="flex items-center gap-1 bg-secondary/30 sm:bg-secondary/50 p-1 rounded-xl border border-border/30 sm:border-border/50 overflow-x-auto scrollbar-hide max-w-[50vw] sm:max-w-none">
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
                    className="hidden md:flex w-64 justify-start text-muted-foreground bg-secondary/30 border-border hover:bg-card hover:text-foreground hover:border-primary/50 transition-all shadow-sm"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher un dossier...
                </Button>

                <Button
                    variant="outline"
                    className="hidden md:flex text-muted-foreground bg-secondary/30 border-border hover:bg-card hover:text-foreground hover:border-primary/50 transition-all shadow-sm ml-2"
                    onClick={() => setIsGuestCertOpen(true)}
                    title="Certificat Patient Externe"
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Certificat Externe
                </Button>

                {/* Mobile Search Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <Search className="h-5 w-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => setIsGuestCertOpen(true)}
                >
                    <FileText className="h-5 w-5" />
                </Button>

                {/* Mobile Waitlist Toggle (Agenda Only) */}
                {currentTab === 'agenda' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => onTabChange?.('toggle-waitlist')}
                    >
                        <List className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <UpdateIndicator className="mr-2" />
                <div className="flex items-center gap-1 pr-3 border-r border-border">
                    <ModeToggle />

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-9 w-9 rounded-lg transition-all duration-300",
                            isCalling
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse shadow-lg ring-2 ring-offset-2 ring-destructive"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-50"
                        )}
                        onClick={() => isCalling && cancelCall()}
                        disabled={!isCalling}
                        title={isCalling ? "Docteur vous appelle !" : "Pas d'appel en cours"}
                    >
                        <Bell className={cn("h-4 w-4", isCalling && "fill-current")} />
                    </Button>

                    {false && <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg">
                        <RefreshCw className="h-4 w-4" />
                    </Button>}
                    {false && appMode === 'secretary' && <MessageNotificationButton />}
                </div>

                {appMode !== 'secretary' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 h-9 px-3 rounded-lg"
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
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
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
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => window.electronAPI.closeWindow()}>
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
                mode="secretary"
            />

            <SecretaryPatientFileSheet
                patientId={selectedPatientId}
                open={isPatientInfoOpen}
                onOpenChange={setIsPatientInfoOpen}
                initialTab={initialSheetTab}
            />

            <GuestCertificateSheet
                open={isGuestCertOpen}
                onOpenChange={setIsGuestCertOpen}
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
                "flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 relative whitespace-nowrap",
                isActive
                    ? "bg-card text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
        >
            <tab.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
            {tab.label}
            {pendingCount > 0 && (
                <span className="ml-1 bg-destructive/10 text-destructive text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                </span>
            )}
        </button>
    )
}
