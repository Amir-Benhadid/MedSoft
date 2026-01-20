import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Label } from '@/ui/components/ui/label';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Plus, X, FileText } from 'lucide-react';
import DebouncedTextField from './utils/DebouncedTextField';
import { Card } from '@/ui/components/ui/card';
import { useConsultationStore } from '@/ui/store/consultationStore';

// --- Configuration Types ---

export interface BilanFieldConfig {
    key: string;
    label: string;
    defaultValue?: boolean;
}

export interface BilanConfig {
    id: string;
    title: string;
    fields: BilanFieldConfig[];
}

export const BILAN_CONFIGS: Record<string, BilanConfig> = {
    'preop': {
        id: 'preop',
        title: 'BILAN PRÉ-OPÉRATOIRE',
        fields: [
            { key: 'echoB', label: 'Echographie B' },
            { key: 'biometrie', label: 'Biométrie' },
            { key: 'microscopieSpeculaire', label: 'Microscopie spéculaire' },
            { key: 'octMaculaire', label: 'OCT Maculaire' },
            { key: 'octPapillaire', label: 'OCT Papillaire' },
            { key: 'topographieCorneenne', label: 'Topographie Cornéenne' },
            { key: 'champVisuel', label: 'Champ Visuel' },
            { key: 'retinographie', label: 'Rétinographie' },
        ]
    },
    'diabete': {
        id: 'diabete',
        title: 'BILAN DIABÈTE',
        fields: [
            { key: 'fo', label: 'Fond d\'œil (FO)' },
            { key: 'octMaculaire', label: 'OCT Maculaire' },
            { key: 'retinographie', label: 'Rétinographie' },
            { key: 'angioOct', label: 'Angio-OCT' },
            { key: 'angiographie', label: 'Angiographie à la fluorescéine' },
        ]
    },
    'inflammatoire': {
        id: 'inflammatoire',
        title: 'BILAN INFLAMMATOIRE',
        fields: [
            { key: 'fo', label: 'Fond d\'œil (FO)' },
            { key: 'octMaculaire', label: 'OCT Maculaire' },
            { key: 'angiographie', label: 'Angiographie' },
            { key: 'angioOct', label: 'Angio-OCT' },
            { key: 'champVisuel', label: 'Champ Visuel' },
            { key: 'topographie', label: 'Topographie' },
        ]
    },
    'uveite': {
        id: 'uveite',
        title: 'BILAN UVÉITE',
        fields: [
            { key: 'fo', label: 'Fond d\'œil (FO)' },
            { key: 'octMaculaire', label: 'OCT Maculaire' },
            { key: 'angiographie', label: 'Angiographie' },
            { key: 'laserFlare', label: 'Laser Flare Meter' },
            { key: 'radioThorax', label: 'Radio Thorax / TDM' },
            { key: 'biologie', label: 'Bilan Biologique (VS, CRP, etc)' },
        ]
    },
    'cardio': {
        id: 'cardio',
        title: 'BILAN CARDIO-VASCULAIRE',
        fields: [
            { key: 'ecg', label: 'ECG' },
            { key: 'echoCoeur', label: 'Echographie Cardiaque' },
            { key: 'dopplerTsa', label: 'Doppler des TSA' },
            { key: 'avisCardio', label: 'Avis Cardiologique' },
            { key: 'holter', label: 'Holter Tensionnel' },
            { key: 'mapa', label: 'MAPA' }
        ]
    },
    'cnas': {
        id: 'cnas',
        title: 'DOSSIER CNAS',
        fields: [
            { key: 'ficheRenseignement', label: 'Fiche de Renseignement' },
            { key: 'rapportMedical', label: 'Rapport Médical' },
            { key: 'ordonnance', label: 'Ordonnance' },
            { key: 'oct', label: 'OCT' },
            { key: 'cv', label: 'Champ Visuel' },
            { key: 'facture', label: 'Facture Proforma' }
        ]
    },
    'ctf': {
        id: 'ctf',
        title: 'BILAN FONCTIONNEL (CTF)',
        fields: [
            { key: 'cv', label: 'Champ Visuel' },
            { key: 'visionCouleurs', label: 'Vision des Couleurs' },
            { key: 'erg', label: 'ERG' },
            { key: 'eog', label: 'EOG' },
            { key: 'pev', label: 'PEV' },
            { key: 'microperimetrie', label: 'Microperimétrie' }
        ]
    },
    'biometrie': {
        id: 'biometrie',
        title: 'BILAN BIOMÉTRIE',
        fields: [
            { key: 'biometrie', label: 'Biométrie Optique' },
            { key: 'topographie', label: 'Topographie Cornéenne' },
            { key: 'comptageCellulaire', label: 'Comptage Cellulaire' },
            { key: 'oct', label: 'OCT Maculaire' }
        ]
    },
    'infectieux': {
        id: 'infectieux',
        title: 'BILAN INFECTIEUX',
        fields: [
            { key: 'prelevement', label: 'Prélèvement cornéen/conjonctival' },
            { key: 'pcr', label: 'PCR' },
            { key: 'biologie', label: 'NFS, CRP' }
        ]
    }
};

// --- Data Types ---

export interface BilanPrintData {
    selectedFields: Record<string, boolean>; // key -> boolean
    customFields: string[];
}

interface BilanDocumentProps {
    type: string; // 'preop', 'diabete', etc.
    printData: BilanPrintData;
    setPrintData: React.Dispatch<React.SetStateAction<BilanPrintData>>;
}

// --- PDF Generation ---

