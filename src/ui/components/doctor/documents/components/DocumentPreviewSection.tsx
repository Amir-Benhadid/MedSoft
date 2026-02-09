/**
 * DocumentPreviewSection Component
 * 
 * Provides a preview pane for medical documents with print and preview functionality.
 * Handles PDF preview display and document preview rendering.
 * 
 * @module DocumentPreviewSection
 */

import React, { memo } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import DocumentPreview from '../DocumentPreview';
import { useDocumentPreview } from '../hooks/useDocumentPreview';
import { useConsultationStore } from '@/ui/store/consultationStore';

interface DocumentPreviewSectionProps {
    showPreview: boolean;
    pdfUrl: string | null;
    activeDocTab: string;
    readOnly?: boolean;
    isPrinting: boolean;
    isPreviewing: boolean;
    onPrint: () => void;
    onPreview: () => void;
    onClosePreview: () => void;
}

/**
 * DocumentPreviewSection component implementation
 * 
 * @param props - Component props
 * @returns JSX element
 */
const DocumentPreviewSection: React.FC<DocumentPreviewSectionProps> = ({
    showPreview,
    pdfUrl,
    activeDocTab,
    readOnly,
    isPrinting,
    isPreviewing,
    onPrint,
    onPreview,
    onClosePreview,
}) => {
    // Get preview data from hook
    const previewData = useDocumentPreview({ activeDocTab });
    const patient = useConsultationStore(state => state.patient);


    return (
        <Card className="h-full flex flex-col border border-border bg-card shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="flex-none pb-2 px-4 pt-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold">
                        {showPreview ? 'Aperçu PDF' : 'Aperçu du document'}
                    </CardTitle>
                    {patient && !readOnly && (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onPrint}
                                disabled={isPrinting}
                                className="text-xs h-7 px-3 border-border hover:bg-muted"
                            >
                                {isPrinting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        <span className="hidden sm:inline">Impression...</span>
                                    </>
                                ) : (
                                    <>
                                        <Printer className="w-3.5 h-3.5 mr-1.5" />
                                        <span className="hidden sm:inline">Imprimer</span>
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={onPreview}
                                disabled={isPreviewing}
                                className="text-xs h-7 px-3 shadow-sm"
                            >
                                {isPreviewing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        <span className="hidden sm:inline">Génération...</span>
                                    </>
                                ) : (
                                    <>
                                        <Printer className="w-3.5 h-3.5 mr-1.5" />
                                        <span className="hidden sm:inline">Aperçu PDF</span>
                                    </>
                                )}
                            </Button>
                            {showPreview && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onClosePreview}
                                    className="text-xs h-7 px-3 hover:bg-muted"
                                >
                                    Fermer
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                    {showPreview && pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full border-0"
                            title="PDF Preview"
                        />
                    ) : (
                        <DocumentPreview activeDocTab={activeDocTab} />
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default memo(DocumentPreviewSection);
