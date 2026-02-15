import React from 'react';
import { Button } from '@/ui/components/ui/button';
import { ChevronRight, ChevronLeft, FileText, CalendarIcon } from 'lucide-react';
import { cn } from '@/ui/lib/utils';
import { DocumentTabs, TabItem } from './DocumentTabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/ui/popover';
import { Calendar } from '@/ui/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WorkStopData, WorkStopPrintData } from '../types';

interface DocumentToolbarProps {
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    tabs: TabItem[];
    activeTab: string;
    onTabClick: (tab: TabItem) => void;
    showPreviewPane: boolean;
    setShowPreviewPane: (show: boolean) => void;
    absenceData?: { date: Date; reason: string };
    setAbsenceData?: React.Dispatch<React.SetStateAction<{ date: Date; reason: string }>>;
    printAbsenceData?: { consultationDate: Date };
    setPrintAbsenceData?: React.Dispatch<React.SetStateAction<{ consultationDate: Date }>>;
    workStopData?: WorkStopData;
    setWorkStopData?: React.Dispatch<React.SetStateAction<WorkStopData>>;
    printWorkStopData?: WorkStopPrintData;
    setPrintWorkStopData?: React.Dispatch<React.SetStateAction<WorkStopPrintData>>;
}

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
    page,
    setPage,
    tabs,
    activeTab,
    onTabClick,
    showPreviewPane,
    setShowPreviewPane,
    absenceData,
    setAbsenceData,
    printAbsenceData,
    setPrintAbsenceData,
    workStopData,
    setWorkStopData,
    printWorkStopData,
    setPrintWorkStopData,
}) => {
    const handleAbsenceDateSelect = (date: Date | undefined) => {
        const newDate = date || new Date();
        if (setAbsenceData) {
            setAbsenceData(prev => ({ ...prev, date: newDate }));
        }
        if (setPrintAbsenceData) {
            setPrintAbsenceData({ consultationDate: newDate });
        }
    };

    const handleWorkStopStartDateSelect = (date: Date | undefined) => {
        const newDate = date || new Date();
        if (setWorkStopData && workStopData) {
            setWorkStopData(prev => ({ ...prev, startDate: newDate }));
        }
        if (setPrintWorkStopData && printWorkStopData) {
            setPrintWorkStopData(prev => ({ ...prev, startDate: newDate }));
        }
    };

    const handleWorkStopEndDateSelect = (date: Date | undefined) => {
        const newDate = date || new Date();
        if (setWorkStopData && workStopData) {
            setWorkStopData(prev => ({ ...prev, endDate: newDate }));
        }
        if (setPrintWorkStopData && printWorkStopData) {
            setPrintWorkStopData(prev => ({ ...prev, endDate: newDate }));
        }
    };

    return (
        <div
            className="flex-none border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center justify-between gap-2"
            style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}
        >
            <div className="flex-1 flex items-center justify-between min-w-0 mr-2">
                {/* Pagination Controls */}
                <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1 mr-2 border border-border/50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => setPage((p) => Math.min(1, p + 1))}
                        disabled={page === 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Tabs Grid */}
                <DocumentTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabClick={onTabClick}
                    page={page}
                />

                {/* Date Inputs removed as per request */}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 pl-3 border-l border-border/50">
                <Button
                    size="sm"
                    variant={showPreviewPane ? "default" : "ghost"}
                    className={cn(
                        "h-7 w-7 p-0 rounded-lg transition-all",
                        showPreviewPane ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    onClick={() => setShowPreviewPane(!showPreviewPane)}
                    title="Aperçu"
                >
                    <FileText className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
