import { rgb } from 'pdf-lib';
import { createPdfContext, drawDocumentHeader } from './utils/PdfUtils';
import { generateGlassesPDF } from './GlassesDocument';
import { generateContactLensesPDF } from './ContactLensesDocument';
import { generateReportPDF } from './MedicalReportDocument';
import { generateWorkStopPDF } from './WorkStopDocument';
import { generateGenericPDF, GenericRecordConfig } from './GenericDocument';
import { generateVisualAcuityCertificatePDF } from './VisualAcuityCertificateDocument';
import { generateBilanPDF, generateBilanCardioPDF } from './BilanDocuments';
import { generateAbsenceCertificatePDF } from './AbsenceCertificateDocument';
import { generatePrescriptionPDF } from './PrescriptionDocument';
import { generateRadiographyPDF } from './RadiographyDocument';
import { DocumentUtils } from './utils/DocumentUtils';

// Types - Redefined locally for now to avoid circular dependencies
interface EyeData {
    sph?: string;
    cyl?: string;
    axis?: string;
    add?: string;
    pd?: string;
    visualAcuityVL_AC?: string;
    glassType?: string;
    [key: string]: any;
}

interface PatientData {
    id: string;
    name: string;
    surname: string;
    dob: string;
    phone?: string;
    email?: string;
}

interface PrintControlFlags {
    includeVisualAcuityWithCorrection?: boolean;
    includeVisualAcuityWithoutCorrection?: boolean;
    includeGlassType?: boolean;
    includeFarVision?: boolean;
    includeNearVision?: boolean;
    includeRightEyeFar?: boolean;
    includeLeftEyeFar?: boolean;
    includeRightEyeNear?: boolean;
    includeLeftEyeNear?: boolean;
    includeRightEye?: boolean; // For contacts
    includeLeftEye?: boolean; // For contacts
    includeTonometry?: boolean; // For report
    includeRaw?: boolean; // Certificate
    includeCorrection?: boolean; // Certificate
    [key: string]: any;
}

