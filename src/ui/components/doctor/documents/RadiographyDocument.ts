import { rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';

interface DynamicField {
    id: string;
    title: string;
    content: string;
}

interface RadiographyData {
    templateId: string | null;
    templateTitle?: string;
    eyeTreatment: 'same' | 'separate';
    bothLines: DynamicField[];
    odLines: DynamicField[];
    ogLines: DynamicField[];
    conclusion: string[];
}

// PDF Generation Constants
const TEXT_SIZES = {
    title: 9,
    header: 11,
    sectionHeader: 10,
    normal: 10,
    small: 8,
    tiny: 7,
};
const LINE_HEIGHTS = {
    title: 20,
    sectionHeader: 18,
    normal: 14,
    small: 12,
    header: 18,
    tiny: 10,
};

export const generateRadiographyPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    data?: RadiographyData
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN } = context;
    const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;

    // Override sizes for this document
    const originalTextSizes = { ...context.TEXT_SIZES };
    context.TEXT_SIZES = { ...originalTextSizes, ...TEXT_SIZES };

    // Determine Title
    const docTitle = data?.templateTitle ? data.templateTitle.toUpperCase() : 'PROTOCOLE OPHTALMOLOGIQUE';

    // Draw Header
    let y = drawTitle(context, docTitle, drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    if (!data) {
        // Empty document fallback
        page.drawText("Aucune donnée disponible.", { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
        return await context.pdfDoc.save();
    }

    // Helper to draw a section of fields
    const drawFields = (fields: DynamicField[]) => {
        fields.forEach(field => {
            if (!field.title && !field.content) return;

            const title = field.title ? `${field.title} : ` : '';
            const content = field.content || '';
            const fullText = title + content;

            // Simple handling: Title bold if possible, but for simplicity here we just print line by line
            // If we want bold title, we need to split drawing.

            if (field.title) {
                // Measure title width
                const titleWidth = helveticaBold.widthOfTextAtSize(title, TEXT_SIZES.normal);
                page.drawText(title, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helveticaBold, color: rgb(0, 0, 0) });

                // Draw content after title
                const remainingWidth = availableWidth - titleWidth;
                const contentLines = DocumentUtils.splitTextIntoLinesOptimized(content, remainingWidth);

                if (contentLines.length > 0) {
                    page.drawText(contentLines[0], { x: LEFT_MARGIN + titleWidth, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                    y -= LINE_HEIGHTS.normal;

                    // Draw remaining lines indented? Or standard?
                    for (let i = 1; i < contentLines.length; i++) {
                        page.drawText(contentLines[i], { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                        y -= LINE_HEIGHTS.normal;
                    }
                } else {
                    y -= LINE_HEIGHTS.normal;
                }
            } else {
                // No title, just content
                const lines = DocumentUtils.splitTextIntoLinesOptimized(content, availableWidth);
                lines.forEach(line => {
                    page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                    y -= LINE_HEIGHTS.normal;
                });
            }
        });
    };

    if (data.eyeTreatment === 'same') {
        // Just print fields directly
        drawFields(data.bothLines);
    } else {
        // Separate Mode
        const hasOD = data.odLines && data.odLines.length > 0 && data.odLines.some(f => f.title || f.content);
        const hasOG = data.ogLines && data.ogLines.length > 0 && data.ogLines.some(f => f.title || f.content);

        if (hasOD) {
            y -= 10;
            page.drawText("OD", { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.sectionHeader;
            drawFields(data.odLines);
        }

        if (hasOG) {
            y -= 10; // Spacing
            if (hasOD) y -= 5;
            page.drawText("OG", { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.sectionHeader;
            drawFields(data.ogLines);
        }
    }

    // Conclusion
    const nonEmptyConclusion = data.conclusion ? data.conclusion.filter(c => c && c.trim() !== "") : [];
    if (nonEmptyConclusion.length > 0) {
        y -= 20; // Spacing before conclusion
        page.drawText("Conclusion / Résumé :", { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
        y -= LINE_HEIGHTS.sectionHeader;

        if (nonEmptyConclusion.length === 1) {
            const lines = DocumentUtils.splitTextIntoLinesOptimized(nonEmptyConclusion[0], availableWidth);
            lines.forEach(line => {
                page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.normal;
            });
        } else {
            nonEmptyConclusion.forEach(bullet => {
                const bulletText = `• ${bullet}`;
                const lines = DocumentUtils.splitTextIntoLinesOptimized(bulletText, availableWidth);
                lines.forEach(line => {
                    page.drawText(line, { x: LEFT_MARGIN + 10, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                    y -= LINE_HEIGHTS.normal;
                });
            });
        }
    }

    // Restore context
    context.TEXT_SIZES = originalTextSizes;
    return await context.pdfDoc.save();
};
