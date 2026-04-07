import React, { memo, useCallback, useMemo, useState } from 'react';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { cn } from '@/ui/lib/utils';
import { usePrintHandlers } from './hooks/usePrintHandlers';
import { useDocumentsState } from './hooks/useDocumentsState';
import DocumentFormRenderer from './components/DocumentFormRenderer';
import DocumentPreviewSection from './components/DocumentPreviewSection';
import { DocumentToolbar } from './components/DocumentToolbar';
import { TabItem } from './components/DocumentTabs';
import {
    Pill, Eye, FileSpreadsheet, FileCheck, Stethoscope, Activity, LayoutGrid,
    FileHeart, FileText, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tab Definitions
const TAB_GROUPS: { PAGE_1: TabItem[], PAGE_2: TabItem[] } = {
    PAGE_1: [
        { id: 'radiography', label: 'Exploration', icon: FlaskConical },
        { id: 'medications', label: 'Ordonnance', icon: Pill },
        { id: 'glasses', label: 'Lunettes', icon: Eye },
        { id: 'contacts', label: 'Lentilles', icon: Eye },
        { id: 'report', label: 'Compte Rendu', icon: FileSpreadsheet },
        { id: 'certificatAcuite', label: 'Certificat', icon: FileCheck },
    ],
    PAGE_2: [
        { id: 'workStop', label: 'Arrêt de travail', icon: Stethoscope },
        { id: 'absence', label: 'Absence', icon: FileCheck },
        { id: 'bilans', label: 'Bilans', icon: Activity, isGroup: true },
        { id: 'divers', label: 'Divers', icon: LayoutGrid },
        { id: 'generic', label: 'Libre', icon: FileText },
    ]
};

const BILAN_SUBTABS = [
    { id: 'bilanPreOp', label: 'Pre-Op', icon: FileCheck },
    { id: 'bilanDiabete', label: 'Diabète', icon: Activity },
    { id: 'bilanInflammatoire', label: 'Inflamm.', icon: FileHeart },
    { id: 'bilanUveite', label: 'Uvéite', icon: FileText },
];

interface DocumentsContainerProps {
    allowedTabs?: string[];
}

const DocumentsContainer: React.FC<DocumentsContainerProps> = ({ allowedTabs }) => {
    // Store Data
    const patient = useConsultationStore(state => state.patient);
    const leftEye = useConsultationStore(state => state.leftEye);
    const rightEye = useConsultationStore(state => state.rightEye);
    const prescriptions = useConsultationStore(state => state.prescriptions);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);
    const documentOverrides = useConsultationStore(state => state.documentOverrides);
    const setDocumentOverride = useConsultationStore(state => state.setDocumentOverride);

    // Report data state - sync from documentOverrides or initialize empty
    const reportData = useMemo(() => documentOverrides.report || {}, [documentOverrides.report]);
    const setReportData = useCallback((updater: any) => {
        if (typeof updater === 'function') {
            setDocumentOverride('report', updater(reportData));
        } else {
            setDocumentOverride('report', updater);
        }
    }, [reportData, setDocumentOverride]);

    // Navigation State
    const defaultTab = allowedTabs && allowedTabs.length > 0 ? allowedTabs[0] : 'medications';
    const [activeDocTab, setActiveDocTab] = useState(defaultTab);
    const [showPreviewPane, setShowPreviewPane] = useState(true);
    const [page, setPage] = useState(0);

    // Initial Data for useDocumentsState (from Store Overrides)
    // We prioritize the unified state if it exists, otherwise we might look at legacy keys if migration is needed
    // But for now, we assume unifiedDocumentsState is the source of truth for the form state.
    const initialDocumentsData = useMemo(() => documentOverrides.unifiedDocumentsState || {}, [documentOverrides]);

    // Prepare Data for useDocumentsState
    const prescriptionData = useMemo(() => ({
        treatments: prescriptions.map(p => ({
            ...p,
            frequency: { value: 1, unit: typeof p.frequency === 'string' ? p.frequency : 'par jour' },
            duration: { value: 1, unit: typeof p.duration === 'string' ? p.duration : 'mois' }
        })),
        notes: ''
    }), [prescriptions]);

    const absenceData = useMemo(() => initialDocumentsData.absenceData || { date: new Date(), reason: '' }, [initialDocumentsData]);
    const setAbsenceData = useCallback((updater: any) => {
        const currentUnifiedState = documentOverrides.unifiedDocumentsState || {};
        const currentAbsenceData = currentUnifiedState.absenceData || { date: new Date(), reason: '' };
        const newAbsenceData = typeof updater === 'function' ? updater(currentAbsenceData) : updater;
        setDocumentOverride('unifiedDocumentsState', {
            ...currentUnifiedState,
            absenceData: newAbsenceData
        });
    }, [documentOverrides.unifiedDocumentsState, setDocumentOverride]);

    const workStopData = useMemo(() => initialDocumentsData.workStopData || { startDate: new Date(), endDate: new Date(), reason: '', exitAuthorized: true }, [initialDocumentsData]);
    const setWorkStopData = useCallback((updater: any) => {
        const currentUnifiedState = documentOverrides.unifiedDocumentsState || {};
        const currentWorkStopData = currentUnifiedState.workStopData || { startDate: new Date(), endDate: new Date(), reason: '', exitAuthorized: true };
        const newWorkStopData = typeof updater === 'function' ? updater(currentWorkStopData) : updater;
        setDocumentOverride('unifiedDocumentsState', {
            ...currentUnifiedState,
            workStopData: newWorkStopData
        });
    }, [documentOverrides.unifiedDocumentsState, setDocumentOverride]);

    // Prepare tonometry data from eye measurements
    const tonometrie = useMemo(() => ({
        left_eye: {
            iop: leftEye.tension || '',
            pachymetry: leftEye.pachymetry || '',
            corrected_iop: leftEye.corrected_iop || '',
            tensionTime: leftEye.tensionTime || ''
        },
        right_eye: {
            iop: rightEye.tension || '',
            pachymetry: rightEye.pachymetry || '',
            corrected_iop: rightEye.corrected_iop || '',
            tensionTime: rightEye.tensionTime || ''
        }
    }), [leftEye.tension, leftEye.pachymetry, leftEye.corrected_iop, leftEye.tensionTime, rightEye.tension, rightEye.pachymetry, rightEye.corrected_iop, rightEye.tensionTime]);

    // Use shared state hook
    const {
        printWorkStopData,
        setPrintWorkStopData,
        printAbsenceData,
        setPrintAbsenceData,
    } = useDocumentsState({
        prescriptionData: prescriptionData,
        rightEyeData: rightEye,
        leftEyeData: leftEye,
        absenceData: absenceData,
        workStopData: workStopData
    });

    // Print Handlers
    const {
        handlePrint,
        handlePreview,
        isPrinting,
        isPreviewing,
        pdfUrl,
        showPreview: showPrintPreview,
        handleClosePreview: onClosePrintPreview
    } = usePrintHandlers({
        activeDocTab,
    });

    // Tab Navigation Helpers
    const handleTabClick = (tab: TabItem) => {
        if (!tab.isGroup) {
            setActiveDocTab(tab.id);
        } else {
            if (tab.id === 'bilans') setActiveDocTab('bilanPreOp');
            if (tab.id === 'divers') setActiveDocTab('divers');
        }
    };

    const currentSubTabs = useMemo(() => {
        if (BILAN_SUBTABS.some(t => t.id === activeDocTab)) return BILAN_SUBTABS;
        return null;
    }, [activeDocTab]);

    const currentTabList = useMemo(() => {
        const fullList = page === 0 ? TAB_GROUPS.PAGE_1 : TAB_GROUPS.PAGE_2;
        if (!allowedTabs) {
            // Hide specialized radiography tab in normal mode
            return fullList.filter(tab => tab.id !== 'radiography');
        }
        return fullList.filter(tab => allowedTabs.includes(tab.id) || (tab.isGroup && tab.id === 'bilans' && allowedTabs.some(at => at.startsWith('bilan'))));
    }, [page, allowedTabs]);

    return (
        <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Toolbar / Header */}
            <DocumentToolbar
                page={page}
                setPage={setPage}
                tabs={currentTabList}
                activeTab={activeDocTab}
                onTabClick={handleTabClick}
                showPreviewPane={showPreviewPane}
                setShowPreviewPane={setShowPreviewPane}
                absenceData={absenceData}
                setAbsenceData={setAbsenceData}
                printAbsenceData={printAbsenceData}
                setPrintAbsenceData={setPrintAbsenceData}
                workStopData={workStopData}
                setWorkStopData={setWorkStopData}
                printWorkStopData={printWorkStopData}
                setPrintWorkStopData={setPrintWorkStopData}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative" style={{ gap: 'var(--dash-gap)', padding: 'var(--dash-p)' }}>
                <div className="flex-1 overflow-hidden flex flex-col bg-card rounded-lg border border-border shadow-sm w-full md:w-[60%] transition-all">
                    {/* Bilan Subtabs */}
                    {currentSubTabs && (
                        <div
                            className="flex-none border-b border-border bg-muted/30 overflow-x-auto"
                            style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}
                        >
                            <div className="flex" style={{ gap: 'calc(var(--dash-gap) / 2)' }}>
                                {currentSubTabs.map(subTab => {
                                    const Icon = subTab.icon;
                                    const isActive = activeDocTab === subTab.id;
                                    return (
                                        <button
                                            key={subTab.id}
                                            onClick={() => setActiveDocTab(subTab.id)}
                                            className={cn(
                                                "inline-flex items-center font-semibold border transition-all rounded-lg",
                                                isActive
                                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                    : "bg-background text-muted-foreground border-border hover:bg-muted hover:border-primary/30"
                                            )}
                                            style={{ paddingInline: 'calc(var(--dash-p) / 1.5)', paddingBlock: 'calc(var(--dash-gap) / 4)', gap: 'calc(var(--dash-gap) / 4)', fontSize: 'var(--dash-label)' }}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {subTab.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div
                        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar"
                        style={{ padding: 'var(--dash-p)' }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeDocTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                style={{ height: '100%' }}
                            >
                                <DocumentFormRenderer
                                    activeDocTab={activeDocTab}
                                    onPrint={handlePrint}
                                    isPrinting={isPrinting}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Preview Pane */}
                {showPreviewPane && (
                    <div className="w-full md:w-[40%] flex-none flex flex-col h-full min-h-0 bg-card rounded-lg border border-border shadow-sm overflow-hidden z-10 transition-all">
                        <DocumentPreviewSection
                            showPreview={showPrintPreview || isPreviewing}
                            pdfUrl={pdfUrl}
                            activeDocTab={activeDocTab}
                            readOnly={false}
                            isPrinting={isPrinting}
                            isPreviewing={isPreviewing}
                            onPrint={handlePrint}
                            onPreview={handlePreview}
                            onClosePreview={onClosePrintPreview}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(DocumentsContainer);
