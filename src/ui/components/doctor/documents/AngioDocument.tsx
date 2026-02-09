import React, { memo, useMemo, useCallback } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Card } from '@/ui/components/ui/card';
import { useDocumentForm } from './hooks/useDocumentForm';

interface AngioDocumentProps {}

// PDF Generation Function
export const generateAngioPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: {
		age: string;
		antecedents: string;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, "LETTRE D'ORIENTATION", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Description
	const descriptionText = `Cher(e) confrère, je vous adresse le(la) sus-nommé(e) pour angiographie - âgé(e) de ${printData?.age || ''} aux antécédents de: ${printData?.antecedents || ''}.`;
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
const AngioDocument: React.FC<AngioDocumentProps> = () => {
	// Get form data from hook
	const {
		patient,
		printMedicalRecordData,
		setPrintMedicalRecordData,
	} = useDocumentForm();

	// Initialize printData structure
	const printData = useMemo(() => ({
		age: printMedicalRecordData?.age || '',
		antecedents: printMedicalRecordData?.antecedents || '',
	}), [printMedicalRecordData]);

	const setPrintData = useCallback((updater: any) => {
		if (typeof updater === 'function') {
			const newData = updater(printData);
			setPrintMedicalRecordData({ ...printMedicalRecordData, ...newData });
		} else {
			setPrintMedicalRecordData({ ...printMedicalRecordData, ...updater });
		}
	}, [printData, printMedicalRecordData, setPrintMedicalRecordData]);

	// Auto-populate age from patient DOB
	React.useEffect(() => {
		if (patient?.dob) {
			const age = DocumentUtils.calculateAge(patient.dob);
			setPrintData(prev => {
				if (!prev.age) {
					return {
						...prev,
						age: age.toString(),
					};
				}
				return prev;
			});
		}
	}, [patient?.dob]);

	return (
		<div className="space-y-4 font-sans text-sm pb-8">
			<div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
				<div className="flex items-center justify-between border-b border-slate-100 pb-3">
					<div>
						<h4 className="font-bold text-slate-800 text-sm">ANGIOGRAPHIE</h4>
						<p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Lettre d'orientation</p>
					</div>
				</div>

				<div className="bg-slate-50 p-3 rounded text-xs italic text-slate-600 border border-slate-200/60 leading-relaxed">
					Cher(e) confrère, je vous adresse le(la) sus-nommé(e) pour angiographie - âgé(e) de {printData.age} aux antécédents de: {printData.antecedents}.
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
					<div className="space-y-1.5">
						<Label htmlFor="age" className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Âge</Label>
						<Input
							id="age"
							value={printData.age}
							onChange={(e) => setPrintData(prev => ({ ...prev, age: e.target.value }))}
							className="h-8 font-bold text-slate-900 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-200"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="antecedents" className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Antécédents</Label>
						<Input
							id="antecedents"
							value={printData.antecedents}
							onChange={(e) => setPrintData(prev => ({ ...prev, antecedents: e.target.value }))}
							className="h-8 font-bold text-slate-900 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-200"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(AngioDocument);
