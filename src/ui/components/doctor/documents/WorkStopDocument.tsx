import React from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';
import { OptimizedInput } from '@/ui/components/ui/optimized-input';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Label } from '@/ui/components/ui/label';
import { Button } from '@/ui/components/ui/button';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { WorkStopPrintData, WorkStopData } from './types'; // Need to add these to types
import { format, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react"
import { cn } from "@/ui/lib/utils"
import { Calendar } from "@/ui/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/ui/components/ui/popover"
import { Card } from '@/ui/components/ui/card';

// Types (to be moved to types.ts later)
// interface WorkStopPrintData {
//     startDate: Date;
//     endDate: Date;
//     exitAuthorized: boolean;
// }

// Helper for numbers to text
const numberToFrenchWords = (num: number): string => {
    const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

    if (num === 0) return 'zéro';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const one = num % 10;
        if (ten === 7) return 'soixante-' + teens[one];
        if (ten === 9) return 'quatre-vingt-' + teens[one];
        return tens[ten] + (one > 0 ? '-' + ones[one] : '');
    }
    return num.toString();
};

export const generateWorkStopPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    printData?: WorkStopPrintData
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

    let y = drawTitle(context, 'ARRÊT DE TRAVAIL', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    const workStopText = 'Je certifie que le(a) patient(e) sus-nommé(e) présente un état oculaire nécessitant un arrêt de travail';
    DocumentUtils.splitTextIntoLinesOptimized(workStopText, width - LEFT_MARGIN - RIGHT_MARGIN).forEach((line) => {
        page.drawText(line, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
        y -= LINE_HEIGHTS.normal;
    });
    y -= 10;

    if (printData && printData.startDate && printData.endDate) {
        const startDate = new Date(printData.startDate);
        const endDate = new Date(printData.endDate);
        // Ensure dates are valid
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const durationDays = differenceInDays(endDate, startDate) + 1;

            page.drawText('De:', { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            const durationText = `${numberToFrenchWords(durationDays)} ( ${durationDays.toString().padStart(2, '0')} ) jours`;
            page.drawText(durationText, { x: LEFT_MARGIN + 45, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.header;

            page.drawText('À compter du:', { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText(format(startDate, 'dd/MM/yyyy'), { x: LEFT_MARGIN + 100, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.header;

            const exitText = printData.exitAuthorized ? 'Sortie autorisée' : 'Sortie non-autorisée';
            page.drawText(exitText, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;
        }
    }
    return await context.pdfDoc.save();
}

const DEFAULT_WORKSTOP_OVERRIDES = {
    startDate: new Date(),
    endDate: new Date(),
    exitAuthorized: true
};

const WorkStopDocument: React.FC = () => {
    const overrides = useConsultationStore(state => state.documentOverrides.workStop || DEFAULT_WORKSTOP_OVERRIDES);

    const updateOverride = useConsultationStore(state => state.updateDocumentOverride);

    // Derived days for display
    const days = (overrides.startDate && overrides.endDate)
        ? (differenceInDays(new Date(overrides.endDate), new Date(overrides.startDate)) + 1).toString()
        : '1';

    const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
        if (!date) return;

        if (field === 'startDate') {
            const numDays = parseInt(days) || 1;
            const newEndDate = addDays(date, numDays - 1);
            updateOverride('workStop', 'startDate', date);
            updateOverride('workStop', 'endDate', newEndDate);
        } else {
            updateOverride('workStop', 'endDate', date);
        }
    };

    const handleDaysChange = (val: string) => {
        const num = parseInt(val);
        if (!isNaN(num) && num > 0 && overrides.startDate) {
            const newEndDate = addDays(new Date(overrides.startDate), num - 1);
            updateOverride('workStop', 'endDate', newEndDate);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-6">
            <Card>
                <div className="p-6 space-y-6">
                    <div className="border-b pb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Détails de l'arrêt de travail
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Configurez la durée et les dates de l'arrêt.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 flex flex-col">
                            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date de début</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-10",
                                            !overrides.startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {overrides.startDate ? format(new Date(overrides.startDate), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={overrides.startDate ? new Date(overrides.startDate) : undefined}
                                        onSelect={(d) => handleDateChange('startDate', d)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Durée (Jours)</Label>
                            <OptimizedInput
                                type="number"
                                value={days}
                                onChange={handleDaysChange}
                                min={1}
                                className="h-10 text-lg font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date de fin (inclus)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10 bg-slate-50",
                                        !overrides.endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {overrides.endDate ? format(new Date(overrides.endDate), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={overrides.endDate ? new Date(overrides.endDate) : undefined}
                                    onSelect={(d) => handleDateChange('endDate', d)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t">
                        <Checkbox
                            id="exit"
                            checked={overrides.exitAuthorized !== false}
                            onCheckedChange={(c) => updateOverride('workStop', 'exitAuthorized', c as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="exit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Sortie autorisée
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Cochez si le patient est autorisé à sortir durant son arrêt.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default WorkStopDocument;
