import React, { memo, useMemo, useCallback } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { Label } from '@/ui/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/ui/components/ui/select";
import { cn } from '@/ui/lib/utils';
import { useDocumentForm } from './hooks/useDocumentForm';

interface CTFLaserArgonDocumentProps {}

// PDF Generation Function
export const generateCTFLaserArgonPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: {
		oeilAffecte: string;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, "COMPTE RENDU", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Description
	const descriptionText = `Le(la) sus-nommé(e) présente une photocoagulation au LASER ARGON pour: rétinopathie diabétique proliférante de l'œil ${printData?.oeilAffecte || ''}, Codification K80`;
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
const CTFLaserArgonDocument: React.FC<CTFLaserArgonDocumentProps> = () => {
	// Get form data from hook
	const {
		patient,
		printMedicalRecordData,
		setPrintMedicalRecordData,
	} = useDocumentForm();

	// Initialize printData structure
	const printData = useMemo(() => ({
		oeilAffecte: printMedicalRecordData?.oeilAffecte || '',
	}), [printMedicalRecordData]);

	const setPrintData = useCallback((updater: any) => {
		if (typeof updater === 'function') {
			const newData = updater(printData);
			setPrintMedicalRecordData({ ...printMedicalRecordData, ...newData });
		} else {
			setPrintMedicalRecordData({ ...printMedicalRecordData, ...updater });
		}
	}, [printData, printMedicalRecordData, setPrintMedicalRecordData]);
	return (
		<div className="space-y-4 font-sans text-sm pb-8">
			<div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
				{/* Header */}
				<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
					<div className="p-1.5 bg-indigo-50 rounded-md">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
					</div>
					<div>
						<h4 className="font-bold text-slate-800 text-sm uppercase">CTF (LASER ARGON)</h4>
						<p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Compte rendu</p>
					</div>
				</div>

				<div className="bg-slate-50 p-3 rounded text-xs italic text-slate-600 border border-slate-200/60 leading-relaxed">
					Le(la) sus-nommé(e) présente une photocoagulation au LASER ARGON pour: rétinopathie diabétique proliférante de l'œil {printData?.oeilAffecte || '...'}, Codification K80
				</div>

				<div className="space-y-4 pt-2">
					<div className="space-y-1.5 max-w-xs">
						<Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Œil affecté</Label>
						<Select
							value={printData?.oeilAffecte || ''}
							onValueChange={(val) => setPrintData(prev => ({ ...prev, oeilAffecte: val }))}
						>
							<SelectTrigger className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200">
								<SelectValue placeholder="Sélectionner l'œil..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="droit">Droit</SelectItem>
								<SelectItem value="gauche">Gauche</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(CTFLaserArgonDocument);
