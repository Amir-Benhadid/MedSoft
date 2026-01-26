import React, { useState, memo } from 'react';
import { useConsultationStore } from '@/ui/store/consultationStore';
// useDocumentsState removed as state is now in useConsultationStore
import { usePrintHandlers } from './hooks/usePrintHandlers';
import { Button } from '@/ui/components/ui/button';
import {
    Printer, FileText, Eye, Pill, FileSpreadsheet, Stethoscope,
    FilePlus, FileCheck, FileOutput, Activity, FileHeart, Loader2
} from 'lucide-react';
import genericRecords from './medical_records_structured.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { cn } from '@/ui/lib/utils';
import { ScrollArea, ScrollBar } from '@/ui/components/ui/scroll-area';
import { Card } from '@/ui/components/ui/card';

interface DocumentsContainerProps {
    allowedTabs?: string[];
}

type TabItem = {
    id: string;
    label: string;
    icon: React.ElementType;
};

const DOC_TABS: TabItem[] = [
    { id: 'medications', label: 'Ordonnance', icon: Pill },
    { id: 'glasses', label: 'Lunettes', icon: Eye },
    { id: 'report', label: 'Compte Rendu', icon: FileSpreadsheet },
    { id: 'contacts', label: 'Lentilles', icon: Eye },
    { id: 'visualAcuity', label: 'Acuité', icon: Eye },
    { id: 'workStop', label: 'Arrêt', icon: Stethoscope },
    { id: 'absence', label: 'Absence', icon: FileOutput },
    { id: 'bilanPreOp', label: 'Pre-Op', icon: FileCheck },
    { id: 'bilanDiabete', label: 'Diabète', icon: Activity },
    { id: 'bilanCardio', label: 'Cardio', icon: FileHeart },
    { id: 'bilanCnas', label: 'CNAS', icon: FileText },
    { id: 'bilanCtf', label: 'CTF', icon: FileText },
    { id: 'bilanBiometrie', label: 'Biométrie', icon: FileText },
    { id: 'bilanInfectieux', label: 'Infectieux', icon: FileText },
    { id: 'generic', label: 'Modèles', icon: FilePlus },
    { id: 'radiography', label: 'Protocole', icon: FileText },
];

const GlassesDocument = React.lazy(() => import('./GlassesDocument'));
const ContactLensesDocument = React.lazy(() => import('./ContactLensesDocument'));
const MedicalReportDocument = React.lazy(() => import('./MedicalReportDocument'));
const WorkStopDocument = React.lazy(() => import('./WorkStopDocument'));
const GenericDocument = React.lazy(() => import('./GenericDocument'));
const VisualAcuityCertificateDocument = React.lazy(() => import('./VisualAcuityCertificateDocument'));
const BilanDocument = React.lazy(() => import('./BilanDocuments'));
const AbsenceCertificateDocument = React.lazy(() => import('./AbsenceCertificateDocument'));
const PrescriptionTab = React.lazy(() => import('../dashboard/PrescriptionTab'));
const DocumentPreview = React.lazy(() => import('./DocumentPreview'));
const DynamicDocumentEditor = React.lazy(() => import('./DynamicDocumentEditor').then(module => ({ default: module.DynamicDocumentEditor })));

// Loading Fallback
const DocumentLoader = () => (
    <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-500 font-medium">Chargement du document...</p>
        </div>
    </div>
);

