import React from 'react';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';

// Types
interface BilanFieldsBase {
	customFields: string[];
}

interface BilanPreOpFields extends BilanFieldsBase {
	groupage: boolean;
	fnsTP: boolean;
	ionogramme: boolean;
	glycemie: boolean;
	ureeCreatinine: boolean;
	bilanHepatique: boolean;
	ecgCardiologie: boolean;
}

interface BilanDiabeteFields extends BilanFieldsBase {
	glycemieJeun: boolean;
	glycemiePostPrandiale: boolean;
	hbA1c: boolean;
	cholesterol: boolean;
	triglycerides: boolean;
}

interface BilanInflammatoireFields extends BilanFieldsBase {
	fns: boolean;
	crp: boolean;
	fibrinogene: boolean;
	vs: boolean;
	electrophorese: boolean;
}

interface BilanUveiteFields extends BilanFieldsBase {
	fns: boolean;
	vsCrp: boolean;
	electrophorese: boolean;
	toxoplasmose: boolean;
	idrTuberculine: boolean;
	aslo: boolean;
	hlaB27: boolean;
	radioThorax: boolean;
}

interface InternalBilanFields {
	bilanPreOp: BilanPreOpFields;
	bilanDiabete: BilanDiabeteFields;
	bilanInflammatoire: BilanInflammatoireFields;
	bilanUveite: BilanUveiteFields;
}

type BilanType = 'bilanPreOp' | 'bilanDiabete' | 'bilanInflammatoire' | 'bilanUveite';

interface BilanDocumentProps {
	bilanType: BilanType;
	bilanFields: InternalBilanFields;
	handleBilanFieldChange: (
		bilanType: BilanType,
		field: string,
		value: boolean
	) => void;
	customFieldInputs: Record<BilanType, string>;
	setCustomFieldInputs: React.Dispatch<React.SetStateAction<Record<BilanType, string>>>;
	handleAddCustomField: (bilanType: BilanType) => void;
	handleRemoveCustomField: (bilanType: BilanType, index: number) => void;
	printBilanFields: InternalBilanFields;
	handlePrintBilanFieldChange: (
		bilanType: BilanType,
		field: string,
		value: boolean
	) => void;
	printCustomFieldInputs: Record<BilanType, string>;
	setPrintCustomFieldInputs: React.Dispatch<React.SetStateAction<Record<BilanType, string>>>;
	handleAddPrintCustomField: (bilanType: BilanType) => void;
	handleRemovePrintCustomField: (bilanType: BilanType, index: number) => void;
}

// PDF Generation Constants
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TEXT_SIZES = {
	title: 11,
	sectionHeader: 10,
	normal: 10,
	small: 10,
	tiny: 10,
};
const LINE_HEIGHTS = {
	title: 20,
	sectionHeader: 16,
	normal: 14,
	small: 12,
	header: 18,
};

