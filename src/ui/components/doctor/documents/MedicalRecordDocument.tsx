import React from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';

import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/ui/components/ui/select";
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Textarea } from '@/ui/components/ui/textarea';

// Types conforming to the new JSON structure
export interface MedicalRecordSchema {
	title: string;
	code: string;
	type: string;
	header?: string;
	body?: string;
	closing?: string;
	legal_note?: string;
	placeholders?: string[];
	exam?: {
		items: string[];
	};
	billing?: {
		codification: string;
		tariff_da: number;
	};
	indication?: string;
	conclusion?: string;
	notes?: string;
}

export interface MedicalRecordPrintData {
	[key: string]: string;
}

interface MedicalRecordDocumentProps {
	medicalRecord: MedicalRecordSchema;
	printData: MedicalRecordPrintData;
	setPrintData: React.Dispatch<React.SetStateAction<MedicalRecordPrintData>>;
	rightEyeData?: any;
	leftEyeData?: any;
	patient?: any;
}

// PDF Generation Constants
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TEXT_SIZES = {
	title: 11,
	sectionHeader: 10,
	normal: 10,
	small: 10,
	tiny: 10,
};
const LINE_HEIGHTS = {
	title: 20,
	sectionHeader: 16,
	normal: 15,
	small: 13,
	header: 18,
};


