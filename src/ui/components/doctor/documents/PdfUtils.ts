import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PdfGenerationContext {
	pdfDoc: PDFDocument;
	page: any;
	width: number;
	height: number;
	helvetica: any;
	helveticaBold: any;
	LEFT_MARGIN: number;
	RIGHT_MARGIN: number;
	TEXT_SIZES: {
		title: number;
		header: number;
		sectionHeader: number;
		normal: number;
		small: number;
		tiny: number;
	};
	LINE_HEIGHTS: {
		title: number;
		header: number;
		sectionHeader: number;
		normal: number;
		small: number;
		tiny: number;
	};
}

export const createPdfContext = async (): Promise<PdfGenerationContext> => {
	const pdfDoc = await PDFDocument.create();
	let page = pdfDoc.addPage([420, 595]); // A5
	const { width, height } = page.getSize();

	// Embed fonts
	const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	// Constants for margins and text sizes
	const LEFT_MARGIN = 60.35; // 1cm in points (1cm = 28.35 points)
	const RIGHT_MARGIN = 30;
	const TEXT_SIZES = {
		title: 10,
		header: 11, // Increased by 1 for patient name/age
		sectionHeader: 10,
		normal: 11,
		small: 9,
		tiny: 8,
	};
	const LINE_HEIGHTS = {
		title: 35,
		header: 20,
		sectionHeader: 18,
		normal: 15,
		small: 12,
		tiny: 10,
	};

	return {
		pdfDoc,
		page,
		width,
		height,
		helvetica,
		helveticaBold,
		LEFT_MARGIN,
		RIGHT_MARGIN,
		TEXT_SIZES,
		LINE_HEIGHTS,
	};
};

export const drawTitle = (context: PdfGenerationContext, title: string, yPos: number) => {
	const { page, width, helveticaBold, TEXT_SIZES, LINE_HEIGHTS } = context;
	
	page.drawText(title, {
		x: width / 2 - title.length * 3, // Better centering calculation
		y: yPos,
		size: TEXT_SIZES.title,
		font: helveticaBold,
		color: rgb(0, 0, 0), // Black text
	});
	return yPos - LINE_HEIGHTS.title;
};

export const drawDocumentHeader = (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	calculateAge: (dob: string) => number
) => {
	const { page, width, height, helvetica, helveticaBold, LEFT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;
	
	// Date on first line
	const dateText = `${new Date().toLocaleDateString('fr-FR')}`;
	page.drawText(dateText, {
		x: width - 90,
		y: height - 10,
		size: TEXT_SIZES.header,
		font: helvetica,
		color: rgb(0, 0, 0),
	});

	// Patient name and age on the line below
	page.drawText(
		`${patient.surname} ${patient.name}, ${
			calculateAge(patient.dob) === 1
				? '1 an'
				: `${calculateAge(patient.dob)} ans`
		}`,
		{
			x: LEFT_MARGIN,
			y: height - 10 - LINE_HEIGHTS.header,
			size: TEXT_SIZES.header,
			font: helveticaBold,
			color: rgb(0, 0, 0),
		}
	);

	return height - 90; // Return new y position after header
};
