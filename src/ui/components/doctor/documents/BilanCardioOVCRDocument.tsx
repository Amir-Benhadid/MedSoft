import React, { memo } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { Card, CardContent } from '@/ui/components/ui/card';
import { useDocumentForm } from './hooks/useDocumentForm';

interface BilanCardioOVCRDocumentProps {
	patient: { surname: string; name: string; dob: string };
}

// PDF Generation Function
export const generateBilanCardioOVCRPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string }
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, "LETTRE D'ORIENTATION", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Description
	const descriptionText = "Je soussigné(e), prie de bien vouloir réaliser les examens suivants concernant le(a) sus-nommé(e):";
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
		"Examen clinique",
		"ECG",
		"Échocardiographie",
		"Doppler des vaisseaux du cou"
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
const BilanCardioOVCRDocument: React.FC<BilanCardioOVCRDocumentProps> = ({
	patient,
}) => {
	return (
		<div className="p-2 space-y-3">
			<Card className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<CardContent className="p-0 space-y-2">
					<h3 className="text-sm font-semibold text-foreground">
						BILAN CARDIO OVCR
					</h3>
					<p className="text-xs text-muted-foreground">
						Lettre d'orientation
					</p>
					<p className="text-xs text-muted-foreground italic">
						Je soussigné(e), prie de bien vouloir réaliser les examens suivants concernant le(a) sus-nommé(e):
					</p>
				</CardContent>
			</Card>

			<Card className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<CardContent className="p-0 space-y-3">
					<h4 className="text-sm font-semibold text-foreground">
						Éléments du document:
					</h4>
					<ul className="pl-4 space-y-1.5 list-disc">
						<li className="text-xs text-foreground">
							Examen clinique
						</li>
						<li className="text-xs text-foreground">
							ECG
						</li>
						<li className="text-xs text-foreground">
							Échocardiographie
						</li>
						<li className="text-xs text-foreground">
							Doppler des vaisseaux du cou
						</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
};

export default memo(BilanCardioOVCRDocument);
