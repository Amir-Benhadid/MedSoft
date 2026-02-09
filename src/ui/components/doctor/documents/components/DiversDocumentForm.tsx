import { Printer } from 'lucide-react';
import React, { memo } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { cn } from '@/ui/lib/utils';
import medicalRecords from '../../documents/medical_records_structured.json';
import { useDocumentForm } from '../hooks/useDocumentForm';

interface DiversDocumentFormProps {
    onPrint: () => void;
    isPrinting: boolean;
}

const DiversDocumentForm: React.FC<DiversDocumentFormProps> = ({
    onPrint,
    isPrinting,
}) => {
    // Get form data from hook
    const {
        selectedDiversDocument,
        setSelectedDiversDocument,
        patient,
    } = useDocumentForm();
    return (
        <div className="flex flex-col h-full max-h-full overflow-hidden p-2 bg-card/50 rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex-shrink-0">
                Documents prédéfinis
            </h3>
            <p className="text-xs text-muted-foreground italic mb-3 flex-shrink-0">
                Sélectionnez un document à imprimer :
            </p>

            <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-2 pr-2">
                    {/* Document vierge */}
                    <Card
                        className={cn(
                            "w-full cursor-pointer transition-all",
                            selectedDiversDocument === 'documentVierge'
                                ? "border-2 border-primary bg-primary/10 shadow-sm"
                                : "border border-border hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedDiversDocument('documentVierge')}
                    >
                        <CardContent className="p-3">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    Document vierge
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Document avec en-tête patient uniquement
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical Records */}
                    {medicalRecords.map((record) => (
                        <Card
                            key={record.Code}
                            className={cn(
                                "w-full cursor-pointer transition-all",
                                selectedDiversDocument === record.Code
                                    ? "border-2 border-primary bg-primary/10 shadow-sm"
                                    : "border border-border hover:bg-muted/50"
                            )}
                            onClick={() => setSelectedDiversDocument(record.Code)}
                        >
                            <CardContent className="p-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {record.Code}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {record.Title} - {record.Description.substring(0, 80)}{record.Description.length > 80 ? '...' : ''}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            {/* Print button for selected document */}
            <div className="mt-3 flex justify-center flex-shrink-0">
                <Button
                    onClick={onPrint}
                    disabled={isPrinting || !patient}
                    className="text-xs px-6 py-2"
                >
                    <Printer className="w-4 h-4 mr-2" />
                    {isPrinting
                        ? 'Impression...'
                        : 'Imprimer le document sélectionné (F1)'}
                </Button>
            </div>

            {!patient && (
                <div className="mt-3 p-2 bg-warning/10 rounded-lg border border-warning/20 flex-shrink-0">
                    <p className="text-xs text-warning-foreground italic">
                        Un patient doit être sélectionné pour imprimer des documents.
                    </p>
                </div>
            )}
        </div>
    );
};

export default memo(DiversDocumentForm);
