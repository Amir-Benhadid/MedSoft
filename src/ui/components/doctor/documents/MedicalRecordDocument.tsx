import React from 'react';
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
import { Card, CardContent } from '@/ui/components/ui/card';

// Types
interface MedicalRecordField {
	value: string;
	shouldFill: boolean;
}

interface MedicalRecord {
	Title: string;
	Code: string;
	Description: string;
	Bullets: string[];
	Fields?: Record<string, MedicalRecordField>;
}

interface MedicalRecordPrintData {
	[key: string]: string;
}

interface MedicalRecordDocumentProps {
	medicalRecord: MedicalRecord;
	printData: MedicalRecordPrintData;
	setPrintData: React.Dispatch<React.SetStateAction<MedicalRecordPrintData>>;
	rightEyeData?: any;
	leftEyeData?: any;
	patient?: any;
}

// PDF Generation Constants
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TEXT_SIZES = {
	title: 16,
	sectionHeader: 12,
	normal: 11,
	small: 8,
};
const LINE_HEIGHTS = {
	title: 20,
	sectionHeader: 16,
	normal: 15,
	small: 12,
	header: 18,
};

// PDF Generation Function
export const generateMedicalRecordPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	medicalRecord: MedicalRecord,
	printData?: MedicalRecordPrintData
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, medicalRecord.Title.toUpperCase(), drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Add description if available
	if (medicalRecord.Description) {
		// Replace {{}} placeholders with actual field values
		let processedDescription = medicalRecord.Description;
		if (printData) {
			Object.keys(printData).forEach(fieldKey => {
				const placeholder = `{{${fieldKey}}}`;
				if (processedDescription.includes(placeholder)) {
					processedDescription = processedDescription.replace(placeholder, printData[fieldKey] || '');
				}
			});
		}

		const descriptionWidth = width - LEFT_MARGIN - RIGHT_MARGIN + 20;
		const descriptionLines = DocumentUtils.splitTextIntoLinesOptimized(
			processedDescription,
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
	}

	// Add bullets if available
	if (medicalRecord.Bullets && medicalRecord.Bullets.length > 0) {
		medicalRecord.Bullets.forEach((bullet) => {
			// Replace {{}} placeholders with actual field values
			let processedBullet = bullet;
			if (printData) {
				Object.keys(printData).forEach(fieldKey => {
					const placeholder = `{{${fieldKey}}}`;
					if (processedBullet.includes(placeholder)) {
						processedBullet = processedBullet.replace(placeholder, printData[fieldKey] || '');
					}
				});
			}

			const bulletWidth = width - LEFT_MARGIN - RIGHT_MARGIN + 20;
			const bulletLines = DocumentUtils.splitTextIntoLinesOptimized(
				processedBullet,
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
		y -= 15;
	}

	// Add fillable fields if available
	if (medicalRecord.Fields && Object.keys(medicalRecord.Fields).length > 0) {
		Object.entries(medicalRecord.Fields).forEach(([fieldKey, fieldConfig]) => {
			const fieldValue = printData?.[fieldKey] || fieldConfig.value || '';

			// Only show fields that should be filled or have values
			if (fieldConfig.shouldFill || fieldValue) {
				const fieldText = `${fieldKey}: ${fieldValue}`;
				const fieldWidth = width - LEFT_MARGIN - RIGHT_MARGIN + 20;
				const fieldLines = DocumentUtils.splitTextIntoLinesOptimized(
					fieldText,
					fieldWidth
				);

				fieldLines.forEach((line) => {
					page.drawText(line, {
						x: LEFT_MARGIN + 20,
						y,
						size: TEXT_SIZES.normal,
						font: helvetica,
						color: rgb(0, 0, 0),
					});
					y -= LINE_HEIGHTS.normal;
				});
				y -= 5;
			}
		});
	}

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const MedicalRecordDocument: React.FC<MedicalRecordDocumentProps> = ({
	medicalRecord,
	printData,
	setPrintData,
	rightEyeData,
	leftEyeData,
	patient,
}) => {
	// Handler for print data changes
	const handlePrintDataChange = (field: string) => (value: string) => {
		setPrintData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Auto-populate fields from eye data when available
	React.useEffect(() => {
		if (rightEyeData || leftEyeData || patient) {
			const newData: MedicalRecordPrintData = { ...printData };

			// Map common field names to eye data
			Object.keys(medicalRecord.Fields || {}).forEach(fieldKey => {
				const fieldKeyLower = fieldKey.toLowerCase();

				// Visual acuity fields
				if (fieldKeyLower.includes('acuitévisuelleod') || fieldKeyLower.includes('acuitevisuelleod')) {
					newData[fieldKey] = rightEyeData?.visualAcuity || rightEyeData?.visualAcuityVL_SC || '';
				} else if (fieldKeyLower.includes('acuitévisuelleog') || fieldKeyLower.includes('acuitevisuelleog')) {
					newData[fieldKey] = leftEyeData?.visualAcuity || leftEyeData?.visualAcuityVL_SC || '';
				} else if (fieldKeyLower.includes('acuité') || fieldKeyLower.includes('acuite')) {
					if (fieldKeyLower.includes('od')) {
						newData[fieldKey] = rightEyeData?.visualAcuity || rightEyeData?.visualAcuityVL_SC || '';
					} else if (fieldKeyLower.includes('og')) {
						newData[fieldKey] = leftEyeData?.visualAcuity || leftEyeData?.visualAcuityVL_SC || '';
					} else {
						// General acuity field
						newData[fieldKey] = rightEyeData?.visualAcuity || rightEyeData?.visualAcuityVL_SC || '';
					}
				}
				// Tonometry fields
				else if (fieldKeyLower.includes('tonus') || fieldKeyLower.includes('pio')) {
					if (fieldKeyLower.includes('od')) {
						newData[fieldKey] = rightEyeData?.tension || '';
					} else if (fieldKeyLower.includes('og')) {
						newData[fieldKey] = leftEyeData?.tension || '';
					} else {
						newData[fieldKey] = rightEyeData?.tension || '';
					}
				}
				// Age field
				else if (fieldKeyLower.includes('age')) {
					if (patient?.dob) {
						const age = DocumentUtils.calculateAge(patient.dob);
						newData[fieldKey] = age.toString();
					}
				}
				// Eye side fields
				else if (fieldKeyLower.includes('œilaffecté') || fieldKeyLower.includes('cote')) {
					// Default to empty, user will fill
					newData[fieldKey] = newData[fieldKey] || '';
				}
				// Date fields
				else if (fieldKeyLower.includes('date')) {
					if (fieldKeyLower.includes('reprise')) {
						newData[fieldKey] = newData[fieldKey] || new Date().toLocaleDateString('fr-FR');
					} else {
						newData[fieldKey] = newData[fieldKey] || new Date().toLocaleDateString('fr-FR');
					}
				}
				// Other fields
				else {
					newData[fieldKey] = newData[fieldKey] || '';
				}
			});

			// Only update if values actually changed
			setPrintData((prev) => {
				if (JSON.stringify(prev) === JSON.stringify(newData)) {
					return prev;
				}
				return newData;
			});
		}
	}, [rightEyeData, leftEyeData, patient, medicalRecord.Fields]);

	return (
		<div className="space-y-4 font-sans text-sm pb-8">
			<div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
				<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
					<div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
						<span className="font-bold text-xs text-indigo-700">{medicalRecord.Code.slice(0, 3)}</span>
					</div>
					<div>
						<h4 className="font-bold text-slate-800 text-sm">{medicalRecord.Title}</h4>
						<p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{medicalRecord.Code}</p>
					</div>
				</div>

				{medicalRecord.Description && (
					<div className="bg-slate-50 p-3 rounded text-xs italic text-slate-600 border border-slate-200/60 leading-relaxed">
						{medicalRecord.Description}
					</div>
				)}

				<div className="space-y-4 pt-2">
					{/* Fillable Fields */}
					{medicalRecord.Fields && Object.keys(medicalRecord.Fields).length > 0 && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Object.entries(medicalRecord.Fields).map(([fieldKey, fieldConfig]) => {
								const fieldKeyLower = fieldKey.toLowerCase();

								// Common logic for label
								const label = (
									<Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5 block">
										{fieldKey}
										{fieldConfig.shouldFill && <span className="text-red-500 ml-0.5">*</span>}
									</Label>
								);

								// Special field types
								// Eye side selection
								if (fieldKeyLower.includes('œilaffecté') || fieldKeyLower.includes('cote') || fieldKeyLower.includes('latéralité')) {
									return (
										<div key={fieldKey} className="space-y-1">
											{label}
											<Select
												value={printData[fieldKey] || ''}
												onValueChange={(val) => handlePrintDataChange(fieldKey)(val)}
											>
												<SelectTrigger className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200">
													<SelectValue placeholder="Sélectionner..." />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Droit">Œil Droit</SelectItem>
													<SelectItem value="Gauche">Œil Gauche</SelectItem>
													<SelectItem value="Bilatéral">Bilatéral</SelectItem>
												</SelectContent>
											</Select>
										</div>
									);
								}

								// Date fields
								if (fieldKeyLower.includes('date')) {
									return (
										<div key={fieldKey} className="space-y-1">
											{label}
											<Input
												type="date"
												value={printData[fieldKey] || ''}
												onChange={(e) => handlePrintDataChange(fieldKey)(e.target.value)}
												className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
											/>
										</div>
									);
								}

								// Stage/Stade fields
								if (fieldKeyLower.includes('stade') || fieldKeyLower.includes('grade')) {
									return (
										<div key={fieldKey} className="space-y-1">
											{label}
											<Select
												value={printData[fieldKey] || ''}
												onValueChange={(val) => handlePrintDataChange(fieldKey)(val)}
											>
												<SelectTrigger className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200">
													<SelectValue placeholder="Sélectionner..." />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="1">Stade 1</SelectItem>
													<SelectItem value="2">Stade 2</SelectItem>
													<SelectItem value="3">Stade 3</SelectItem>
													<SelectItem value="4">Stade 4</SelectItem>
												</SelectContent>
											</Select>
										</div>
									);
								}

								// Default text field
								return (
									<div key={fieldKey} className="space-y-1">
										{label}
										<Input
											value={printData[fieldKey] || ''}
											onChange={(e) => handlePrintDataChange(fieldKey)(e.target.value)}
											placeholder={fieldConfig.value || ''}
											className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
										/>
									</div>
								);
							})}
						</div>
					)}

					{/* Empty state for fields */}
					{(!medicalRecord.Fields || Object.keys(medicalRecord.Fields).length === 0) && (
						<div className="flex flex-col items-center justify-center py-6 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
							<p className="text-xs font-medium">Aucun champ manuel à remplir</p>
							<p className="text-[10px] text-slate-400">Ce document est prêt à être imprimé</p>
						</div>
					)}
				</div>
			</div>

			{/* Bullets Preview - Optional, keeping it subtle */}
			{medicalRecord.Bullets && medicalRecord.Bullets.length > 0 && (
				<div className="bg-slate-50/50 rounded-lg p-3 border border-slate-200/60 shadow-sm">
					<h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200/50 pb-1">
						Aperçu du contenu généré
					</h4>
					<div className="space-y-1.5 pl-1">
						{medicalRecord.Bullets.map((bullet, index) => (
							<div key={index} className="flex items-start gap-2">
								<span className="text-indigo-400 mt-1.5">•</span>
								<p className="text-xs text-slate-600 leading-relaxed font-medium">
									{bullet}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default MedicalRecordDocument;
