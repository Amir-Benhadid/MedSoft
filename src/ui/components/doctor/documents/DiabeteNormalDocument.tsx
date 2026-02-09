import React, { memo } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { Card, CardContent } from '@/ui/components/ui/card';
import { useDocumentForm } from './hooks/useDocumentForm';

interface DiabeteNormalDocumentProps {
	patient: { surname: string; name: string; dob: string };
}

// PDF Generation Function
export const generateDiabeteNormalPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string }
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, "COMPTE RENDU", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Description
	const descriptionText = "Le(la) sus-nommé(e) présente à l'examen du jour:";
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
		"Diabète type 2 HTA cardiopathie dysthyroidie",
		"Acuité visuelle avec correction",
		"Examen à la L.A.F: sans anomalies",
		"PIO normale",
		"FO: sans anomalies",
		"Conclusion: Absence de complications oculaires du diabète Contrôle annuel"
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
const DiabeteNormalDocument: React.FC<DiabeteNormalDocumentProps> = ({
	patient,
}) => {
	return (
		<div className="p-2 space-y-3">
			<Card className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<CardContent className="p-0 space-y-2">
					<h3 className="text-sm font-semibold text-foreground">
						Diabète Normal
					</h3>
					<p className="text-xs text-muted-foreground">
						Compte rendu
					</p>
					<p className="text-xs text-muted-foreground italic">
						Le(la) sus-nommé(e) présente à l'examen du jour:
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
							Diabète type 2 HTA cardiopathie dysthyroidie
						</li>
						<li className="text-xs text-foreground">
							Acuité visuelle avec correction
						</li>
						<li className="text-xs text-foreground">
							Examen à la L.A.F: sans anomalies
						</li>
						<li className="text-xs text-foreground">
							PIO normale
						</li>
						<li className="text-xs text-foreground">
							FO: sans anomalies
						</li>
						<li className="text-xs text-foreground">
							Conclusion: Absence de complications oculaires du diabète Contrôle annuel
						</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
};

export default memo(DiabeteNormalDocument);
