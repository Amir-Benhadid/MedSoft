import React, { memo, useMemo, useCallback } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Label } from '@/ui/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { useDocumentForm } from './hooks/useDocumentForm';

interface AvisORLDCCDocumentProps {}

// PDF Generation Function
export const generateAvisORLDCCPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: {
		cote: string;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;
	
	let y = drawTitle(context, "LETTRE D'ORIENTATION", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));
    
	// Description
	const descriptionText = `Le(la) sus-nommé(e) présente à l'examen du jour une dacryocystite chronique ${printData?.cote || ''} à lavage des voies lacrymales non perméable pour avis prise en charge d'une cause à ce larmoiement et cas échéant un avis pré-opératoire`;
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
const AvisORLDCCDocument: React.FC<AvisORLDCCDocumentProps> = () => {
	// Get form data from hook
	const {
		patient,
		printMedicalRecordData,
		setPrintMedicalRecordData,
	} = useDocumentForm();

	// Initialize printData structure
	const printData = useMemo(() => ({
		cote: printMedicalRecordData?.cote || '',
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
		<div className="p-2 space-y-3">
			<Card className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<CardContent className="p-0 space-y-2">
					<h3 className="text-sm font-semibold text-foreground">
						AVIS ORL DCC
					</h3>
					<p className="text-xs text-muted-foreground">
						Lettre d'orientation
					</p>
					<p className="text-xs text-muted-foreground italic">
						Le(la) sus-nommé(e) présente à l'examen du jour une dacryocystite chronique {printData.cote} à lavage des voies lacrymales non perméable pour avis prise en charge d'une cause à ce larmoiement et cas échéant un avis pré-opératoire
					</p>
				</CardContent>
			</Card>

			<Card className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<CardContent className="p-0 space-y-3">
					<h4 className="text-sm font-semibold text-foreground">
						Champs à remplir:
					</h4>
					<div className="space-y-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Côté</Label>
							<Select
								value={printData.cote}
								onValueChange={(value) => setPrintData(prev => ({ ...prev, cote: value }))}
							>
								<SelectTrigger className="h-8 text-sm">
									<SelectValue placeholder="Sélectionner un côté" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="droite">Droite</SelectItem>
									<SelectItem value="gauche">Gauche</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default memo(AvisORLDCCDocument);
