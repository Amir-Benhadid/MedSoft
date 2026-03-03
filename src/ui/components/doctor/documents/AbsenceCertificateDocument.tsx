import React, { memo, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

import { cn } from '@/ui/lib/utils';
import { Button } from '@/ui/components/ui/button';
import { Calendar } from '@/ui/components/ui/calendar';
import { Label } from '@/ui/components/ui/label';
import { useDocumentForm } from './hooks/useDocumentForm';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/ui/components/ui/popover';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';

// Types
interface AbsenceData {
	consultationDate: Date;
}

interface AbsencePrintData {
	consultationDate: Date;
}

interface AbsenceCertificateDocumentProps { }

// PDF Generation Constants
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TEXT_SIZES = {
	title: 11,
	sectionHeader: 10,
	normal: 10,
	small: 10,
};
const LINE_HEIGHTS = {
	title: 20,
	sectionHeader: 16,
	normal: 14,
	small: 12,
	header: 18,
};

// Helper functions (kept same as original)
const splitTextIntoLines = (text: string, maxCharsPerLine: number): string[] => {
	const words = text.split(' ');
	const lines: string[] = [];
	let current = '';

	words.forEach((word) => {
		if ((current + word).length <= maxCharsPerLine) {
			current += (current ? ' ' : '') + word;
		} else {
			if (current) lines.push(current);
			current = word;
		}
	});
	if (current) lines.push(current);
	return lines;
};

const splitTextIntoLinesOptimized = (
	text: string,
	availableWidth: number
) => {
	const maxChars = Math.floor(availableWidth / 6);
	return splitTextIntoLines(text, maxChars);
};

// PDF Generation Function (kept logic intact)
export const generateAbsenceCertificatePDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: AbsencePrintData
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, "JUSTIFICATION D'ABSENCE", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	const today = new Date();
	const consultationDate = printData?.consultationDate || today;
	const isToday = consultationDate.toDateString() === today.toDateString();

	let absenceText;
	if (isToday) {
		absenceText = "Je soussignée certifie que le(a) sus-nommé(e) s'est présenté(e) à notre consultation ce jour pour un problème ophthalmologique.";
	} else {
		const dateInLetters = consultationDate.toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		absenceText = `Je soussignée certifie que le(a) sus-nommé(e) s'est présenté(e) à notre consultation le ${dateInLetters} pour un problème ophthalmologique.`;
	}

	const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
	const absenceLines = splitTextIntoLinesOptimized(
		absenceText,
		availableWidth
	);

	absenceLines.forEach((line) => {
		page.drawText(line, {
			x: LEFT_MARGIN,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		y -= LINE_HEIGHTS.normal;
	});

	y -= 5;

	page.drawText('Certificat justifiant son absence.', {
		x: LEFT_MARGIN,
		y,
		size: TEXT_SIZES.normal,
		font: helvetica,
		color: rgb(0, 0, 0),
	});
	y -= LINE_HEIGHTS.header;

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const AbsenceCertificateDocument: React.FC<AbsenceCertificateDocumentProps> = () => {
	// Get form data from hook
	const {
		absenceData: absenceDataFromHook,
		setAbsenceData: setAbsenceDataFromHook,
		printAbsenceData: printData,
		setPrintAbsenceData: setPrintData,
	} = useDocumentForm();

	// Initialize print data on mount from parent data if needed, but don't overwrite if user has changed it
	// We rely on printData as the source of truth for the document
	React.useEffect(() => {
		// Only set initial value if printData is empty and we have absenceData
		if (!printData.consultationDate && absenceDataFromHook.date) {
			setPrintData({
				consultationDate: absenceDataFromHook.date instanceof Date
					? absenceDataFromHook.date
					: new Date(absenceDataFromHook.date),
			});
		}
	}, []); // Run once on mount

	const handleDateSelect = (date: Date | undefined) => {
		const newDate = date || new Date();
		setPrintData((prev) => ({
			...prev,
			consultationDate: newDate,
		}));
	};

	return (
		<div className="space-y-3 font-sans text-sm pb-4">
			<div className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<div className="max-w-xs space-y-1">
					<Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">
						Date de consultation
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className={cn(
									"w-full justify-start text-left text-sm font-semibold text-foreground bg-background border-border h-7",
									!printData.consultationDate && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
								{printData.consultationDate ? (
									format(printData.consultationDate, "PPP", { locale: fr })
								) : (
									<span className="font-normal text-muted-foreground">Choisir une date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={printData.consultationDate}
								onSelect={handleDateSelect}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</div>
	);
};

export default memo(AbsenceCertificateDocument);
