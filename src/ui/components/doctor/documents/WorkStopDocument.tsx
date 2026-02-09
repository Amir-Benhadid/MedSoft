import React, { memo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

import { cn } from '@/ui/lib/utils';
import { Button } from '@/ui/components/ui/button';
import { Calendar } from '@/ui/components/ui/calendar';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { useDocumentForm } from './hooks/useDocumentForm';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/ui/components/ui/popover';

import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';

// Types
interface WorkStopData {
	startDate: Date;
	endDate: Date;
	exitAuthorized: boolean;
}

interface WorkStopPrintData {
	startDate: Date;
	endDate: Date;
	exitAuthorized: boolean;
}

interface WorkStopDocumentProps { }

// PDF Generation Constants
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TEXT_SIZES = {
	title: 16,
	sectionHeader: 12,
	normal: 11,
	small: 8,
};
const LINE_HEIGHTS = {
	title: 20,
	sectionHeader: 16,
	normal: 15,
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

const numberToFrenchWords = (num: number): string => {
	const ones = [
		'',
		'un',
		'deux',
		'trois',
		'quatre',
		'cinq',
		'six',
		'sept',
		'huit',
		'neuf',
	];
	const teens = [
		'dix',
		'onze',
		'douze',
		'treize',
		'quatorze',
		'quinze',
		'seize',
		'dix-sept',
		'dix-huit',
		'dix-neuf',
	];
	const tens = [
		'',
		'',
		'vingt',
		'trente',
		'quarante',
		'cinquante',
		'soixante',
		'soixante',
		'quatre-vingt',
		'quatre-vingt',
	];

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
	return num.toString(); // Fallback for numbers >= 100
};

// PDF Generation Function (kept logic intact)
export const generateWorkStopPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: WorkStopPrintData
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, 'ARRÊT DE TRAVAIL', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	const workStopText =
		'Je certifie que le(a) patient(e) sus-nommé(e) présente un état oculaire nécessitant un arrêt de travail';
	const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
	const workStopLines = splitTextIntoLinesOptimized(
		workStopText,
		availableWidth
	);

	workStopLines.forEach((line) => {
		page.drawText(line, {
			x: LEFT_MARGIN + 20,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		y -= LINE_HEIGHTS.normal;
	});
	y -= 10;

	if (printData) {
		const startDate = new Date(printData.startDate);
		const endDate = new Date(printData.endDate);
		const durationMs = endDate.getTime() - startDate.getTime();
		const durationDays =
			Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;

		page.drawText('De:', {
			x: LEFT_MARGIN + 20,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		const durationText = `${numberToFrenchWords(
			durationDays
		)} ( ${durationDays.toString().padStart(2, '0')} ) jours`;
		page.drawText(durationText, {
			x: LEFT_MARGIN + 45,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		y -= LINE_HEIGHTS.header;

		page.drawText('À compter du:', {
			x: LEFT_MARGIN + 20,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		page.drawText(printData.startDate.toLocaleDateString('fr-FR'), {
			x: LEFT_MARGIN + 100,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		y -= LINE_HEIGHTS.header;

		const exitText =
			printData.exitAuthorized !== undefined
				? printData.exitAuthorized
					? 'Sortie autorisée'
					: 'Sortie non-autorisée'
				: 'Sortie autorisée';

		page.drawText(exitText, {
			x: LEFT_MARGIN + 20,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		y -= LINE_HEIGHTS.normal;
	}

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const WorkStopDocument: React.FC<WorkStopDocumentProps> = () => {
	// Get form data from hook
	const {
		workStopData,
		setWorkStopData,
		printWorkStopData: printData,
		setPrintWorkStopData: setPrintData,
	} = useDocumentForm();
	// Calculate number of days between start and end date
	const calculateDays = (start: Date, end: Date): number => {
		const durationMs = end.getTime() - start.getTime();
		return Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
	};

	// Calculate end date from start date and number of days
	const calculateEndDate = (start: Date, days: number): Date => {
		const endDate = new Date(start);
		endDate.setDate(start.getDate() + days - 1); // -1 because we include both start and end dates
		return endDate;
	};

	// State for number of days - use string to allow empty input
	const [numberOfDays, setNumberOfDays] = React.useState<string>(() =>
		calculateDays(workStopData.startDate, workStopData.endDate).toString()
	);

	// Initialize print data on mount
	React.useEffect(() => {
		// Only set initial value if printData is empty and we have workStopData
		if (!printData.startDate && workStopData.startDate) {
			const startDate = workStopData.startDate instanceof Date ? workStopData.startDate : new Date(workStopData.startDate);
			const endDate = workStopData.endDate instanceof Date ? workStopData.endDate : new Date(workStopData.endDate);

			setPrintData({
				startDate,
				endDate,
				exitAuthorized: workStopData.exitAuthorized ?? true,
			});
			setNumberOfDays(calculateDays(startDate, endDate).toString());
		} else if (printData.startDate && printData.endDate) {
			// If we already have printData, ensure days input is in sync
			setNumberOfDays(calculateDays(printData.startDate, printData.endDate).toString());
		}
	}, []); // Run once on mount

	// Update number of days when printData dates change
	React.useEffect(() => {
		if (printData.startDate && printData.endDate) {
			const days = calculateDays(printData.startDate, printData.endDate);
			// Only update if different to avoid loop with input
			if (days.toString() !== numberOfDays && document.activeElement?.id !== 'days-input') {
				setNumberOfDays(days.toString());
			}
		}
	}, [printData.startDate, printData.endDate]);

	const handleStartDateSelect = (date: Date | undefined) => {
		const newDate = date || new Date();
		setPrintData((prev) => ({
			...prev,
			startDate: newDate,
		}));


		// Recalculate end date based on current number of days
		const days = parseInt(numberOfDays);
		if (!isNaN(days) && days > 0) {
			const startDate = newDate || new Date();
			const newEndDate = calculateEndDate(startDate, days);
			setPrintData((prev) => ({
				...prev,
				endDate: newEndDate,
			}));
			setWorkStopData((prev) => ({
				...prev,
				endDate: newEndDate,
			}));
		}
	};

	const handleEndDateSelect = (date: Date | undefined) => {
		const newDate = date || new Date();
		// Ensure end date is not before start date
		const startDate = printData.startDate || new Date();
		if (newDate < startDate) return;

		setPrintData((prev) => ({
			...prev,
			endDate: newDate,
		}));

		const days = calculateDays(startDate, newDate);
		setNumberOfDays(days.toString());
	};

	const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setNumberOfDays(inputValue);

		const days = parseInt(inputValue);
		if (!isNaN(days) && days > 0) {
			const startDate = printData.startDate || new Date();
			const newEndDate = calculateEndDate(startDate, days);
			setPrintData((prev) => ({
				...prev,
				endDate: newEndDate,
			}));
		}
	};

	return (
		<div className="space-y-3 font-sans text-sm pb-4">
			<div className="bg-card rounded-xl p-3 border border-border shadow-sm space-y-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Start Date */}
					<div className="flex flex-col space-y-1">
						<Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">Date de début</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-full justify-start text-left text-sm font-semibold text-foreground bg-background border-border h-7",
										!printData.startDate && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
									{printData.startDate ? (
										format(printData.startDate, "PPP", { locale: fr })
									) : (
										<span className="font-normal text-slate-500">Choisir une date</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={printData.startDate}
									onSelect={handleStartDateSelect}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>

					{/* Number of Days */}
					<div className="flex flex-col space-y-1">
						<Label htmlFor="days-input" className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">Nombre de jours</Label>
						<Input
							id="days-input"
							type="number"
							min={1}
							max={365}
							value={numberOfDays}
							onChange={handleDaysChange}
							className="h-7 text-sm font-semibold text-foreground bg-background border-border focus:border-primary focus:ring-primary/20"
						/>
					</div>
				</div>

				{/* End Date */}
				<div className="flex flex-col space-y-1">
					<Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">Date de fin (calculée automatiquement)</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className={cn(
									"w-full justify-start text-left text-sm font-semibold text-foreground bg-background border-border h-7",
									!printData.endDate && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
								{printData.endDate ? (
									format(printData.endDate, "PPP", { locale: fr })
								) : (
									<span className="font-normal text-muted-foreground">Choisir une date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={printData.endDate}
								onSelect={handleEndDateSelect}
								disabled={(date) => date < (printData.startDate || new Date())}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{/* Exit Authorized Checkbox */}
			<div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center space-x-2">
				<Checkbox
					id="exit-authorized"
					checked={printData.exitAuthorized}
					onCheckedChange={(checked) => {
						const newValue = checked === true;
						setPrintData((prev) => ({
							...prev,
							exitAuthorized: newValue,
						}));
					}}
					className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
				/>
				<Label htmlFor="exit-authorized" className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">
					Sortie autorisée
				</Label>
			</div>
		</div>
	);
};

export default memo(WorkStopDocument);
