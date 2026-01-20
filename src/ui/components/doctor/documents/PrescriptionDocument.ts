import { rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';

export interface PrescriptionItem {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export interface PrescriptionPrintData {
    treatments: PrescriptionItem[];
    notes?: string;
    nextAppointment?: {
        date: string;
        reason?: string;
        timeframe?: string;
    };
}

const TEXT_SIZES = {
    title: 16,
    header: 11,
    medicationName: 12,
    details: 10,
    normal: 10,
    small: 8,
    footer: 9,
};

const LINE_HEIGHTS = {
    title: 25,
    header: 18,
    medicationName: 16,
    details: 14,
    normal: 14,
    footer: 12,
};

export const generatePrescriptionPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    data: PrescriptionPrintData
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN } = context;

    // Override sizes for this document locally if needed, but we used constants above
    // We will use the constants defined above for specific styling

    let y = drawTitle(context, 'ORDONNANCE', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    // Add some spacing after title
    y -= 10;

    const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;

    // Treatments
    if (data.treatments.length > 0) {
        data.treatments.forEach((treatment, index) => {
            // Check for page break
            if (y < 100) {
                // simple new page handling could be added here if we had access to addPage, 
                // but for now we assume it fits or text flows off (legacy didn't handle pagination explicitly either)
            }

            // Medication Name
            const numberPrefix = `${index + 1}. `;
            page.drawText(`${numberPrefix}${treatment.name}`, {
                x: LEFT_MARGIN,
                y,
                size: TEXT_SIZES.medicationName,
                font: helveticaBold,
                color: rgb(0, 0, 0),
            });
            y -= LINE_HEIGHTS.medicationName;

            // Details (Dosage, Duration, etc)
            let detailsParts: string[] = [];
            if (treatment.dosage) detailsParts.push(treatment.dosage);
            if (treatment.frequency) detailsParts.push(treatment.frequency);
            if (treatment.duration) detailsParts.push(treatment.duration);

            if (detailsParts.length > 0) {
                const detailsText = detailsParts.join(' - ');
                page.drawText(detailsText, {
                    x: LEFT_MARGIN + 20, // Indent
                    y,
                    size: TEXT_SIZES.details,
                    font: helvetica,
                    color: rgb(0.2, 0.2, 0.2),
                });
                y -= LINE_HEIGHTS.details;
            }

            // Instructions
            if (treatment.instructions) {
                const instructionsLines = DocumentUtils.splitTextIntoLinesOptimized(treatment.instructions, availableWidth - 20);
                instructionsLines.forEach(line => {
                    page.drawText(line, {
                        x: LEFT_MARGIN + 20, // Indent
                        y,
                        size: TEXT_SIZES.details,
                        font: helvetica, // Italic if we had it, but helvetica is fine
                        color: rgb(0.3, 0.3, 0.3),
                    });
                    y -= LINE_HEIGHTS.details;
                });
            }

            // Spacing between items
            y -= 10;
        });
    }

    // Notes
    if (data.notes) {
        y -= 10;
        page.drawText('Notes :', {
            x: LEFT_MARGIN,
            y,
            size: TEXT_SIZES.normal,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });
        y -= LINE_HEIGHTS.normal;

        const noteLines = DocumentUtils.splitTextIntoLinesOptimized(data.notes, availableWidth);
        noteLines.forEach(line => {
            page.drawText(line, {
                x: LEFT_MARGIN,
                y,
                size: TEXT_SIZES.normal,
                font: helvetica,
                color: rgb(0, 0, 0),
            });
            y -= LINE_HEIGHTS.normal;
        });
    }

    // Next Appointment
    if (data.nextAppointment && data.nextAppointment.date) {
        y -= 20;
        const nextApptDate = new Date(data.nextAppointment.date).toLocaleDateString('fr-FR');
        page.drawText(`Prochain rendez-vous : ${nextApptDate}`, {
            x: LEFT_MARGIN,
            y,
            size: TEXT_SIZES.normal,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });
        y -= LINE_HEIGHTS.normal;

        if (data.nextAppointment.reason) {
            page.drawText(`Motif : ${data.nextAppointment.reason}`, {
                x: LEFT_MARGIN,
                y,
                size: TEXT_SIZES.normal,
                font: helvetica,
                color: rgb(0, 0, 0),
            });
            y -= LINE_HEIGHTS.normal;
        }
    }

    // Footer
    // Position at bottom
    const footerY = 100;

    // Line separator
    page.drawLine({
        start: { x: LEFT_MARGIN, y: footerY + 20 },
        end: { x: width - RIGHT_MARGIN, y: footerY + 20 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
    });

    page.drawText('Cette ordonnance est valable pour une durée de 3 mois à partir de la date de délivrance.', {
        x: LEFT_MARGIN,
        y: footerY,
        size: TEXT_SIZES.footer,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText('Signature du médecin :', {
        x: width - RIGHT_MARGIN - 150,
        y: footerY - 30,
        size: TEXT_SIZES.normal,
        font: helveticaBold,
        color: rgb(0, 0, 0),
    });

    page.drawLine({
        start: { x: width - RIGHT_MARGIN - 150, y: footerY - 50 },
        end: { x: width - RIGHT_MARGIN, y: footerY - 50 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    return await context.pdfDoc.save();
};