interface PrintDataOverrides {
    glasses?: any;
    contactLenses?: any;
    report?: any;
    workStop?: any;
    generic?: any;
    certificate?: any;
    bilan?: any;
    absence?: any;
    prescriptions?: any;
    [key: string]: any;
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
            glassType?: string;
            printControlFlags?: PrintControlFlags;
            printDataOverrides?: PrintDataOverrides;
            genericConfig?: GenericRecordConfig;
            prescriptions?: any[];
            clinicalExam?: any;
            [key: string]: any;
        }
    ): Promise<Uint8Array> {
        // Create PDF context
        const context = await createPdfContext();

        // Generate PDF based on document type
        switch (documentType) {
            case 'medications':
                return await generatePrescriptionPDF(
                    context,
                    patient,
                    {
                        treatments: options.prescriptions || [],
                        notes: options.printDataOverrides?.prescriptions?.notes, // Hypothetical override if we had one
                        nextAppointment: options.clinicalExam?.nextAppointment ? {
                            date: options.clinicalExam.nextAppointment.date,
                            reason: options.clinicalExam.nextAppointment.reason,
                            timeframe: options.clinicalExam.nextAppointment.timeframe
                        } : undefined
                    }
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
                        includeVisualAcuityWithCorrection: false
                    } : undefined
                );
            case 'contacts':
                return await generateContactLensesPDF(
                    context,
                    patient,
                    options.printDataOverrides?.contactLenses,
                    options.printControlFlags ? {
                        includeRightEye: options.printControlFlags.includeRightEye ?? true,
                        includeLeftEye: options.printControlFlags.includeLeftEye ?? true,
                    } : undefined
                );
            case 'report':
                return await generateReportPDF(
                    context,
                    patient,
                    options.printDataOverrides?.report,
                    options.printControlFlags ? {
                        includeVisualAcuityWithoutCorrection: options.printControlFlags.includeVisualAcuityWithoutCorrection ?? true,
                        includeVisualAcuityWithCorrection: options.printControlFlags.includeVisualAcuityWithCorrection ?? true,
                        includeTonometry: options.printControlFlags.includeTonometry ?? true,
                    } : undefined
                );
            case 'workStop':
                return await generateWorkStopPDF(
                    context,
                    patient,
                    options.printDataOverrides?.workStop
                );
            case 'visualAcuity':
                return await generateVisualAcuityCertificatePDF(
                    context,
                    patient,
                    options.printDataOverrides?.certificate,
                    options.printControlFlags ? {
                        includeRaw: options.printControlFlags.includeRaw ?? true,
                        includeCorrection: options.printControlFlags.includeCorrection ?? true,
                    } : undefined
                );
            case 'absence':
                return await generateAbsenceCertificatePDF(
                    context,
                    patient,
                    options.printDataOverrides?.absence
                );
            case 'bilanPreOp':
                return await generateBilanPDF(
                    context,
                    patient,
                    'preop',
                    options.printDataOverrides?.bilan?.preop
                );
            case 'bilanDiabete':
                return await generateBilanPDF(
                    context,
                    patient,
                    'diabete',
                    options.printDataOverrides?.bilan?.diabete
                );
            case 'bilanCardio':
                return await generateBilanCardioPDF(
                    context,
                    patient
                );
            case 'bilanCnas':
                return await generateBilanPDF(
                    context,
                    patient,
                    'cnas',
                    options.printDataOverrides?.bilan?.cnas
                );
            case 'bilanCtf':
                return await generateBilanPDF(
                    context,
                    patient,
                    'ctf',
                    options.printDataOverrides?.bilan?.ctf
                );
            case 'bilanBiometrie':
                return await generateBilanPDF(
                    context,
                    patient,
                    'biometrie',
                    options.printDataOverrides?.bilan?.biometrie
                );
            case 'bilanInfectieux':
                return await generateBilanPDF(
                    context,
                    patient,
                    'infectieux',
                    options.printDataOverrides?.bilan?.infectieux
                );
            case 'generic':
                if (!options.genericConfig) {
                    throw new Error('Generic document configuration missing');
                }
                return await generateGenericPDF(
                    context,
                    patient,
                    options.genericConfig,
                    options.printDataOverrides?.generic || {}
                );
            case 'radiography':
                return await generateRadiographyPDF(
                    context,
                    patient,
                    options.printDataOverrides?.radiography
                );
            default:
                // Fallback for unknown document types
                context.page.drawText(`Document '${documentType}' en cours de portage...`, {
                    x: context.LEFT_MARGIN,
                    y: context.height - 100,
                    size: context.TEXT_SIZES.small,
                    font: context.helvetica,
                    color: rgb(0, 0, 0),
                });
                return await context.pdfDoc.save();
        }
    }

    static async printDocument(
        documentType: string,
        patient: PatientData,
        options: any
    ): Promise<void> {
        try {
            // 1) Generate the PDF bytes
            const bytes = await this.generatePdfBytes(documentType, patient, options);

            // 2) Build Blob
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // 3) Hidden iframe
            const iframe = document.createElement('iframe');
            Object.assign(iframe.style, {
                position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0'
            });
            iframe.src = url;
            document.body.appendChild(iframe);

            // 4) Cleanup
            const cleanup = () => {
                try { document.body.removeChild(iframe); } catch { }
                try { URL.revokeObjectURL(url); } catch { }
            };

            const targetWin = () => iframe.contentWindow || iframe;

            const attachAfterPrint = () => {
                const tw = targetWin();
                if (tw) {
                    (tw as any).addEventListener('afterprint', () => setTimeout(cleanup, 500));
                }

                if ('matchMedia' in window) {
                    const mql = window.matchMedia('print');
                    const listener = (ev: MediaQueryListEvent) => {
                        if (!ev.matches) {
                            setTimeout(cleanup, 0); // Cleanup immediately after print dialog closes
                            mql.removeEventListener?.('change', listener);
                        }
                    };
                    mql.addEventListener?.('change', listener);
                }

                setTimeout(cleanup, 60_000); // Failsafe
            };

            // 5) Wait and print
            iframe.onload = () => {
                attachAfterPrint();
                setTimeout(() => {
                    try {
                        const win = iframe.contentWindow;
                        if (win) {
                            win.focus();
                            (win as Window).print();
                        }
                    } catch { }
                }, 750);
            };
        } catch (err) {
            console.error('Print error:', err);
            throw new Error("Erreur à la génération du PDF.");
        }
    }

    static async generatePreviewUrl(
        documentType: string,
        patient: PatientData,
        printOptions: any
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
