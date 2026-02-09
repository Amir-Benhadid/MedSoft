import React, { memo, useMemo, useCallback } from 'react';
import { useDocumentForm } from './hooks/useDocumentForm';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Label } from '@/ui/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';

interface CTFLaserYAGDocumentProps {}

// PDF Generation Function
export const generateCTFLaserYAGPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: {
		oeilAffecte: string;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;
	
	let y = drawTitle(context, "COMPTE RENDU", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));
    
	// Description
	const descriptionText = `Le(la) sus-nommé(e) présente une capsulectomie au LASER YAG pour: cataracte secondaire de l'œil ${printData?.oeilAffecte || ''}, Codification K80`;
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
const CTFLaserYAGDocument: React.FC<CTFLaserYAGDocumentProps> = () => {
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
		<div className="p-2 space-y-3">
			<Card className="bg-card rounded-xl p-3 border border-border shadow-sm">
				<CardContent className="p-0 space-y-2">
					<h3 className="text-sm font-semibold text-foreground">
						CTF (LASER YAG)
					</h3>
					<p className="text-xs text-muted-foreground">
						Compte rendu
					</p>
					<p className="text-xs text-muted-foreground italic">
						Le(la) sus-nommé(e) présente une capsulectomie au LASER YAG pour: cataracte secondaire de l'œil {printData.oeilAffecte}, Codification K80
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
							<Label className="text-xs font-semibold">Œil affecté</Label>
							<Select
								value={printData.oeilAffecte}
								onValueChange={(value) => setPrintData(prev => ({ ...prev, oeilAffecte: value }))}
							>
								<SelectTrigger className="h-8 text-sm">
									<SelectValue placeholder="Sélectionner un œil" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="droit">Droit</SelectItem>
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

export default memo(CTFLaserYAGDocument);