const DocumentsContainer: React.FC<DocumentsContainerProps> = (props) => {
    // Determine default tab based on allowedTabs order or global default
    const defaultTab = props.allowedTabs && props.allowedTabs.length > 0
        ? props.allowedTabs[0]
        : 'medications';

    const [activeDocTab, setActiveDocTab] = useState(defaultTab);
    const [showPreviewPane, setShowPreviewPane] = useState(true);
    const [selectedGenericTemplate, setSelectedGenericTemplate] = useState('');

    const {
        handlePrint,
        handlePreview
    } = usePrintHandlers({
        activeDocTab,
    });

    const visibleTabs = React.useMemo(() => {
        if (!props.allowedTabs) return DOC_TABS;
        // Map allowedTabs to preserve order
        return props.allowedTabs
            .map(id => DOC_TABS.find(tab => tab.id === id))
            .filter((tab): tab is TabItem => !!tab);
    }, [props.allowedTabs]);

    React.useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.find(t => t.id === activeDocTab)) {
            setActiveDocTab(visibleTabs[0].id);
        }
    }, [visibleTabs, activeDocTab]);

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Toolbar / Header */}
            <div className="flex-none bg-background border-b px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-sm/50">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-2 pb-1">
                        {visibleTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeDocTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveDocTab(tab.id)}
                                    className={cn(
                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                        isActive
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                                            : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>

                <div className="flex items-center gap-2 pl-4 border-l">
                    <Button
                        size="sm"
                        variant={showPreviewPane ? "secondary" : "outline"}
                        className={cn(
                            "h-9 gap-2 border-blue-100 transition-colors text-sm",
                            showPreviewPane ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        )}
                        onClick={() => setShowPreviewPane(!showPreviewPane)}
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Aperçu</span>
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 gap-2 bg-slate-800 hover:bg-slate-700 shadow-sm text-sm"
                        onClick={handlePrint}
                    >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Imprimer</span>
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-row">
                <div className="flex-1 overflow-hidden p-4 sm:p-6 transition-all duration-300 ease-in-out">
                    <Card className="h-full overflow-hidden flex flex-col shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                            <React.Suspense fallback={<DocumentLoader />}>
                                {activeDocTab === 'report' && <MedicalReportDocument />}
                                {activeDocTab === 'glasses' && <GlassesDocument />}
                                {activeDocTab === 'medications' && <PrescriptionTab />}
                                {activeDocTab === 'contacts' && <ContactLensesDocument />}
                                {activeDocTab === 'visualAcuity' && <VisualAcuityCertificateDocument />}

                                {activeDocTab.startsWith('bilan') && (
                                    <BilanDocument
                                        type={activeDocTab.replace('bilan', '').toLowerCase()}
                                    />
                                )}

                                {activeDocTab === 'workStop' && <WorkStopDocument />}
                                {activeDocTab === 'absence' && <AbsenceCertificateDocument />}
                                {activeDocTab === 'generic' && (
                                    <GenericDocumentSelector
                                        selectedTemplate={selectedGenericTemplate}
                                        onSelectTemplate={setSelectedGenericTemplate}
                                    />
                                )}
                                {activeDocTab === 'radiography' && <DynamicDocumentEditor />}
                            </React.Suspense>
                        </div>
                    </Card>
                </div>
                {showPreviewPane && (
                    <div className="w-2/5 flex-none border-l bg-slate-50 overflow-hidden shadow-xl z-20 transition-all duration-300">
                        <React.Suspense fallback={<DocumentLoader />}>
                            <DocumentPreview activeDocTab={activeDocTab} selectedGenericTemplate={selectedGenericTemplate} />
                        </React.Suspense>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(DocumentsContainer);

const GenericDocumentSelector = ({ selectedTemplate, onSelectTemplate }: { selectedTemplate: string, onSelectTemplate: (val: string) => void }) => {
    const selectedRecord = genericRecords.find(r => r.Code === selectedTemplate);

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Sélectionner un modèle</label>
                <Select value={selectedTemplate} onValueChange={onSelectTemplate}>
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choisir un modèle..." />
                    </SelectTrigger>
                    <SelectContent>
                        {genericRecords.map((r) => (
                            <SelectItem key={r.Code} value={r.Code}>
                                {r.Code} - {r.Title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {selectedRecord ? (
                <div className="pt-4 border-t">
                    <GenericDocument
                        config={selectedRecord}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50">
                    <FilePlus className="w-10 h-10 mb-2 opacity-50" />
                    <p>Veuillez sélectionner un modèle de document pour commencer.</p>
                </div>
            )}
        </div>
    );
}