// PDF Generation Function
export const generateBilanPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	documentType: BilanType,
	printBilanFields?: InternalBilanFields
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	const bilanTitles = {
		bilanPreOp: 'BILAN',
		bilanDiabete: 'BILAN',
		bilanInflammatoire: 'BILAN',
		bilanUveite: 'BILAN',
	};

	let y = drawTitle(context, bilanTitles[documentType], drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Main statement - split into multiple lines for better formatting
	const mainStatementText = "Prière faire:";
	const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
	const mainStatementLines = DocumentUtils.splitTextIntoLinesOptimized(
		mainStatementText,
		availableWidth
	);

	mainStatementLines.forEach((line) => {
		page.drawText(line, {
			x: LEFT_MARGIN + 20,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0), // Black text
		});
		y -= LINE_HEIGHTS.normal;
	});
	y -= 10;



	if (printBilanFields && printBilanFields[documentType]) {

		// Draw predefined fields
		const config = bilanConfigs[documentType];
		Object.entries(printBilanFields[documentType]).forEach(
			([exam, requested]) => {
				if (requested && typeof requested === 'boolean') {
					// Find the label for this field key
					const fieldConfig = config.fields.find(field => field.key === exam);
					const displayText = fieldConfig ? fieldConfig.label : exam;

					page.drawText('-', {
						x: LEFT_MARGIN + 20,
						y,
						size: TEXT_SIZES.normal,
						font: helvetica,
						color: rgb(0, 0, 0), // Black text
					});
					page.drawText(displayText, {
						x: LEFT_MARGIN + 35,
						y,
						size: TEXT_SIZES.normal,
						font: helvetica,
						color: rgb(0, 0, 0), // Black text
					});
					y -= LINE_HEIGHTS.normal;
				}
			}
		);

		// Draw custom fields - same style as predefined fields
		const customFields = printBilanFields[documentType].customFields;
		if (customFields && customFields.length > 0) {
			customFields.forEach((customExam) => {
				page.drawText('-', {
					x: LEFT_MARGIN + 20,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0), // Black text
				});
				page.drawText(customExam, {
					x: LEFT_MARGIN + 35,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0), // Black text
				});
				y -= LINE_HEIGHTS.normal;
			});
		}
	}

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// Field configurations for each bilan type
const bilanConfigs = {
	bilanPreOp: {
		title: 'Bilan Pré-Opératoire',
		fields: [
			{ key: 'groupage', label: 'Groupage' },
			{ key: 'fnsTP', label: 'FNS - TP' },
			{ key: 'ionogramme', label: 'Ionogramme sanguin' },
			{ key: 'glycemie', label: 'Glycémie à jeun' },
			{ key: 'ureeCreatinine', label: 'Urée - Créatinine' },
			{ key: 'bilanHepatique', label: 'Bilan hépatique' },
			{ key: 'ecgCardiologie', label: 'ECG - avis de Cardiologie' },
		],
	},
	bilanDiabete: {
		title: 'Bilan de Diabète',
		fields: [
			{ key: 'glycemieJeun', label: 'Glycémie à jeun' },
			{ key: 'glycemiePostPrandiale', label: 'Glycémie post-prandiale' },
			{ key: 'hbA1c', label: 'HbA1c' },
			{ key: 'cholesterol', label: 'Cholestérol sanguin' },
			{ key: 'triglycerides', label: 'Triglycérides' },
		],
	},
	bilanInflammatoire: {
		title: 'Bilan Inflammatoire',
		fields: [
			{ key: 'fns', label: 'FNS' },
			{ key: 'crp', label: 'CRP' },
			{ key: 'fibrinogene', label: 'Fibrinogène' },
			{ key: 'vs', label: 'VS' },
			{ key: 'electrophorese', label: 'Électrophorèse des protéines' },
		],
	},
	bilanUveite: {
		title: "Bilan d'Uvéite",
		fields: [
			{ key: 'fns', label: 'FNS' },
			{ key: 'vsCrp', label: 'VS - CRP' },
			{ key: 'electrophorese', label: 'Électrophorèse de protéines' },
			{ key: 'toxoplasmose', label: 'Toxoplasmose' },
			{ key: 'idrTuberculine', label: 'IDR à la tuberculine' },
			{ key: 'aslo', label: 'ASLO' },
			{ key: 'typageHla', label: 'Typage HLA B5, B27, B12' },
			{ key: 'vdrlTpha', label: 'VDRL, TPHA' },
			{ key: 'serologie', label: 'Sérologie (Ag HBs, HIV…)' },
			{ key: 'radioThorax', label: 'Radio du thorax, des sacro-iliaques' },
		],
	},
};

