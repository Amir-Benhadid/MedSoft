import React, { useMemo } from 'react';
import { Card } from '@/ui/components/ui/card';
import { cn } from '@/ui/lib/utils';
import { ScrollArea } from '@/ui/components/ui/scroll-area';

import { useConsultationStore } from '@/ui/store/consultationStore';
import { BILAN_CONFIGS } from './BilanDocuments';
import genericRecords from './medical_records_structured.json';
import { DocumentUtils } from './utils/DocumentUtils';

const DocumentPreview: React.FC<{ activeDocTab: string; selectedGenericTemplate?: string }> = ({ activeDocTab, selectedGenericTemplate }) => {
    // Connect directly to store for reactive updates
    const patient = useConsultationStore(state => state.patient);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);
    const rightEye = useConsultationStore(state => state.rightEye);
    const leftEye = useConsultationStore(state => state.leftEye);
    const overrides = useConsultationStore(state => state.documentOverrides);
    const treatments = useConsultationStore(state => state.prescriptions);

    // Derived data mapping
    const reportData = {
        ...clinicalExam,
        ...leftEye,
        ...rightEye,
        ...(overrides.report || {})
    };

    const glassesPrintData = {
        rightEye: rightEye,
        leftEye: leftEye,
        ...(overrides.glasses || {})
    };

    const contactLensesPrintData = {
        rightEye: rightEye,
        leftEye: leftEye,
        ...(overrides.contactLenses || {})
    };

    const workStopPrintData = overrides.workStop;
    const printBilanData = overrides.bilan;
    const printControlFlags = overrides.report;


    const renderBilanPreview = (title: string, fields: any[]) => (
        <div className="space-y-4 text-xs">
            <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">{title}</h4>
            <ul className="space-y-1 mt-2 list-none pl-0">
                {fields.map((field, idx) => field.checked && (
                    <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>{field.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    const getCheckedBilanFields = (type: string, configTitle: string, fieldLabels: Record<string, string>) => {
        const data = printBilanData?.[type];
        if (!data) return null;

        const checkedFields = Object.entries(data.selectedFields || {})
            .filter(([_, checked]) => checked)
            .map(([key]) => ({ label: fieldLabels[key] || key, checked: true }));

        const customFields = (data.customFields || []).map((f: string) => ({ label: f, checked: true }));

        const allFields = [...checkedFields, ...customFields];

        if (allFields.length === 0) return null;

        return renderBilanPreview(configTitle, allFields);
    };

    const renderDynamicBilan = (type: string) => {
        const config = BILAN_CONFIGS[type];
        if (!config) return null;

        const fieldLabels = config.fields.reduce((acc, f) => {
            acc[f.key] = f.label;
            return acc;
        }, {} as Record<string, string>);

        return getCheckedBilanFields(type, config.title, fieldLabels);
    };

    const renderGenericPreview = () => {
        if (!selectedGenericTemplate) return <div className="text-center italic text-slate-400">Aucun modèle sélectionné</div>;

        const config = genericRecords.find(r => r.Code === selectedGenericTemplate);
        if (!config) return null;

        const data = overrides.generic?.[selectedGenericTemplate] || {};

        return (
            <div className="space-y-4 text-xs">
                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">{config.Title}</h4>
                <div className="space-y-4 whitespace-pre-wrap">
                    <p className="italic text-slate-600 mb-2 border-b border-dashed pb-2">Données du document :</p>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="flex flex-col border p-2 rounded bg-slate-50">
                                <span className="font-bold text-[10px] text-slate-500 uppercase">{key}</span>
                                <span className="font-medium text-slate-900">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                    {Object.keys(data).length === 0 && <p className="text-slate-400 text-center py-4">Aucune donnée saisie</p>}
                </div>
            </div>
        );
    };

    const renderContactLenses = () => {
        if (!contactLensesPrintData) return null;

        const formatNumberWithSign = (value: string): string => {
            const num = parseFloat(value || '0');
            if (num === 0) return '0.00';
            return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
        };

        const rightLensType = contactLensesPrintData.rightEye.contactLensType || 'Sphérique';
        const leftLensType = contactLensesPrintData.leftEye.contactLensType || 'Sphérique';
        const rightIsSpherical = rightLensType === 'Sphérique';
        const leftIsSpherical = leftLensType === 'Sphérique';

        const rightRx = contactLensesPrintData.rightEye.sph ? contactLensesPrintData.rightEye : null;
        const leftRx = contactLensesPrintData.leftEye.sph ? contactLensesPrintData.leftEye : null;

        if (!rightRx && !leftRx) return null;

        return (
            <div className="space-y-4 text-xs font-mono">
                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">LENTILLES DE CONTACT</h4>

                <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr_1fr] gap-2 mb-2 font-bold text-[10px] text-slate-500 uppercase border-b pb-1">
                    <div></div>
                    <div>Sphère</div>
                    <div>{!rightIsSpherical && !leftIsSpherical ? 'Cylindre' : ''}</div>
                    <div>{!rightIsSpherical && !leftIsSpherical ? 'Axe' : ''}</div>
                    <div>Diam</div>
                    <div>Rayon</div>
                </div>

                {rightRx && (
                    <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr_1fr] gap-2 items-center py-1">
                        <div className="font-bold text-orange-600">OD</div>
                        <div>{formatNumberWithSign(rightRx.sph)}</div>
                        <div>
                            {!rightIsSpherical && rightRx.cyl && `${formatNumberWithSign(rightRx.cyl)}`}
                        </div>
                        <div>
                            {!rightIsSpherical && rightRx.axis && `${rightRx.axis}°`}
                        </div>
                        <div>{rightRx.diam ? `${rightRx.diam} mm` : '-'}</div>
                        <div>{rightRx.axis_k ? `${rightRx.axis_k} mm` : '-'}</div>
                    </div>
                )}
                {leftRx && (
                    <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr_1fr] gap-2 items-center py-1">
                        <div className="font-bold text-orange-600">OG</div>
                        <div>{formatNumberWithSign(leftRx.sph)}</div>
                        <div>
                            {!leftIsSpherical && leftRx.cyl && `${formatNumberWithSign(leftRx.cyl)}`}
                        </div>
                        <div>
                            {!leftIsSpherical && leftRx.axis && `${leftRx.axis}°`}
                        </div>
                        <div>{leftRx.diam ? `${leftRx.diam} mm` : '-'}</div>
                        <div>{leftRx.axis_k ? `${leftRx.axis_k} mm` : '-'}</div>
                    </div>
                )}

                {(rightLensType || leftLensType) && (
                    <div className="mt-4 pt-2 border-t border-dashed border-slate-200 space-y-1">
                        <div className="font-bold text-slate-700">Type :</div>
                        {rightRx && <div>OD: {rightLensType} {contactLensesPrintData.rightEye.lensBrand && `- ${contactLensesPrintData.rightEye.lensBrand}`}</div>}
                        {leftRx && <div>OG: {leftLensType} {contactLensesPrintData.leftEye.lensBrand && `- ${contactLensesPrintData.leftEye.lensBrand}`}</div>}
                    </div>
                )}
            </div>
        );
    };

    const renderRadiographyPreview = () => {
        const data = overrides['radiography_dynamic'];
        if (!data) return <div className="text-center italic text-slate-400">Aucune donnée</div>;

        const docTitle = data.templateTitle ? data.templateTitle.toUpperCase() : 'PROTOCOLE OPHTALMOLOGIQUE';

        const renderLines = (lines: any[]) => (
            <div className="space-y-2">
                {lines.map((line: any) => line.title || line.content ? (
                    <div key={line.id}>
                        {line.title && <span className="font-bold">{line.title}: </span>}
                        <span>{line.content}</span>
                    </div>
                ) : null)}
            </div>
        );

        return (
            <div className="space-y-4 text-xs">
                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">{docTitle}</h4>

                {data.eyeTreatment === 'same' ? (
                    <div className="space-y-2">
                        {renderLines(data.bothLines)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.odLines?.length > 0 && (
                            <div>
                                <div className="font-bold text-blue-600 mb-1 border-b border-blue-100">OD</div>
                                {renderLines(data.odLines)}
                            </div>
                        )}
                        {data.ogLines?.length > 0 && (
                            <div>
                                <div className="font-bold text-green-600 mb-1 border-b border-green-100">OG</div>
                                {renderLines(data.ogLines)}
                            </div>
                        )}
                    </div>
                )}

                {data.conclusion && data.conclusion.length > 0 && (
                    <div className="pt-4 border-t border-dashed mt-4">
                        <div className="font-bold mb-1">Conclusion / Résumé</div>
                        {data.conclusion.filter((c: string) => c).length === 1 ? (
                            <p>{data.conclusion.find((c: string) => c)}</p>
                        ) : (
                            <ul className="list-disc pl-4 space-y-1">
                                {data.conclusion.map((c: string, i: number) => c && <li key={i}>{c}</li>)}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="h-full bg-slate-50 border-slate-200 overflow-hidden flex flex-col shadow-inner">
            <div className="p-2 border-b border-slate-100 bg-white/50 text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
                <span>Aperçu du document</span>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="max-w-full mx-auto bg-white p-6 shadow-sm border border-slate-100 min-h-[500px] text-slate-800 flex flex-col">

                    {/* Content */}
                    <div className="space-y-6 flex-1">
                        {activeDocTab === 'contacts' && renderContactLenses()}

                        {activeDocTab.startsWith('bilan') && renderDynamicBilan(activeDocTab.replace('bilan', '').toLowerCase())}

                        {activeDocTab === 'generic' && renderGenericPreview()}

                        {activeDocTab === 'radiography' && renderRadiographyPreview()}

                        {activeDocTab === 'workStop' && workStopPrintData && (
                            <div className="text-xs space-y-4">
                                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">ARRÊT DE TRAVAIL</h4>
                                <p>
                                    Je certifie que le(a) patient(e) sus-nommé(e) présente un état oculaire nécessitant un arrêt de travail :
                                </p>
                                <div className="pl-4 border-l-2 border-slate-100 space-y-2">
                                    <div className="flex gap-2">
                                        <span className="font-semibold w-24">Du :</span>
                                        <span>{workStopPrintData.startDate ? new Date(workStopPrintData.startDate).toLocaleDateString('fr-FR') : '...'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold w-24">Au :</span>
                                        <span>{workStopPrintData.endDate ? new Date(workStopPrintData.endDate).toLocaleDateString('fr-FR') : '...'}</span>
                                    </div>
                                    <div className="flex gap-2 text-slate-500 italic">
                                        {workStopPrintData.exitAuthorized ? 'Sortie autorisée' : 'Sortie non-autorisée'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeDocTab === 'report' && reportData && (
                            <div className="text-xs space-y-4">
                                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">COMPTE RENDU</h4>

                                {(reportData.generalMedicalHistory || reportData.ophthalmologicalHistory) && (
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-700">Antécédents :</div>
                                        <p>{[reportData.generalMedicalHistory, reportData.ophthalmologicalHistory].filter(Boolean).join(', ')}</p>
                                    </div>
                                )}

                                {reportData.inspection && (
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-700">Inspection :</div>
                                        <p>{reportData.inspection}</p>
                                    </div>
                                )}

                                {(printControlFlags?.includeVisualAcuityWithoutCorrection || printControlFlags?.includeVisualAcuityWithCorrection) && (
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2 rounded">
                                        {printControlFlags?.includeVisualAcuityWithoutCorrection && (
                                            <div>
                                                <div className="font-semibold mb-1 text-slate-700">Sans Correction</div>
                                                <div>OD: {reportData.printVisualAcuityVL_SC_OD || reportData.visualAcuityVL_SC_OD || '-'}</div>
                                                <div>OG: {reportData.printVisualAcuityVL_SC_OG || reportData.visualAcuityVL_SC_OG || '-'}</div>
                                            </div>
                                        )}
                                        {printControlFlags?.includeVisualAcuityWithCorrection && (
                                            <div>
                                                <div className="font-semibold mb-1 text-slate-700">Avec Correction</div>
                                                <div>OD: {reportData.printVisualAcuityVL_AC_OD || reportData.visualAcuityVL_AC_OD || '-'}</div>
                                                <div>OG: {reportData.printVisualAcuityVL_AC_OG || reportData.visualAcuityVL_AC_OG || '-'}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {printControlFlags?.includeTonometry && (
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-700">Tonométrie :</div>
                                        <div className="flex gap-4">
                                            <span>OD: {reportData.tonometryOD || '-'} mmHg</span>
                                            <span>OG: {reportData.tonometryOG || '-'} mmHg</span>
                                        </div>
                                    </div>
                                )}

                                {reportData.segmentAnterieur && (
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-700">Segment Antérieur :</div>
                                        <p>{reportData.segmentAnterieur}</p>
                                    </div>
                                )}

                                {reportData.fondOeil && (
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-700">Fond d'œil :</div>
                                        <p>{reportData.fondOeil}</p>
                                    </div>
                                )}

                                {reportData.conclusion && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="font-semibold text-slate-900">Conclusion :</div>
                                        <p>{reportData.conclusion}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeDocTab === 'glasses' && glassesPrintData && (
                            <div className="text-xs space-y-4">
                                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">Correction Optique</h4>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr] gap-2 font-bold text-[10px] text-slate-500 uppercase border-b pb-1">
                                        <div></div>
                                        <div>Sph</div>
                                        <div>Cyl</div>
                                        <div>Axe</div>
                                        <div>Add</div>
                                    </div>
                                    <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr] gap-2 items-center">
                                        <div className="font-bold text-blue-600">OD</div>
                                        <div>{glassesPrintData.rightEye.sph}</div>
                                        <div>{glassesPrintData.rightEye.cyl}</div>
                                        <div>{glassesPrintData.rightEye.axis}°</div>
                                        <div>{glassesPrintData.rightEye.add}</div>
                                    </div>
                                    <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr] gap-2 items-center">
                                        <div className="font-bold text-blue-600">OG</div>
                                        <div>{glassesPrintData.leftEye.sph}</div>
                                        <div>{glassesPrintData.leftEye.cyl}</div>
                                        <div>{glassesPrintData.leftEye.axis}°</div>
                                        <div>{glassesPrintData.leftEye.add}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeDocTab === 'medications' && treatments && treatments.length > 0 && (
                            <div className="text-xs space-y-4">
                                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">ORDONNANCE MÉDICALE</h4>
                                <div className="space-y-4">
                                    {treatments.map((t: any, idx: number) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] text-slate-500">{idx + 1}</span>
                                                {t.name}
                                            </div>
                                            <div className="pl-6 text-slate-600 text-[11px] italic">
                                                {[t.dosage, t.frequency, t.duration].filter(Boolean).join(' - ')}
                                            </div>
                                            {t.instructions && <div className="pl-6 text-slate-500 text-[10px]">{t.instructions}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeDocTab === 'visualAcuity' && overrides.visualAcuityCertificate && (
                            <div className="text-xs space-y-4">
                                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">CERTIFICAT D'ACUITÉ VISUELLE</h4>
                                <p className="mb-4 text-slate-600 italic">Je soussigné, certifie que l'examen de la vue de ce jour a révélé:</p>

                                {overrides.visualAcuityCertificate.includeRaw !== false && (
                                    <div className="space-y-2">
                                        <div className="font-bold text-slate-700 text-[11px]">Sans Correction</div>
                                        <div className="grid grid-cols-2 gap-4 pl-3 border-l-2 border-slate-200">
                                            <div>OD: <span className="font-mono">{overrides.visualAcuityCertificate.rightEye?.raw || '-'}</span></div>
                                            <div>OG: <span className="font-mono">{overrides.visualAcuityCertificate.leftEye?.raw || '-'}</span></div>
                                        </div>
                                    </div>
                                )}

                                {overrides.visualAcuityCertificate.includeCorrection !== false && (
                                    <div className="space-y-2 mt-4">
                                        <div className="font-bold text-slate-700 text-[11px]">Avec Correction</div>
                                        <div className="grid grid-cols-2 gap-4 pl-3 border-l-2 border-blue-200 bg-blue-50/30 p-2 rounded-r">
                                            <div>OD: <span className="font-mono">{overrides.visualAcuityCertificate.rightEye?.correction || '-'}</span></div>
                                            <div>OG: <span className="font-mono">{overrides.visualAcuityCertificate.leftEye?.correction || '-'}</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeDocTab === 'absence' && overrides.absenceCertificate && (
                            <div className="text-xs space-y-4">
                                <h4 className="font-bold border-b pb-1 text-slate-800 uppercase text-xs">CERTIFICAT D'ABSENCE</h4>
                                <div className="space-y-4">
                                    <p>Je soussigné, certifie que l'état de santé du patient nécessite un repos médical.</p>
                                    <div className="bg-amber-50 p-3 rounded border border-amber-100 text-amber-900 space-y-2">
                                        <div className="font-semibold text-[11px] uppercase tracking-wide text-amber-700">Motif</div>
                                        <div>{overrides.absenceCertificate.reason}</div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-amber-100/50 mt-2">
                                            <div>
                                                <span className="text-amber-700 text-[10px] uppercase block">Du</span>
                                                {overrides.absenceCertificate.startDate}
                                            </div>
                                            <div>
                                                <span className="text-amber-700 text-[10px] uppercase block">Au</span>
                                                {overrides.absenceCertificate.endDate}
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <span className="text-amber-700 text-[10px] uppercase block">Durée</span>
                                            <span className="font-bold">{overrides.absenceCertificate.daysCount} jours</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Signature Placeholder */}
                    <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center flex-none">
                        Document généré le {new Date().toLocaleString('fr-FR')} - Logiciel Ophtalmologie
                    </div>

                </div>
            </ScrollArea>
        </Card>
    );

    // Helper functions can be defined outside or inside render, but since renderRadiographyPreview accesses hooks data, it should be inside or passed props.
    // However, since we are inside the component body, we can define it here.
};

// ... inside render function ... 
// Wait, REPLACE CONTENT strategy: I need to insert `renderRadiographyPreview` definition before `return` and add the call inside JSX.
// Since the file is large, I'll use multi-replace or careful single replace.
// I'll add the render function first.


export default DocumentPreview;
