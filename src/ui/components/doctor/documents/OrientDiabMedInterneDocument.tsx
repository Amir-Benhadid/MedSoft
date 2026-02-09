import React, { memo } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { useDocumentForm } from './hooks/useDocumentForm';

interface OrientDiabMedInterneDocumentProps {}

// PDF Generation Function
export const generateOrientDiabMedInternePDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string }
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, "LETTRE D'ORIENTATION", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Description
	const descriptionText = "Cher(e) confrère, je vous adresse le(la) sus-nommé(e) pour examen dans un but diagnostique étiologique";
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
const OrientDiabMedInterneDocument: React.FC<OrientDiabMedInterneDocumentProps> = () => {
	// Get form data from hook (patient not needed for this component, but available if needed)
	const { patient } = useDocumentForm();
	return (
		<div className="p-4">
			<div className="mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
				<h4 className="font-semibold text-sm mb-1 text-blue-900">
					ORIENT DIAB MED INTERNE
				</h4>
				<p className="text-xs text-muted-foreground mb-2">
					Lettre d'orientation
				</p>
				<p className="text-xs italic text-muted-foreground">
					Cher(e) confrère, je vous adresse le(la) sus-nommé(e) pour examen dans un but diagnostique étiologique
				</p>
			</div>
		</div>
	);
};

export default memo(OrientDiabMedInterneDocument);