// UI Component
const BilanDocument: React.FC<BilanDocumentProps> = ({
	bilanType,
	bilanFields,
	handleBilanFieldChange,
	customFieldInputs,
	setCustomFieldInputs,
	handleAddCustomField,
	handleRemoveCustomField,
	printBilanFields,
	handlePrintBilanFieldChange,
	printCustomFieldInputs,
	setPrintCustomFieldInputs,
	handleAddPrintCustomField,
	handleRemovePrintCustomField,
}) => {
	const config = bilanConfigs[bilanType];

	// Update print data when bilan fields change
	const bilanFieldsRef = React.useRef(bilanFields);

	React.useEffect(() => {
		// Only update if bilanFields actually changed
		if (JSON.stringify(bilanFieldsRef.current[bilanType]) === JSON.stringify(bilanFields[bilanType])) {
			return;
		}

		bilanFieldsRef.current = bilanFields;

		// Copy current fields to print fields
		Object.keys(bilanFields[bilanType]).forEach((field) => {
			if (field !== 'customFields') {
				handlePrintBilanFieldChange(
					bilanType,
					field,
					(bilanFields[bilanType][field as keyof typeof bilanFields[typeof bilanType]] as unknown) as boolean
				);
			}
		});
	}, [bilanFields, bilanType, handlePrintBilanFieldChange]);

	return (
		<div className="space-y-4 font-sans text-sm pb-8">
			<div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
				<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
					<div className="p-1.5 bg-indigo-50 rounded-md">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
					</div>
					<div>
						<h4 className="font-bold text-slate-800 text-sm uppercase">{config.title}</h4>
						<p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Sélectionnez les examens à inclure</p>
					</div>
				</div>

				<div className="space-y-3">
					{/* Standard Fields Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{config.fields.map((field) => (
							<div key={field.key} className="flex items-start gap-2.5 p-2 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
								<Checkbox
									id={`field-${bilanType}-${field.key}`}
									checked={(printBilanFields[bilanType][field.key as keyof typeof printBilanFields[typeof bilanType]] as unknown) as boolean}
									onCheckedChange={(checked) =>
										handlePrintBilanFieldChange(
											bilanType,
											field.key,
											checked as boolean
										)
									}
									className="mt-0.5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 border-slate-300"
								/>
								<Label
									htmlFor={`field-${bilanType}-${field.key}`}
									className="text-xs font-bold text-slate-600 uppercase tracking-tight cursor-pointer select-none leading-relaxed"
								>
									{field.label}
								</Label>
							</div>
						))}
					</div>

					{/* Custom Fields Section */}
					{(printCustomFieldInputs[bilanType].trim() || printBilanFields[bilanType].customFields.length > 0) && (
						<div className="pt-2 border-t border-slate-100 border-dashed mt-2 space-y-3">
							<Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Examens personnalisés</Label>

							{/* List of added custom fields */}
							<div className="space-y-2">
								{printBilanFields[bilanType].customFields.map((customField, index) => (
									<div key={index} className="flex items-center gap-2 p-2 bg-indigo-50/30 rounded-md border border-indigo-100/50 group">
										<Checkbox checked={true} disabled className="data-[state=checked]:bg-indigo-400 data-[state=checked]:border-indigo-400 opacity-70" />
										<span className="text-xs font-bold text-slate-700 uppercase tracking-tight flex-1">{customField}</span>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleRemovePrintCustomField(bilanType, index)}
											className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
										>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									</div>
								))}
							</div>

							{/* Add new custom field input */}
							<div className="flex gap-2">
								<Input
									placeholder="Ajouter un examen..."
									value={printCustomFieldInputs[bilanType]}
									onChange={(e) =>
										setPrintCustomFieldInputs((prev) => ({
											...prev,
											[bilanType]: e.target.value,
										}))
									}
									className="h-8 text-xs font-bold text-slate-900 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
									onKeyDown={(e) => {
										if (e.key === 'Enter' && printCustomFieldInputs[bilanType].trim()) {
											e.preventDefault();
											handleAddPrintCustomField(bilanType);
										}
									}}
								/>
								<Button
									size="sm"
									onClick={() => handleAddPrintCustomField(bilanType)}
									disabled={!printCustomFieldInputs[bilanType].trim()}
									className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-tight"
								>
									<Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter
								</Button>
							</div>
						</div>
					)}

					{/* Add button when list is empty to encourage interaction */}
					{!printCustomFieldInputs[bilanType].trim() && printBilanFields[bilanType].customFields.length === 0 && (
						<div className="pt-2 border-t border-slate-100 border-dashed mt-2">
							<div className="flex gap-2">
								<Input
									placeholder="Ajouter un examen personnalisé..."
									value={printCustomFieldInputs[bilanType]}
									onChange={(e) =>
										setPrintCustomFieldInputs((prev) => ({
											...prev,
											[bilanType]: e.target.value,
										}))
									}
									className="h-8 text-xs font-medium text-slate-600 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
								/>
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleAddPrintCustomField(bilanType)}
									disabled={!printCustomFieldInputs[bilanType].trim()}
									className="h-8 px-3 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
								>
									<Plus className="h-3.5 w-3.5" />
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default BilanDocument;