export const generateBilanPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    type: string,
    printData?: BilanPrintData,
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;
    const config = BILAN_CONFIGS[type];

    if (!config) throw new Error(`Unknown Bilan type: ${type}`);

    let y = drawTitle(context, config.title, drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    y -= LINE_HEIGHTS.normal;
    page.drawText('A faire :', {
        x: LEFT_MARGIN,
        y,
        size: TEXT_SIZES.sectionHeader,
        font: helveticaBold,
        color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHTS.normal * 1.5;

    // Draw Standard Fields
    config.fields.forEach(field => {
        if (printData?.selectedFields[field.key]) {
            // Draw checkbox square
            page.drawRectangle({
                x: LEFT_MARGIN,
                y: y,
                width: 10,
                height: 10,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            // Draw checkmark
            page.drawLine({
                start: { x: LEFT_MARGIN + 2, y: y + 5 },
                end: { x: LEFT_MARGIN + 4, y: y + 2 },
                color: rgb(0, 0, 0),
                thickness: 1,
            });
            page.drawLine({
                start: { x: LEFT_MARGIN + 4, y: y + 2 },
                end: { x: LEFT_MARGIN + 8, y: y + 8 },
                color: rgb(0, 0, 0),
                thickness: 1,
            });

            page.drawText(field.label, {
                x: LEFT_MARGIN + 20,
                y: y + 2,
                size: TEXT_SIZES.normal,
                font: helvetica,
                color: rgb(0, 0, 0),
            });
            y -= LINE_HEIGHTS.normal * 1.2;
        }
    });

    // Draw Custom Fields
    printData?.customFields.forEach(field => {
        page.drawRectangle({
            x: LEFT_MARGIN,
            y: y,
            width: 10,
            height: 10,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });
        // Checkmark
        page.drawLine({
            start: { x: LEFT_MARGIN + 2, y: y + 5 },
            end: { x: LEFT_MARGIN + 4, y: y + 2 },
            color: rgb(0, 0, 0),
            thickness: 1,
        });
        page.drawLine({
            start: { x: LEFT_MARGIN + 4, y: y + 2 },
            end: { x: LEFT_MARGIN + 8, y: y + 8 },
            color: rgb(0, 0, 0),
            thickness: 1,
        });

        page.drawText(field, {
            x: LEFT_MARGIN + 20,
            y: y + 2,
            size: TEXT_SIZES.normal,
            font: helvetica,
            color: rgb(0, 0, 0),
        });
        y -= LINE_HEIGHTS.normal * 1.2;
    });

    return await context.pdfDoc.save();
};

export const generateBilanCardioPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string }
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

    let y = drawTitle(context, "BILAN", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    // Description
    const descriptionText = "Cher(e) confrère Je vous adresse le(la) sus-nommé(e) que je dois opérer de catarcte pour avis cardiologique pré-opératoire - Intervention prévue sous anesthésie loco-régionale";
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

    return await context.pdfDoc.save();
};


// --- Component ---

const DEFAULT_BILAN_OVERRIDES: any = {};

const BilanDocument: React.FC<{ type: string }> = ({ type }) => {
    const config = BILAN_CONFIGS[type];
    const [newItem, setNewItem] = useState('');

    const allBilanOverrides = useConsultationStore(state => state.documentOverrides.bilan || DEFAULT_BILAN_OVERRIDES);
    const overrides = allBilanOverrides[type] || { selectedFields: {}, customFields: [] };
    const updateOverride = useConsultationStore(state => state.updateDocumentOverride);

    if (!config) return <div>Configuration introuvable pour {type}</div>;

    const toggleField = (key: string, checked: boolean) => {
        const newSelected = { ...overrides.selectedFields, [key]: checked };
        updateOverride('bilan', type, { ...overrides, selectedFields: newSelected });
    };

    const addCustomField = () => {
        if (newItem.trim()) {
            const newCustom = [...(overrides.customFields || []), newItem.trim()];
            updateOverride('bilan', type, { ...overrides, customFields: newCustom });
            setNewItem('');
        }
    };

    const removeCustomField = (index: number) => {
        const newCustom = [...(overrides.customFields || [])];
        newCustom.splice(index, 1);
        updateOverride('bilan', type, { ...overrides, customFields: newCustom });
    };

    return (
        <Card className="max-w-3xl mx-auto shadow-sm border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                        <h4 className="font-semibold text-slate-800">{config.title}</h4>
                        <p className="text-xs text-muted-foreground">Sélectionnez les examens à inclure</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {config.fields.map(field => (
                        <div key={field.key} className="flex items-start gap-3 p-3 rounded-md border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-all duration-200 group">
                            <Checkbox
                                id={field.key}
                                checked={!!overrides.selectedFields?.[field.key]}
                                onCheckedChange={(c) => toggleField(field.key, c as boolean)}
                                className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor={field.key}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-700 group-hover:text-slate-900"
                                >
                                    {field.label}
                                </Label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Examens supplémentaires</span>
                    </div>
                </div>

                <div className="space-y-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                    {overrides.customFields && overrides.customFields.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 mb-4">
                            {overrides.customFields.map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
                                    <Checkbox checked={true} disabled className="opacity-50" />
                                    <span className="flex-1 text-sm font-medium text-slate-700">{item}</span>
                                    <Button variant="ghost" size="sm" onClick={() => removeCustomField(index)} className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Saisir un autre examen..."
                            className="h-9 text-sm bg-white"
                            onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
                        />
                        <Button onClick={addCustomField} size="sm" className="h-9 px-4 gap-2 shadow-sm">
                            <Plus className="h-4 w-4" /> Ajouter
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default BilanDocument;
