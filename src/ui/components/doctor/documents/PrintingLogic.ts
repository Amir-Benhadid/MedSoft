import { rgb } from 'pdf-lib';
import { createPdfContext } from './PdfUtils';
import { generateContactLensesPDF } from './ContactLensesDocument';
import { generateGlassesPDF } from './GlassesDocument';
import { generateMedicationsPDF } from './MedicationsDocument';
import { generateVisualAcuityCertificatePDF } from './VisualAcuityCertificateDocument';
import { generateWorkStopPDF } from './WorkStopDocument';
import { generateAbsenceCertificatePDF } from './AbsenceCertificateDocument';
import { generateReportPDF } from './ReportDocument';
import { generateBilanPDF } from './BilanDocuments';
import { generateMedicalRecordPDF } from './MedicalRecordDocument';

import { drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import {
	DetailedClinicalExamData,
	EyeData,
	PrescriptionData,
	TonometrieData,
} from './types';

// Define BilanFields interface to match DocumentsSection expectations
interface BilanFields {
	bilanPreOp: {
		groupage: boolean;
		fnsTP: boolean;
		ionogramme: boolean;
		glycemie: boolean;
		ureeCreatinine: boolean;
		bilanHepatique: boolean;
		ecgCardiologie: boolean;
	};
	bilanDiabete: {
		glycemieJeun: boolean;
		glycemiePostPrandiale: boolean;
		hbA1c: boolean;
		cholesterol: boolean;
		triglycerides: boolean;
	};
	bilanInflammatoire: {
		fns: boolean;
		crp: boolean;
		fibrinogene: boolean;
		vs: boolean;
		electrophorese: boolean;
	};
	bilanUveite: {
		fns: boolean;
		vsCrp: boolean;
		electrophorese: boolean;
		toxoplasmose: boolean;
		idrTuberculine: boolean;
		aslo: boolean;
		typageHla: boolean;
		vdrlTpha: boolean;
		serologie: boolean;
		radioThorax: boolean;
	};
}

interface PatientData {
	id: string;
	name: string;
	surname: string;
	dob: string;
	phone?: string;
	email?: string;
}


interface AbsenceData {
	consultationDate: Date;
}

interface WorkStopData {
	startDate: Date;
	endDate: Date;
	reason: string;
	exitAuthorized: boolean;
	isProlongation?: boolean;
}

interface ReportData {
	conclusion: string;
	antecedents?: string;
	inspection?: string;
	segmentAnterieur?: string;
	fondOeil?: string;
}

interface PrintControlFlags {
	includeVisualAcuityWithCorrection?: boolean;
	includeVisualAcuityWithoutCorrection?: boolean;
	includeGlassType?: boolean;
	includeFarVision?: boolean;
	includeNearVision?: boolean;
	includeRightEye?: boolean;
	includeLeftEye?: boolean;
	includeRightEyeFar?: boolean;
	includeLeftEyeFar?: boolean;
	includeRightEyeNear?: boolean;
	includeLeftEyeNear?: boolean;
	includeTonometry?: boolean;
}

interface PrintDataOverrides {
	glasses?: {
		rightEye: {
			sph: string;
			cyl: string;
			axis: string;
			add: string;
			visualAcuityVL_AC: string;
			glassType: string;
			nearSph: string;
			nearCyl: string;
			nearAxis: string;
			emptyEyeOption?: 'plan' | 'conserver';
			emptyNearEyeOption?: 'plan' | 'conserver';
		};
		leftEye: {
			sph: string;
			cyl: string;
			axis: string;
			add: string;
			visualAcuityVL_AC: string;
			glassType: string;
			nearSph: string;
			nearCyl: string;
			nearAxis: string;
			emptyEyeOption?: 'plan' | 'conserver';
			emptyNearEyeOption?: 'plan' | 'conserver';
		};
	};
	certificatAcuite?: {
		rightEye: {
			visualAcuityVL_SC: string;
			visualAcuityVL_AC: string;
			glassType: string;
		};
		leftEye: {
			visualAcuityVL_SC: string;
			visualAcuityVL_AC: string;
			glassType: string;
		};
	};
	visualAcuity?: {
		visualAcuityVL_SC_OD: string;
		visualAcuityVL_SC_OG: string;
		visualAcuityVL_AC_OD: string;
		visualAcuityVL_AC_OG: string;
	};
	contacts?: {
		rightEye: {
			contactLensType: string;
			lensBrand: string;
			lensType: string;
			sph: string;
			cyl: string;
			axis: string;
			add: string;
			axis_k: string;
			diam: string;
			k1: string;
			k2: string;
		};
		leftEye: {
			contactLensType: string;
			lensBrand: string;
			lensType: string;
			sph: string;
			cyl: string;
			axis: string;
			add: string;
			axis_k: string;
			diam: string;
			k1: string;
			k2: string;
		};
	};
	divers?: {
		certificateContent: string;
		certificateTitle: string;
	};
	medicalRecord?: {
		documentType: string;
		printData: any;
	};
	workStop?: {
		startDate: Date;
		endDate: Date;
		exitAuthorized: boolean;
		isProlongation?: boolean;
	};
	absence?: {
		consultationDate: Date;
	};
	customGeneric?: {
		title: string;
		text: string;
	};
}

export class DocumentPrinter {
	/**
	 * Generate PDF bytes for any document type
	 */
	static async generatePdfBytes(
		documentType: string,
		patient: PatientData,
		options: {
			leftEye?: EyeData;
			rightEye?: EyeData;
			prescriptionData?: PrescriptionData;
			detailedClinicalExam?: DetailedClinicalExamData;
			tonometrie?: TonometrieData;
			bilanFields?: BilanFields;
			absenceData?: AbsenceData;
			workStopData?: WorkStopData;
			reportData?: ReportData;
			glassType?: string;
			printControlFlags?: PrintControlFlags;
			printDataOverrides?: PrintDataOverrides;
		}
	): Promise<Uint8Array> {
		// Create PDF context
		const context = await createPdfContext();

		// Get eye data with print overrides
		const rightEyeData = this.getRightEyeDataWithOverrides(
			options.rightEye,
			documentType,
			options.printDataOverrides
		);
		const leftEyeData = this.getLeftEyeDataWithOverrides(
			options.leftEye,
			documentType,
			options.printDataOverrides
		);

		// Generate PDF based on document type
		switch (documentType) {
			case 'contacts':
				return await generateContactLensesPDF(
					context,
					patient,
					options.printDataOverrides?.contacts,
					options.printControlFlags ? {
						includeRightEye: options.printControlFlags.includeRightEye,
						includeLeftEye: options.printControlFlags.includeLeftEye,
					} : undefined
				);
			case 'glasses':
				return await generateGlassesPDF(
					context,
					patient,
					options.printDataOverrides?.glasses,
					options.printControlFlags ? {
						includeGlassType: options.printControlFlags.includeGlassType ?? false,
						includeFarVision: options.printControlFlags.includeFarVision ?? false,
						includeNearVision: options.printControlFlags.includeNearVision ?? false,
						includeRightEyeFar: options.printControlFlags.includeRightEyeFar,
						includeLeftEyeFar: options.printControlFlags.includeLeftEyeFar,
						includeRightEyeNear: options.printControlFlags.includeRightEyeNear,
						includeLeftEyeNear: options.printControlFlags.includeLeftEyeNear,
					} : undefined
				);
			case 'medications':
				return await generateMedicationsPDF(context, patient, options.prescriptionData);
			case 'certificatAcuite':
				// Use visual acuity print data from printDataOverrides
				// Support both: visualAcuity (flat OD/OG format from DocumentsContainer) and certificatAcuite (legacy eye format)
				let visualAcuityPrintData = options.printDataOverrides?.visualAcuity;
				if (!visualAcuityPrintData && options.printDataOverrides?.certificatAcuite) {
					visualAcuityPrintData = {
						visualAcuityVL_SC_OD: options.printDataOverrides.certificatAcuite.rightEye.visualAcuityVL_SC,
						visualAcuityVL_SC_OG: options.printDataOverrides.certificatAcuite.leftEye.visualAcuityVL_SC,
						visualAcuityVL_AC_OD: options.printDataOverrides.certificatAcuite.rightEye.visualAcuityVL_AC,
						visualAcuityVL_AC_OG: options.printDataOverrides.certificatAcuite.leftEye.visualAcuityVL_AC,
					};
				}
				return await generateVisualAcuityCertificatePDF(
					context,
					patient,
					visualAcuityPrintData,
					options.printControlFlags ? {
						includeVisualAcuityWithoutCorrection: options.printControlFlags.includeVisualAcuityWithoutCorrection ?? true,
						includeVisualAcuityWithCorrection: options.printControlFlags.includeVisualAcuityWithCorrection ?? true,
					} : undefined
				);
			case 'workStop':
				// Use the work stop print data from printDataOverrides
				const workStopPrintData = options.printDataOverrides?.workStop ? {
					startDate: options.printDataOverrides.workStop.startDate,
					endDate: options.printDataOverrides.workStop.endDate,
					exitAuthorized: options.printDataOverrides.workStop.exitAuthorized,
					isProlongation: options.printDataOverrides.workStop.isProlongation,
				} : undefined;
				return await generateWorkStopPDF(context, patient, workStopPrintData);
			case 'absence':
				// Use the absence print data from printDataOverrides
				const absencePrintData = options.printDataOverrides?.absence ? {
					consultationDate: options.printDataOverrides.absence.consultationDate,
				} : undefined;
				return await generateAbsenceCertificatePDF(context, patient, absencePrintData);
			case 'report':
				return await generateReportPDF(
					context,
					patient,
					rightEyeData,
					leftEyeData,
					options.detailedClinicalExam,
					options.tonometrie,
					options.reportData,
					options.printControlFlags ? {
						includeVisualAcuityWithCorrection: options.printControlFlags.includeVisualAcuityWithCorrection ?? true,
						includeGlassType: options.printControlFlags.includeGlassType ?? false,
						includeVisualAcuityWithoutCorrection: options.printControlFlags.includeVisualAcuityWithoutCorrection ?? true,
						includeTonometry: options.printControlFlags.includeTonometry ?? true,
					} : undefined
				);
			case 'divers':
				// Handle individual medical record documents
				if (options.printDataOverrides?.medicalRecord) {
					// Import medical records and find the selected one
					const medicalRecords = await import('./medical_records_structured.json');
					const selectedRecord = medicalRecords.default.find((record: any) => record.code === options.printDataOverrides!.medicalRecord!.documentType);

					if (selectedRecord) {
						return await generateMedicalRecordPDF(
							context,
							patient,
							selectedRecord as any,
							options.printDataOverrides.medicalRecord.printData
						);
					}

					// Fallback if not found
					context.page.drawText(`Document non trouvé: ${options.printDataOverrides.medicalRecord.documentType}`, {
						x: context.LEFT_MARGIN,
						y: context.height - 100,
						size: context.TEXT_SIZES.normal,
						font: context.helvetica,
						color: rgb(1, 0, 0),
					});
					return await context.pdfDoc.save();
				}

				// For other divers documents, create a certificate document
				const diversData = options.printDataOverrides?.divers;
				if (diversData) {
					// Add patient header
					context.page.drawText(`${patient.name} ${patient.surname}`, {
						x: context.LEFT_MARGIN,
						y: context.height - 100,
						size: context.TEXT_SIZES.title,
						font: context.helveticaBold,
						color: rgb(0, 0, 0),
					});

					// Add certificate title
					context.page.drawText(diversData.certificateTitle, {
						x: context.LEFT_MARGIN,
						y: context.height - 150,
						size: context.TEXT_SIZES.header,
						font: context.helveticaBold,
						color: rgb(0, 0, 0),
					});

					// Add certificate content
					const lines = diversData.certificateContent.split('\n');
					let yPosition = context.height - 200;
					for (const line of lines) {
						if (yPosition < 100) break; // Prevent overflow
						context.page.drawText(line, {
							x: context.LEFT_MARGIN,
							y: yPosition,
							size: context.TEXT_SIZES.small,
							font: context.helvetica,
							color: rgb(0, 0, 0),
						});
						yPosition -= 20;
					}
				} else {
					// Document vierge - just show header with patient info
					drawDocumentHeader(context, patient, DocumentUtils.calculateAge);
				}
				return await context.pdfDoc.save();
			case 'generic':
				// Draw standard header
				drawDocumentHeader(context, patient, DocumentUtils.calculateAge);

				const genericData = options.printDataOverrides?.customGeneric;
				if (genericData && genericData.title) {
					// Draw custom title
					let y = drawTitle(context, genericData.title.toUpperCase(), drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

					// Draw custom body text
					if (genericData.text) {
						const bodyLines = DocumentUtils.splitTextIntoLinesOptimized(
							genericData.text,
							context.width - context.LEFT_MARGIN - context.RIGHT_MARGIN
						);

						for (const line of bodyLines) {
							if (y < 50) {
								// Basic page overflow handling if text is too long
								break;
							}
							context.page.drawText(line, {
								x: context.LEFT_MARGIN,
								y: y,
								size: context.TEXT_SIZES.normal,
								font: context.helvetica,
								color: rgb(0, 0, 0),
							});
							y -= context.LINE_HEIGHTS.normal;
						}
					}
				} else {
					// Blank document if no title
					context.page.drawText('Document Vierge', {
						x: context.LEFT_MARGIN,
						y: context.height - 200,
						size: context.TEXT_SIZES.header,
						font: context.helveticaBold,
						color: rgb(0.5, 0.5, 0.5),
					});
				}
				return await context.pdfDoc.save();
			case 'bilanPreOp':
			case 'bilanDiabete':
			case 'bilanInflammatoire':
			case 'bilanUveite':
				return await generateBilanPDF(context, patient, documentType as any, options.bilanFields as any);
			default:
				// Fallback for unknown document types
				context.page.drawText('Document en cours de préparation...', {
					x: context.LEFT_MARGIN,
					y: context.height - 100,
					size: context.TEXT_SIZES.small,
					font: context.helvetica,
					color: rgb(0, 0, 0),
				});
				return await context.pdfDoc.save();
		}
	}

	/**
	 * Get right eye data with print overrides applied
	 */
	private static getRightEyeDataWithOverrides(
		rightEye?: EyeData,
		documentType?: string,
		printDataOverrides?: PrintDataOverrides
	): EyeData | undefined {
		if (documentType === 'glasses' && printDataOverrides?.glasses?.rightEye) {
			return { ...rightEye, ...printDataOverrides.glasses.rightEye } as EyeData;
		}
		if (documentType === 'certificatAcuite' && printDataOverrides?.certificatAcuite?.rightEye) {
			return { ...rightEye, ...printDataOverrides.certificatAcuite.rightEye } as EyeData;
		}
		return rightEye;
	}

	/**
	 * Get left eye data with print overrides applied
	 */
	private static getLeftEyeDataWithOverrides(
		leftEye?: EyeData,
		documentType?: string,
		printDataOverrides?: PrintDataOverrides
	): EyeData | undefined {
		if (documentType === 'glasses' && printDataOverrides?.glasses?.leftEye) {
			return { ...leftEye, ...printDataOverrides.glasses.leftEye } as EyeData;
		}
		if (documentType === 'certificatAcuite' && printDataOverrides?.certificatAcuite?.leftEye) {
			return { ...leftEye, ...printDataOverrides.certificatAcuite.leftEye } as EyeData;
		}
		return leftEye;
	}

	static async printDocument(
		documentType: string,
		patient: PatientData,
		options: {
			leftEye?: EyeData;
			rightEye?: EyeData;
			prescriptionData?: PrescriptionData;
			detailedClinicalExam?: DetailedClinicalExamData;
			tonometrie?: TonometrieData;
			bilanFields?: BilanFields;
			absenceData?: AbsenceData;
			workStopData?: WorkStopData;
			reportData?: ReportData;
			glassType?: string;
			printControlFlags?: PrintControlFlags;
			printDataOverrides?: PrintDataOverrides;
		}
	): Promise<void> {
		try {
			// 1) Generate the PDF bytes
			const bytes = await this.generatePdfBytes(documentType, patient, options);

			// 2) IMPORTANT: Build Blob from the Uint8Array itself, not bytes.buffer
			const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);

			// 3) Create a hidden iframe to host the PDF
			const iframe = document.createElement('iframe');
			iframe.style.position = 'fixed';
			iframe.style.right = '0';
			iframe.style.bottom = '0';
			iframe.style.width = '0';
			iframe.style.height = '0';
			iframe.style.border = '0';
			iframe.src = url; // let the browser’s PDF handler load it
			document.body.appendChild(iframe);

			// 4) Robust cleanup that won't race printing
			const cleanup = () => {
				try { document.body.removeChild(iframe); } catch { }
				try { URL.revokeObjectURL(url); } catch { }
			};

			// Prefer the iframe's own print events if available
			const targetWin = () => iframe.contentWindow || iframe;

			// onafterprint fires when the print dialog closes (most browsers)
			const attachAfterPrint = () => {
				const tw = targetWin();
				if (!tw) return;
				const after = () => {
					// Add a tiny delay so spoolers can still read the PDF
					setTimeout(cleanup, 500);
				};
				if (tw) {
					// TS doesn't know iframe windows support afterprint, so cast to any
					(tw as any).addEventListener('afterprint', () => {
						setTimeout(cleanup, 500);
					});
				}

				// Fallback: page-level matchMedia for print state
				if ('matchMedia' in window) {
					const mql = window.matchMedia('print');
					const listener = (ev: MediaQueryListEvent) => {
						if (!ev.matches) {
							setTimeout(after, 0);
							mql.removeEventListener?.('change', listener);
						}
					};
					mql.addEventListener?.('change', listener);
				}

				// Last-resort cleanup in case no events ever fire (Safari quirks)
				setTimeout(after, 60_000);
			};

			// 5) Wait for the PDF to load in the iframe, then print
			iframe.onload = () => {
				attachAfterPrint();
				// Give the built-in viewer a moment to parse & attach
				setTimeout(() => {
					try {
						const win = iframe.contentWindow;
						if (win) {
							win.focus();
							(win as Window).print();
						}
					} catch {
						// If printing throws for any reason, leave the iframe so the user can retry
					}
				}, 750); // tweak to 500–1500ms if you see timing issues on Safari
			};
		} catch (err) {
			console.error('Print error:', err);
			throw new Error("Erreur à la génération du PDF.");
		}
	}


	/**
	 * Generate PDF preview URL
	 */
	static async generatePreviewUrl(
		documentType: string,
		patient: PatientData,
		printOptions: {
			leftEye?: EyeData;
			rightEye?: EyeData;
			prescriptionData?: PrescriptionData;
			detailedClinicalExam?: DetailedClinicalExamData;
			tonometrie?: TonometrieData;
			bilanFields?: BilanFields;
			absenceData?: AbsenceData;
			workStopData?: WorkStopData;
			reportData?: ReportData;
			glassType?: string;
			printControlFlags?: PrintControlFlags;
			printDataOverrides?: PrintDataOverrides;
		}
	): Promise<string> {
		try {
			const bytes = await this.generatePdfBytes(documentType, patient, printOptions);
			const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
			return URL.createObjectURL(blob);
		} catch (err) {
			console.error('Preview generation error:', err);
			throw new Error('Erreur à la génération de l\'aperçu.');
		}
	}
}
