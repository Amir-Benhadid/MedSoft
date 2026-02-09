import React, { memo } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { Card, CardContent } from '@/ui/components/ui/card';
import { useDocumentForm } from './hooks/useDocumentForm';

interface CTFCeciteTotaleDocumentProps {}

// PDF Generation Function
export const generateCTFCeciteTotalePDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string }
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;
	
	let y = drawTitle(context, "CERTIFICAT MÉDICAL", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));
    
	// Description
	const descriptionText = "Cécité totale. IPP = Cent pour cent définitive (100%)";
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
const CTFCeciteTotaleDocument: React.FC<CTFCeciteTotaleDocumentProps> = () => {
	// Get form data from hook (patient not needed for this component, but available if needed)
	const { patient } = useDocumentForm();
	return (
		<div className="p-2 space-y-3">
			<Card className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<CardContent className="p-0 space-y-2">
					<h3 className="text-sm font-semibold text-foreground">
						CTF (CECITE TOTALE)
					</h3>
					<p className="text-xs text-muted-foreground">
						Certificat médical
					</p>
					<p className="text-xs text-muted-foreground italic">
						Cécité totale. IPP = Cent pour cent définitive (100%)
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default memo(CTFCeciteTotaleDocument);
