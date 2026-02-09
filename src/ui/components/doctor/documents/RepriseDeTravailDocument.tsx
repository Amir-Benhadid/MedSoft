import React, { memo, useMemo, useCallback } from 'react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

import { cn } from '@/ui/lib/utils';
import { Button } from '@/ui/components/ui/button';
import { Calendar } from '@/ui/components/ui/calendar';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Label } from '@/ui/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/ui/components/ui/popover';

import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { useDocumentForm } from './hooks/useDocumentForm';

interface RepriseDeTravailDocumentProps {}

// PDF Generation Function
export const generateRepriseDeTravailPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: {
		dateReprise: string;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, "CERTIFICAT DE REPRISE DE TRAVAIL", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Description
	const descriptionText = `L'état de santé du(de la) sus-nommé(e) est consolidé et peut reprendre le travail à partir du: ${printData?.dateReprise || ''}`;
	const descriptionWidth = width - LEFT_MARGIN - RIGHT_MARGIN + 20;
	const descriptionLines = DocumentUtils.splitTextIntoLinesOptimized(
		descriptionText,
		descriptionWidth
	);

	descriptionLines.forEach((line) => {
		page.drawText(line, {
			x: LEFT_MARGIN + 20,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		y -= LINE_HEIGHTS.normal;
	});

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const RepriseDeTravailDocument: React.FC<RepriseDeTravailDocumentProps> = () => {
	// Get form data from hook
	const {
		patient,
		printMedicalRecordData,
		setPrintMedicalRecordData,
	} = useDocumentForm();

	// Initialize printData structure
	const printData = useMemo(() => ({
		dateReprise: printMedicalRecordData?.dateReprise || '',
	}), [printMedicalRecordData]);

	const setPrintData = useCallback((updater: any) => {
		if (typeof updater === 'function') {
			const newData = updater(printData);
			setPrintMedicalRecordData({ ...printMedicalRecordData, ...newData });
		} else {
			setPrintMedicalRecordData({ ...printMedicalRecordData, ...updater });
		}
	}, [printData, printMedicalRecordData, setPrintMedicalRecordData]);
	// Auto-populate with current date
	React.useEffect(() => {
		setPrintData(prev => {
			if (!prev.dateReprise) {
				return {
					...prev,
					dateReprise: format(new Date(), 'dd/MM/yyyy'),
				};
			}
			return prev;
		});
	}, []); // Only run on mount

	const handleDateSelect = (date: Date | undefined) => {
		if (!date) return;
		setPrintData(prev => ({
			...prev,
			dateReprise: format(date, 'dd/MM/yyyy'),
		}));
	};

	// Helper to parse the date string back to Date object for the Calendar
	const getDateObject = (dateString: string): Date | undefined => {
		if (!dateString) return undefined;
		try {
			// Check if it matches YYYY-MM-DD (fallback) or DD/MM/YYYY
			if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
				return parse(dateString, 'yyyy-MM-dd', new Date());
			}
			return parse(dateString, 'dd/MM/yyyy', new Date());
		} catch (e) {
			return undefined;
		}
	};

	const selectedDate = getDateObject(printData.dateReprise);

	return (
		<div className="space-y-4 font-sans text-sm pb-8">
			<div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
				<div className="max-w-xs space-y-1.5">
					<Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">
						Date de reprise
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className={cn(
									"w-full justify-start text-left font-bold text-slate-900 bg-white border-slate-200 h-9",
									!selectedDate && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
								{selectedDate ? (
									format(selectedDate, "PHP", { locale: fr })
								) : (
									<span className="font-normal text-slate-500">Choisir une date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={selectedDate}
								onSelect={(date) => handleDateSelect(date)}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</div>
	);
};

export default memo(RepriseDeTravailDocument);
