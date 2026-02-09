import React, { memo } from 'react';
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
import { cn } from '@/ui/lib/utils';
import { useDocumentForm } from './hooks/useDocumentForm';

interface ReponseHTADocumentProps {}

// PDF Generation Function
export const generateReponseHTAPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: {
		visualAcuityOD: string;
		visualAcuityOG: string;
		stadeRetinopathie: string;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	// Draw Title
	let y = drawTitle(context, "COMPTE RENDU", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Description
	const descriptionText = "Cher(e) confrère - Le(la) patient(e) aux ATCD de: HTA - Hypercholertérolémie- HyperTGD présente à l'examen:";
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
	y -= 15;

	// Bullets
	const bullets = [
		`Acuité visuelle = OD: ${printData?.visualAcuityOD || ''}, OG: ${printData?.visualAcuityOG || ''}`,
		"Tonus oculaire = normal",
		"Examen biomicroscopique du FO = NORMAL",
		`RETINOPATHIE HYPERTENSIVE STADE ${printData?.stadeRetinopathie || ''}`
	];

	bullets.forEach((bullet) => {
		const bulletWidth = width - LEFT_MARGIN - RIGHT_MARGIN + 20;
		const bulletLines = DocumentUtils.splitTextIntoLinesOptimized(
			bullet,
			bulletWidth
		);

		bulletLines.forEach((line) => {
			page.drawText(`- ${line}`, {
				x: LEFT_MARGIN + 20,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;
		});
	});

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const ReponseHTADocument: React.FC<ReponseHTADocumentProps> = () => {
	// Get form data from hook
	const {
		patient,
		rightEyeData,
		leftEyeData,
		printMedicalRecordData,
		setPrintMedicalRecordData,
	} = useDocumentForm();

	// Initialize printData structure if needed
	const printData = React.useMemo(() => ({
		visualAcuityOD: printMedicalRecordData?.visualAcuityOD || '',
		visualAcuityOG: printMedicalRecordData?.visualAcuityOG || '',
		stadeRetinopathie: printMedicalRecordData?.stadeRetinopathie || '',
	}), [printMedicalRecordData]);

	const setPrintData = React.useCallback((updater: any) => {
		if (typeof updater === 'function') {
			const newData = updater(printData);
			setPrintMedicalRecordData({ ...printMedicalRecordData, ...newData });
		} else {
			setPrintMedicalRecordData({ ...printMedicalRecordData, ...updater });
		}
	}, [printData, printMedicalRecordData, setPrintMedicalRecordData]);

	// Auto-populate from eye data
	React.useEffect(() => {
		const newVisualAcuityOD = rightEyeData?.visualAcuity || rightEyeData?.visualAcuityVL_SC || '';
		const newVisualAcuityOG = leftEyeData?.visualAcuity || leftEyeData?.visualAcuityVL_SC || '';

		// Only update if new values exist
		if (newVisualAcuityOD || newVisualAcuityOG) {
			setPrintData(prev => {
				const newData = {
					visualAcuityOD: prev.visualAcuityOD || newVisualAcuityOD,
					visualAcuityOG: prev.visualAcuityOG || newVisualAcuityOG,
					stadeRetinopathie: prev.stadeRetinopathie,
				};

				// Only update if values actually changed
				if (JSON.stringify(prev) === JSON.stringify(newData)) {
					return prev;
				}
				return newData;
			});
		}
	}, [rightEyeData?.visualAcuity, rightEyeData?.visualAcuityVL_SC, leftEyeData?.visualAcuity, leftEyeData?.visualAcuityVL_SC, setPrintData]);

	return (
		<div className="space-y-4 font-sans text-sm pb-8">
			<div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
				{/* Header */}
				<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
					<div className="p-1.5 bg-indigo-50 rounded-md">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
					</div>
					<div>
						<h4 className="font-bold text-slate-800 text-sm uppercase">REPONSE HTA</h4>
						<p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Compte rendu</p>
					</div>
				</div>

				<div className="bg-slate-50 p-3 rounded text-xs italic text-slate-600 border border-slate-200/60 leading-relaxed">
					Cher(e) confrère - Le(la) patient(e) aux ATCD de: HTA - Hypercholertérolémie- HyperTGD présente à l'examen:
				</div>

				<div className="space-y-4 pt-2">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Acuité visuelle OD</Label>
							<Input
								placeholder="ex: 10/10"
								value={printData?.visualAcuityOD || ''}
								onChange={(e) => setPrintData(prev => ({ ...prev, visualAcuityOD: e.target.value }))}
								className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Acuité visuelle OG</Label>
							<Input
								placeholder="ex: 10/10"
								value={printData?.visualAcuityOG || ''}
								onChange={(e) => setPrintData(prev => ({ ...prev, visualAcuityOG: e.target.value }))}
								className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Stade de rétinopathie</Label>
						<Select
							value={printData?.stadeRetinopathie || ''}
							onValueChange={(val) => setPrintData(prev => ({ ...prev, stadeRetinopathie: val }))}
						>
							<SelectTrigger className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200">
								<SelectValue placeholder="Sélectionner le stade..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Stade 1</SelectItem>
								<SelectItem value="2">Stade 2</SelectItem>
								<SelectItem value="3">Stade 3</SelectItem>
								<SelectItem value="4">Stade 4</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Preview Section */}
				<div className="pt-3 border-t border-slate-100">
					<div className="flex items-center gap-2 mb-2">
						<div className="p-1 bg-slate-100 rounded">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
						</div>
						<h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aperçu du contenu</h5>
					</div>

					<div className="space-y-1 pl-2 border-l-2 border-slate-200 ml-1">
						<p className="text-xs text-slate-600 flex items-center gap-2">
							<span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
							Acuité visuelle = OD: <span className="font-bold text-slate-800">{printData?.visualAcuityOD || '...'}</span>, OG: <span className="font-bold text-slate-800">{printData?.visualAcuityOG || '...'}</span>
						</p>
						<p className="text-xs text-slate-600 flex items-center gap-2">
							<span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
							Tonus oculaire = normal
						</p>
						<p className="text-xs text-slate-600 flex items-center gap-2">
							<span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
							Examen biomicroscopique du FO = NORMAL
						</p>
						<p className="text-xs text-slate-600 flex items-center gap-2">
							<span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
							RETINOPATHIE HYPERTENSIVE STADE <span className="font-bold text-slate-800">{printData?.stadeRetinopathie || '...'}</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(ReponseHTADocument);