// PDF Generation Function
export const generateMedicalRecordPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	medicalRecord: MedicalRecordSchema,
	printData?: MedicalRecordPrintData
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	// Title code usually maps to what we want to display as main title, or we use the 'title' field
	// The new JSON has 'title' (e.g. "Bilan") and 'code' (e.g. "BILAN CARDIO VASCULAIRE")
	// Let's use the Code as the main title if it looks like a title, otherwise combine/use logical one.
	// For "Bilan", "BILAN CARDIO VASCULAIRE" is good.
	// For "Compte rendu", "REPONSE HTA" is good.
	const displayTitle = medicalRecord.code.toUpperCase();

	let y = drawTitle(context, displayTitle, drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	const drawWrappedText = (text: string, size: number = TEXT_SIZES.normal, font = helvetica, indent = 0) => {
		const processedText = DocumentUtils.processText(text, printData);
		const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN - indent + 20;
		const lines = DocumentUtils.splitTextIntoLinesOptimized(processedText, availableWidth);
		lines.forEach(line => {
			page.drawText(line, {
				x: LEFT_MARGIN + 20 + indent,
				y,
				size,
				font,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;
		});
	};

	// Header (Cher confrère...)
	if (medicalRecord.header) {
		drawWrappedText(medicalRecord.header);
		y -= 10;
	}

	// Body
	if (medicalRecord.body) {
		drawWrappedText(medicalRecord.body);
		y -= 10;
	}

	// Exam items
	if (medicalRecord.exam && medicalRecord.exam.items) {
		// y -= 5;
		medicalRecord.exam.items.forEach(item => {
			drawWrappedText(`- ${item}`, TEXT_SIZES.normal, helvetica, 10);
		});
		y -= 10;
	}

	// Specific fields mapping
	// Billing
	if (medicalRecord.billing) {
		y -= 10;
		const billingText = `Codification: ${medicalRecord.billing.codification}    Honoraires: ${medicalRecord.billing.tariff_da} DA`;
		drawWrappedText(billingText, TEXT_SIZES.small, helveticaBold);
		y -= 5;
	}

	// Indication (for CNAS mainly)
	if (medicalRecord.indication) {
		const indicationText = `Indication : ${DocumentUtils.processText(medicalRecord.indication, printData)}`;
		drawWrappedText(indicationText);
		y -= 10;
	}

	// Conclusion
	if (medicalRecord.conclusion) {
		y -= 5;
		drawWrappedText(`Conclusion: ${medicalRecord.conclusion}`, TEXT_SIZES.normal, helveticaBold);
		y -= 10;
	}

	// Notes
	if (medicalRecord.notes) {
		drawWrappedText(medicalRecord.notes, TEXT_SIZES.small, helvetica, 0);
		y -= 10;
	}

	// Legal Note
	if (medicalRecord.legal_note) {
		y -= 20; // Extra spacing for legal note at bottom usually, but flow is sequential here
		drawWrappedText(medicalRecord.legal_note, TEXT_SIZES.small, helvetica, 0);
	}

	// Closing
	if (medicalRecord.closing) {
		y -= 20;
		// Align closing to right or simplified block? Standard is usually just text.
		drawWrappedText(medicalRecord.closing);
	}

	// Signature area
	y -= 40;
	page.drawText("Le médecin", {
		x: width - RIGHT_MARGIN - 100,
		y,
		size: TEXT_SIZES.normal,
		font: helveticaBold,
		color: rgb(0, 0, 0),
	});

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const MedicalRecordDocument: React.FC<MedicalRecordDocumentProps> = ({
	medicalRecord,
	printData,
	setPrintData,
	rightEyeData,
	leftEyeData,
	patient,
}) => {
	// Handler for print data changes
	const handlePrintDataChange = (field: string) => (value: string) => {
		setPrintData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Effect to pre-fill data based on placeholders
	React.useEffect(() => {
		if (medicalRecord.placeholders) {
			const newData = { ...printData };
			let hasChanges = false;

			medicalRecord.placeholders.forEach(placeholder => {
				if (!newData[placeholder]) {
					// Auto-fill logic based on placeholder name
					if (placeholder === 'EyeData.visualAcuity_OD' && rightEyeData?.visualAcuityVL_SC) {
						// Prefer SC or AC? usually AC for reports unless specified
						newData[placeholder] = rightEyeData.visualAcuityVL_AC || rightEyeData.visualAcuityVL_SC || '';
						hasChanges = true;
					}
					else if (placeholder === 'EyeData.visualAcuity_OG' && leftEyeData?.visualAcuityVL_SC) {
						newData[placeholder] = leftEyeData.visualAcuityVL_AC || leftEyeData.visualAcuityVL_SC || '';
						hasChanges = true;
					}
					else if (placeholder === 'age' && patient?.dob) {
						newData[placeholder] = DocumentUtils.calculateAge(patient.dob).toString();
						hasChanges = true;
					}
					else if (placeholder === 'date_reprise') {
						const nextWeek = new Date();
						nextWeek.setDate(nextWeek.getDate() + 7);
						newData[placeholder] = nextWeek.toLocaleDateString('fr-FR');
						hasChanges = true;
					}
				}
			});

			if (hasChanges) {
				setPrintData(newData);
			}
		}
	}, [medicalRecord.placeholders, rightEyeData, leftEyeData, patient]);

	const getInputComponent = (placeholder: string) => {
		// Determine input type based on placeholder name
		const labelStr = placeholder.replace(/_/g, ' ').replace(/\./g, ' ');

		if (placeholder.includes('date')) {
			return (
				<Input
					type="date"
					value={printData[placeholder] || ''}
					onChange={(e) => handlePrintDataChange(placeholder)(e.target.value)}
					className="h-8 text-xs font-bold"
				/>
			);
		}

		if (placeholder.includes('stade') || placeholder.includes('number between')) {
			return (
				<Select
					value={printData[placeholder] || ''}
					onValueChange={(val) => handlePrintDataChange(placeholder)(val)}
				>
					<SelectTrigger className="h-8 text-xs font-bold">
						<SelectValue placeholder="Sélectionner..." />
					</SelectTrigger>
					<SelectContent>
						{[1, 2, 3, 4].map(num => (
							<SelectItem key={num} value={num.toString()}>{`Stade ${num}`}</SelectItem>
						))}
					</SelectContent>
				</Select>
			);
		}

		if (placeholder.includes('droit_gauche') || placeholder.includes('droite/gauche')) {
			return (
				<Select
					value={printData[placeholder] || ''}
					onValueChange={(val) => handlePrintDataChange(placeholder)(val)}
				>
					<SelectTrigger className="h-8 text-xs font-bold">
						<SelectValue placeholder="Côté..." />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Droit">Droit</SelectItem>
						<SelectItem value="Gauche">Gauche</SelectItem>
						<SelectItem value="Bilatéral">Bilatéral</SelectItem>
					</SelectContent>
				</Select>
			);
		}

		// Default Text Input
		return (
			<Input
				value={printData[placeholder] || ''}
				onChange={(e) => handlePrintDataChange(placeholder)(e.target.value)}
				placeholder={`Saisir ${labelStr}...`}
				className="h-8 text-xs font-bold"
			/>
		);
	};

	return (
		<div className="space-y-4 font-sans text-sm pb-8">
			<div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
				<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
					<div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
						<span className="font-bold text-[10px] text-indigo-700 text-center leading-none px-0.5">
							{medicalRecord.code.substring(0, 4)}
						</span>
					</div>
					<div>
						<h4 className="font-bold text-slate-800 text-sm">{medicalRecord.title}</h4>
						<p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{medicalRecord.code}</p>
					</div>
				</div>

				{/* Preview of body text with highlighting placeholders could be cool, but simple inputs for now */}
				<div className="space-y-4 pt-2">
					{medicalRecord.placeholders && medicalRecord.placeholders.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{medicalRecord.placeholders.map((placeholder) => (
								<div key={placeholder} className="space-y-1">
									<Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5 block">
										{placeholder.replace(/_/g, ' ')}
									</Label>
									{getInputComponent(placeholder)}
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-6 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
							<p className="text-xs font-medium">Aucun champ manuel à remplir</p>
							<p className="text-[10px] text-slate-400">Ce document est prêt à être imprimé</p>
						</div>
					)}
				</div>
			</div>

			{/* Preview Box - Simple text representation */}
			<div className="bg-slate-50/50 rounded-lg p-3 border border-slate-200/60 shadow-sm">
				<h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200/50 pb-1">
					Aperçu du contenu
				</h4>
				<div className="text-xs text-slate-600 leading-relaxed space-y-2 font-serif">
					{medicalRecord.header && <p>{DocumentUtils.processText(medicalRecord.header, printData)}</p>}
					{medicalRecord.body && <p>{DocumentUtils.processText(medicalRecord.body, printData)}</p>}
					{medicalRecord.exam && (
						<ul className="list-disc pl-4 space-y-1">
							{medicalRecord.exam.items.map((item, i) => (
								<li key={i}>{DocumentUtils.processText(item, printData)}</li>
							))}
						</ul>
					)}
					{medicalRecord.conclusion && <p className="font-bold">{medicalRecord.conclusion}</p>}
					{medicalRecord.legal_note && <p className="italic text-[10px]">{medicalRecord.legal_note}</p>}
				</div>
			</div>
		</div>
	);
};

export default MedicalRecordDocument;
