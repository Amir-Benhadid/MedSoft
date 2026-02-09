import React, { memo } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { Card, CardContent } from '@/ui/components/ui/card';
import { useDocumentForm } from './hooks/useDocumentForm';

interface BilanCardioVasculaireDocumentProps {}

// PDF Generation Function
export const generateBilanCardioVasculairePDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string }
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;
	
	let y = drawTitle(context, "BILAN", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));
    
	// Description
	const descriptionText = "Cher(e) confrère Je vous adresse le(la) sus-nommé(e) que je dois opérer de catarcte pour avis cardiologique pré-opératoire - Intervention prévue sous anesthésie loco-régionale";
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
const BilanCardioVasculaireDocument: React.FC<BilanCardioVasculaireDocumentProps> = () => {
	// Get form data from hook (patient not needed for this component, but available if needed)
	const { patient } = useDocumentForm();
	return (
		<div className="p-2 space-y-3">
			<Card className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<CardContent className="p-0 space-y-2">
					<h3 className="text-sm font-semibold text-foreground">
						BILAN CARDIO VASCULAIRE
					</h3>
					<p className="text-xs text-muted-foreground">
						Bilan
					</p>
					<p className="text-xs text-muted-foreground italic">
						Cher(e) confrère Je vous adresse le(la) sus-nommé(e) que je dois opérer de catarcte pour avis cardiologique pré-opératoire - Intervention prévue sous anesthésie loco-régionale
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default memo(BilanCardioVasculaireDocument);
