import { useState, useEffect } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/ui/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/ui/components/ui/radio-group';

function ClientScanningStep({ onSelect, selectedIP }: { onSelect: (ip: string) => void, selectedIP: string }) {
    const [scanning, setScanning] = useState(false);
    const [servers, setServers] = useState<any[]>([]);
    const [manualIP, setManualIP] = useState(selectedIP);

    // Start scanning on mount
    useEffect(() => {
        let mounted = true;

        const performScan = async () => {
            setScanning(true);
            try {
                const found = await window.electronAPI.scanForServers();
                if (mounted) {
                    setServers(found || []);
                    setScanning(false);
                }
            } catch (e) {
                console.error("Scan failed", e);
                if (mounted) setScanning(false);
            }
        };

        performScan();

        return () => { mounted = false; };
    }, []);

    const handleServerSelect = (srv: any) => {
        setManualIP(srv.ip);
        onSelect(srv.ip);
    };

    const handleManualChange = (val: string) => {
        setManualIP(val);
        onSelect(val);
    };

    return (
        <div className="space-y-4">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Connexion au Serveur</h3>
                <p className="text-sm text-muted-foreground">
                    Recherche des serveurs "Cabinet Medical" disponibles sur le réseau local...
                </p>
            </div>

            <div className="min-h-[100px] max-h-[100px] flex flex-col items-center justify-center border rounded-md p-2 bg-muted/10 space-y-2 overflow-y-auto">
                {scanning && servers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mb-2"></div>
                        <span>Scan en cours...</span>
                    </div>
                )}

                {!scanning && servers.length === 0 && (
                    <div className="text-center py-2 text-muted-foreground">
                        Aucun serveur trouvé. Assurez-vous que l'hôte est lancé.
                    </div>
                )}

                {servers.map((srv, idx) => (
                    <div
                        key={`${srv.ip}-${idx}`}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors flex justify-between items-center ${selectedIP === srv.ip ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => handleServerSelect(srv)}
                    >
                        <div>
                            <div className="font-medium">{srv.name}</div>
                            <div className="text-xs text-muted-foreground">{srv.ip}:{srv.port}</div>
                        </div>
                        {selectedIP === srv.ip && (
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2 pt-2">
                <Label className="text-xs">Ou saisir l'IP manuellement :</Label>
                <div className="flex gap-2">
                    <Input
                        placeholder="Ex: 192.168.1.50"
                        value={manualIP}
                        onChange={(e) => handleManualChange(e.target.value)}
                    />
                    <Button
                        variant="outline"
                        onClick={async () => {
                            setScanning(true);
                            const found = await window.electronAPI.scanForServers();
                            setServers(found || []);
                            setScanning(false);
                        }}
                        disabled={scanning}
                    >
                        Actualiser
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface SetupWizardProps {
    onComplete: () => void;
    initialConfig?: any;
}

export function SetupWizard({ onComplete, initialConfig }: SetupWizardProps) {
    const [step, setStep] = useState(0);
    const [businessName, setBusinessName] = useState(initialConfig?.businessName || '');
    const [businessType, setBusinessType] = useState(initialConfig?.businessType || '');
    const [appMode, setAppMode] = useState<'both' | 'secretary'>(initialConfig?.appMode || 'both');
    const [serverMode, setServerMode] = useState<'host' | 'client'>(initialConfig?.serverMode || 'host');
    const [dbPath, setDbPath] = useState(initialConfig?.dbPath || '');
    const [logoPath, setLogoPath] = useState(initialConfig?.logoPath || '');
    const [isSaving, setIsSaving] = useState(false);

    // Supabase State
    const [enableSupabaseSync, setEnableSupabaseSync] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');

    useEffect(() => {
        // Make window transparent for the setup wizard
        document.body.style.backgroundColor = 'transparent';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    // Auto-set app mode to secretary when Kinesis type is selected
    useEffect(() => {
        if (businessType === 'kinesis') {
            setAppMode('secretary');
        }
    }, [businessType]);

    const handleSelectDirectory = async () => {
        try {
            const path = await window.electronAPI.selectDirectory();
            if (path) {
                setDbPath(path);
            }
        } catch (error) {
            console.error('Failed to select directory', error);
        }
    };

    const handleSelectLogo = async () => {
        try {
            const rawPath = await window.electronAPI.selectFile([
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg'] },
            ]);

            if (rawPath) {
                // Just set the path, let the backend handle copying during save
                setLogoPath(rawPath);
            }
        } catch (error) {
            console.error('Failed to select logo', error);
        }
    };
    const handleFinish = async () => {
        setIsSaving(true);
        // PLUG YOUR URL AND ANON KEY HERE
        const HARDCODED_SUPABASE_URL = 'https://oouzzscntdsqqhfsbnli.supabase.co';
        const HARDCODED_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdXp6c2NudGRzcXFoZnNibmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzY1MTksImV4cCI6MjA3Mjc1MjUxOX0.KYcBMIqxmDhSnqBQjr_U7MLFG3Mncqsf-o_4lNrvxGw';

        try {
            await window.electronAPI.saveSetup({
                businessName,
                businessType,
                appMode,
                serverMode,
                dbPath: serverMode === 'host' ? dbPath : '', // Only save DB path if host
                serverIP: serverMode === 'client' ? dbPath : undefined, // Reuse dbPath state for IP
                serverPort: serverMode === 'client' ? 3001 : undefined,
                logoPath,
                // Pass sync params
                enableSupabaseSync,
                supabaseUrl: HARDCODED_SUPABASE_URL,
                supabaseKey: HARDCODED_SUPABASE_KEY
            });
            // Give a small delay for feeling
            setTimeout(() => {
                onComplete();
            }, 1000);
        } catch (error) {
            console.error('Failed to save setup', error);
            setIsSaving(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium">Bienvenue !</h3>
                            <p className="text-sm text-muted-foreground">
                                Ce guide va vous aider à configurer votre application Cabinet Médical pour la première fois.
                            </p>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="businessName">Nom du Cabinet</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                Entrez le nom de votre cabinet médical.
                            </p>
                            <Input
                                id="businessName"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Ex: Cabinet Médical Dr. Dupont"
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="businessType">Type de Cabinet</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                Sélectionnez le type de votre cabinet.
                            </p>
                            <Select value={businessType} onValueChange={setBusinessType}>
                                <SelectTrigger id="businessType">
                                    <SelectValue placeholder="Sélectionnez un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cabinet-ophthalmologie">
                                        Cabinet d'Ophtalmologie
                                    </SelectItem>
                                    <SelectItem value="kinesis">
                                        Kinesis
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 3:
                const isKineType = businessType === 'kinesis';
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Mode d'Application</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                {isKineType
                                    ? "Ce type de cabinet (Kinesis) ne supporte que le mode Secrétaire uniquement."
                                    : "Choisissez le mode d'utilisation de l'application."
                                }
                            </p>
                            <RadioGroup
                                value={appMode}
                                onValueChange={(value) => setAppMode(value as 'both' | 'secretary')}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="both"
                                        id="mode-both"
                                        disabled={isKineType}
                                    />
                                    <Label
                                        htmlFor="mode-both"
                                        className={`font-normal ${isKineType ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                    >
                                        Docteur + Secrétaire
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="secretary" id="mode-secretary" />
                                    <Label htmlFor="mode-secretary" className="font-normal cursor-pointer">
                                        Secrétaire uniquement
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div >
                    </div >
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Mode Serveur</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                Ce poste sera-t-il le serveur principal (Hôte) ou un poste secondaire (Client) ?
                            </p>
                            <RadioGroup
                                value={serverMode}
                                onValueChange={(value) => setServerMode(value as 'host' | 'client')}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="host" id="mode-host" />
                                    <Label htmlFor="mode-host" className="font-normal cursor-pointer">
                                        Hôte (Serveur + Base de données)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="client" id="mode-client" />
                                    <Label htmlFor="mode-client" className="font-normal cursor-pointer">
                                        Client (Poste secondaire)
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                );
            case 5:
                if (serverMode === 'client') {
                    // Replaced inline hooks with extracted component to comply with React Rules of Hooks
                    return (
                        <ClientScanningStep
                            selectedIP={dbPath}
                            onSelect={(ip) => setDbPath(ip)}
                        />
                    );
                }
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Emplacement des Données</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                Ce dossier contiendra la base de données, les sauvegardes et les fichiers (livres, assets).
                            </p>
                            <div className="flex gap-2">
                                <Input value={dbPath} readOnly placeholder="Aucun dossier sélectionné" />
                                <Button variant="secondary" onClick={handleSelectDirectory}>
                                    Parcourir
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 6:
                // New Step 6: Supabase Sync (Conditional)
                if (businessType === 'cabinet-ophthalmologie' && serverMode === 'host') {
                    return (
                        <div className="space-y-4">
                            <div>
                                <Label>Synchronisation de données</Label>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Voulez-vous peupler la base de données avec les données initiales ?
                                </p>

                                <div className="flex items-center space-x-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="enableSupabase"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={enableSupabaseSync}
                                        onChange={(e) => {
                                            setEnableSupabaseSync(e.target.checked);
                                            if (!e.target.checked) setEnteredPin('');
                                        }}
                                    />
                                    <Label htmlFor="enableSupabase" className="font-normal cursor-pointer">
                                        Oui, peupler la base de données
                                    </Label>
                                </div>

                                {enableSupabaseSync && (
                                    <div className="space-y-3 border-l-2 pl-3 border-primary/20 transition-all">
                                        <div>
                                            <Label htmlFor="pinCode" className="text-xs">Code PIN de sécurité</Label>
                                            <Input
                                                id="pinCode"
                                                value={enteredPin}
                                                onChange={e => setEnteredPin(e.target.value)}
                                                placeholder="Entrez le code PIN"
                                                type="password"
                                            />
                                            {enteredPin && enteredPin !== '120669' && (
                                                <p className="text-[10px] text-destructive mt-1">Code PIN incorrect</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }
                // Fallthrough if not applicable
                return (
                    <div className="flex flex-col items-center justify-center space-y-2 h-40">
                        <p className="text-muted-foreground">Étape ignorée pour ce mode.</p>
                        <Button variant="outline" size="sm" onClick={() => setStep(s => s + 1)}>Continuer</Button>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Logo du Cabinet</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                Choisissez le logo qui apparaîtra sur vos documents et ordonnances.
                            </p>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted/20">
                                    {logoPath ? (
                                        <img
                                            src={`local-resource:///${logoPath.replace(/\\/g, '/')}`}
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-muted-foreground text-xs">Aperçu</span>
                                    )}
                                </div>
                                <div className="flex gap-2 w-full">
                                    <Input value={logoPath} readOnly placeholder="Aucun fichier sélectionné" />
                                    <Button variant="secondary" onClick={handleSelectLogo}>
                                        Parcourir
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 8:
                return (
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium">Configuration Terminée !</h3>
                            <p className="text-sm text-muted-foreground">
                                Tout est prêt. Cliquez sur terminer pour lancer l'application.
                            </p>
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left text-sm space-y-2 break-all">
                                <p><strong>Nom du Cabinet :</strong> {businessName || 'Non défini'}</p>
                                <p><strong>Type :</strong> {businessType || 'Non défini'}</p>
                                <p><strong>Mode App :</strong> {appMode === 'both' ? 'Docteur + Secrétaire' : 'Secrétaire uniquement'}</p>
                                <p><strong>Mode Serveur :</strong> {serverMode === 'host' ? 'Hôte' : 'Client'}</p>
                                {serverMode === 'host' && <p><strong>Base de données :</strong> {dbPath}</p>}
                                <p><strong>Logo :</strong> {logoPath ? 'Défini' : 'Non défini'}</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="w-full h-screen border border-border rounded-3xl overflow-hidden shadow-none flex flex-col bg-background">
            <CardHeader className="cursor-move flex-none border-b" style={{ WebkitAppRegion: 'drag' } as any}>
                <CardTitle>Configuration Initiale</CardTitle>
                <CardDescription>Étape {step + 1} sur 9</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
                <div className="min-h-full flex flex-col justify-center">
                    {renderStep()}
                </div>
            </CardContent>
            <CardFooter className="flex-none justify-between border-t bg-muted/20 p-6">
                <Button
                    variant="ghost"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0 || isSaving}
                >
                    Retour
                </Button>

                {step < 8 ? (
                    <Button
                        onClick={() => {
                            // If on step 6 (Supabase) but conditional doesn't match, skip is automatic or we handle here
                            // In renderStep, we put a "Continuer" button for the skip case, but let's make it cleaner:
                            const skipSupabase = step === 6 && !(businessType === 'cabinet-ophthalmologie' && serverMode === 'host');

                            // If skipping specific steps logic:
                            if (skipSupabase) {
                                setStep(s => s + 1); // Skip to 7
                                return;
                            }

                            setStep((s) => s === 5 && serverMode === 'client' ? s + 1 : s + 1)
                        }}
                        disabled={
                            (step === 1 && !businessName.trim()) || // Require business name
                            (step === 2 && !businessType) || // Require business type
                            (step === 5 && serverMode === 'host' && !dbPath) || // Require DB path ONLY if host
                            (step === 5 && serverMode === 'client' && !dbPath) || // "dbPath" stores IP in client mode
                            (step === 6 && enableSupabaseSync && enteredPin !== '120669') // If sync enabled, require correct PIN
                        }
                    >
                        Suivant
                    </Button>
                ) : (
                    <Button onClick={handleFinish} disabled={isSaving}>
                        {isSaving ? 'Enregistrement...' : "Lancer l'application"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
