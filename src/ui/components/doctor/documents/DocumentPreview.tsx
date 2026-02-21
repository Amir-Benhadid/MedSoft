/**
 * DocumentPreview Component
 * 
 * Displays a preview of various medical documents including prescriptions, 
 * glasses, contact lenses, certificates, and medical reports.
 * 
 * @module DocumentPreview
 */

import React, { memo } from 'react';
import { Card, CardContent } from '@/ui/components/ui/card';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { cn } from '@/ui/lib/utils';
import { useDocumentPreview } from './hooks/useDocumentPreview';

interface DocumentPreviewProps {
    activeDocTab: string;
}

/**
 * DocumentPreview component implementation
 * 
 * @param props - Component props
 * @returns JSX element
 */
const DocumentPreview: React.FC<DocumentPreviewProps> = ({ activeDocTab }) => {
    // Get all preview data from hook
    const {
        patient,
        rightEyeData,
        leftEyeData,
        detailedClinicalExam,
        bilanFields,
        prescriptionData,
        absenceData,
        workStopData,
        reportData,
        printControlFlags,
        glassesPrintData,
        contactLensesPrintData,
        visualAcuityPrintData,
        absencePrintData,
        workStopPrintData,
        tonometrie,
    } = useDocumentPreview({ activeDocTab });

    // No accordion state needed - preview shows all medications fully expanded

    return (
        <ScrollArea className="h-full w-full">
            <div className="text-xs whitespace-pre-wrap text-foreground pr-2">
                {activeDocTab === 'bilanPreOp' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0 space-y-2">
                                {bilanFields?.bilanPreOp.groupage && (
                                    <p className="text-xs mb-2 font-semibold">Groupage</p>
                                )}
                                {bilanFields?.bilanPreOp.fnsTP && (
                                    <p className="text-xs mb-2 font-semibold">FNS - TP</p>
                                )}
                                {bilanFields?.bilanPreOp.ionogramme && (
                                    <p className="text-xs mb-2 font-semibold">Ionogramme sanguin</p>
                                )}
                                {bilanFields?.bilanPreOp.glycemie && (
                                    <p className="text-xs mb-2 font-semibold">Glycémie à jeun</p>
                                )}
                                {bilanFields?.bilanPreOp.ureeCreatinine && (
                                    <p className="text-xs mb-2 font-semibold">Urée - créatinine sanguines</p>
                                )}
                                {bilanFields?.bilanPreOp.bilanHepatique && (
                                    <p className="text-xs mb-2 font-semibold">Bilan hépatique</p>
                                )}
                                {bilanFields?.bilanPreOp.ecgCardiologie && (
                                    <p className="text-xs mb-2 font-semibold">ECG / Avis de cardiologie</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'bilanDiabete' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0 space-y-2">
                                {bilanFields?.bilanDiabete.glycemieJeun && (
                                    <p className="text-xs mb-2 font-semibold">Glycémie à jeun</p>
                                )}
                                {bilanFields?.bilanDiabete.glycemiePostPrandiale && (
                                    <p className="text-xs mb-2 font-semibold">Glycémie post-prandiale</p>
                                )}
                                {bilanFields?.bilanDiabete.hbA1c && (
                                    <p className="text-xs mb-2 font-semibold">HbA1c</p>
                                )}
                                {bilanFields?.bilanDiabete.cholesterol && (
                                    <p className="text-xs mb-2 font-semibold">Cholestérol sanguin</p>
                                )}
                                {bilanFields?.bilanDiabete.triglycerides && (
                                    <p className="text-xs mb-2 font-semibold">Triglycérides</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'bilanInflammatoire' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0 space-y-2">
                                {bilanFields?.bilanInflammatoire.fns && (
                                    <p className="text-xs mb-2 font-semibold">FNS</p>
                                )}
                                {bilanFields?.bilanInflammatoire.crp && (
                                    <p className="text-xs mb-2 font-semibold">CRP</p>
                                )}
                                {bilanFields?.bilanInflammatoire.fibrinogene && (
                                    <p className="text-xs mb-2 font-semibold">Fibrinogène</p>
                                )}
                                {bilanFields?.bilanInflammatoire.vs && (
                                    <p className="text-xs mb-2 font-semibold">VS</p>
                                )}
                                {bilanFields?.bilanInflammatoire.electrophorese && (
                                    <p className="text-xs mb-2 font-semibold">Électrophorèse</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'bilanUveite' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0 space-y-2">
                                {bilanFields?.bilanUveite.fns && (
                                    <p className="text-xs mb-2 font-semibold">FNS</p>
                                )}
                                {bilanFields?.bilanUveite.vsCrp && (
                                    <p className="text-xs mb-2 font-semibold">VS - CRP</p>
                                )}
                                {bilanFields?.bilanUveite.electrophorese && (
                                    <p className="text-xs mb-2 font-semibold">Électrophorèse</p>
                                )}
                                {bilanFields?.bilanUveite.toxoplasmose && (
                                    <p className="text-xs mb-2 font-semibold">Toxoplasmose</p>
                                )}
                                {bilanFields?.bilanUveite.idrTuberculine && (
                                    <p className="text-xs mb-2 font-semibold">IDR à la tuberculine</p>
                                )}
                                {bilanFields?.bilanUveite.aslo && (
                                    <p className="text-xs mb-2 font-semibold">ASLO</p>
                                )}
                                {bilanFields?.bilanUveite.typageHla && (
                                    <p className="text-xs mb-2 font-semibold">Typage HLA</p>
                                )}
                                {bilanFields?.bilanUveite.vdrlTpha && (
                                    <p className="text-xs mb-2 font-semibold">VDRL - TPHA</p>
                                )}
                                {bilanFields?.bilanUveite.serologie && (
                                    <p className="text-xs mb-2 font-semibold">Sérologie</p>
                                )}
                                {bilanFields?.bilanUveite.radioThorax && (
                                    <p className="text-xs mb-2 font-semibold">Radio de thorax</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'contacts' &&
                    ((printControlFlags?.includeRightEye !== false && contactLensesPrintData?.rightEye?.sph) ||
                        (printControlFlags?.includeLeftEye !== false && contactLensesPrintData?.leftEye?.sph)) && (
                        <div className="mt-1">
                            <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                                <CardContent className="p-0 space-y-2">
                                    <p className="text-xs mb-2 font-semibold">LENTILLES DE CONTACT</p>

                                    {(() => {
                                        /**
                                         * Formats a number with sign prefix
                                         * @param value - Number string to format
                                         * @returns Formatted string with sign
                                         */
                                        const formatNumberWithSign = (value: string | undefined | null): string => {
                                            if (!value || value === '__EMPTY__') return '-';
                                            const normalizedValue = value.toString().replace(',', '.');
                                            const num = parseFloat(normalizedValue);
                                            if (isNaN(num)) return value; // Show original if not a number
                                            if (num === 0) return '0.00';
                                            return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
                                        };

                                        // Use optional chaining and default to true if undefined, but respect false
                                        const showRightEye = printControlFlags?.includeRightEye !== false;
                                        const showLeftEye = printControlFlags?.includeLeftEye !== false;

                                        const rightContactRx = (showRightEye && contactLensesPrintData?.rightEye?.sph)
                                            ? {
                                                sphere: contactLensesPrintData.rightEye.sph,
                                                cylinder: contactLensesPrintData.rightEye.cyl,
                                                axis: contactLensesPrintData.rightEye.axis,
                                            }
                                            : null;

                                        const leftContactRx = (showLeftEye && contactLensesPrintData?.leftEye?.sph)
                                            ? {
                                                sphere: contactLensesPrintData.leftEye.sph,
                                                cylinder: contactLensesPrintData.leftEye.cyl,
                                                axis: contactLensesPrintData.leftEye.axis,
                                            }
                                            : null;

                                        const rightLensType = contactLensesPrintData?.rightEye?.contactLensType || 'Sphérique';
                                        const leftLensType = contactLensesPrintData?.leftEye?.contactLensType || 'Sphérique';
                                        const rightIsSpherical = rightLensType === 'Sphérique';
                                        const leftIsSpherical = leftLensType === 'Sphérique';

                                        return (
                                            <>
                                                {(rightContactRx || leftContactRx) && (
                                                    <div className="mb-3">
                                                        <div className="flex mb-2 text-xs font-semibold">
                                                            <div className="w-[60px]">Œil</div>
                                                            <div className="w-[80px]">Sphère</div>
                                                            {!rightIsSpherical && !leftIsSpherical && (
                                                                <>
                                                                    <div className="w-[80px]">Cylindre</div>
                                                                    <div className="w-[60px]">Axe</div>
                                                                </>
                                                            )}
                                                            <div className="w-[80px]">Diamètre</div>
                                                            <div className="w-[80px]">Rayon</div>
                                                        </div>

                                                        {rightContactRx && (
                                                            <div className="flex mb-2 text-xs p-1.5 bg-blue-50/30 rounded border border-blue-200">
                                                                <div className="w-[60px] font-medium text-blue-700">OD</div>
                                                                <div className="w-[80px]">{formatNumberWithSign(rightContactRx.sphere)} D</div>
                                                                {!rightIsSpherical && (
                                                                    <>
                                                                        <div className="w-[80px]">{formatNumberWithSign(rightContactRx.cylinder)} D</div>
                                                                        <div className="w-[60px]">{rightContactRx.axis}°</div>
                                                                    </>
                                                                )}
                                                                <div className="w-[80px]">{contactLensesPrintData?.rightEye?.diam || '-'} mm</div>
                                                                <div className="w-[80px]">{contactLensesPrintData?.rightEye?.axis_k || '-'} mm</div>
                                                            </div>
                                                        )}

                                                        {leftContactRx && (
                                                            <div className="flex mb-2 text-xs p-1.5 bg-green-50/30 rounded border border-green-200">
                                                                <div className="w-[60px] font-medium text-green-700">OG</div>
                                                                <div className="w-[80px]">{formatNumberWithSign(leftContactRx.sphere)} D</div>
                                                                {!leftIsSpherical && (
                                                                    <>
                                                                        <div className="w-[80px]">{formatNumberWithSign(leftContactRx.cylinder)} D</div>
                                                                        <div className="w-[60px]">{leftContactRx.axis}°</div>
                                                                    </>
                                                                )}
                                                                <div className="w-[80px]">{contactLensesPrintData?.leftEye?.diam || '-'} mm</div>
                                                                <div className="w-[80px]">{contactLensesPrintData?.leftEye?.axis_k || '-'} mm</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {((showRightEye && contactLensesPrintData?.rightEye?.contactLensType) ||
                                                    (showLeftEye && contactLensesPrintData?.leftEye?.contactLensType)) && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-semibold">Type de lentilles:</p>
                                                            {showRightEye && contactLensesPrintData?.rightEye?.contactLensType && (
                                                                <p className="text-xs p-1 bg-blue-50/30 rounded border border-blue-200 text-blue-700">OD: {contactLensesPrintData.rightEye.contactLensType}</p>
                                                            )}
                                                            {showLeftEye && contactLensesPrintData?.leftEye?.contactLensType && (
                                                                <p className="text-xs p-1 bg-green-50/30 rounded border border-green-200 text-green-700">OG: {contactLensesPrintData.leftEye.contactLensType}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                {((showRightEye && contactLensesPrintData?.rightEye?.lensBrand) ||
                                                    (showLeftEye && contactLensesPrintData?.leftEye?.lensBrand)) && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-semibold">Marque:</p>
                                                            {showRightEye && contactLensesPrintData?.rightEye?.lensBrand && (
                                                                <p className="text-xs p-1 bg-blue-50/30 rounded border border-blue-200 text-blue-700">OD: {contactLensesPrintData.rightEye.lensBrand}</p>
                                                            )}
                                                            {showLeftEye && contactLensesPrintData?.leftEye?.lensBrand && (
                                                                <p className="text-xs p-1 bg-green-50/30 rounded border border-green-200 text-green-700">OG: {contactLensesPrintData.leftEye.lensBrand}</p>
                                                            )}
                                                        </div>
                                                    )}
                                            </>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                {activeDocTab === 'divers' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0 space-y-2">
                                <p className="text-xs mb-2 font-semibold">Document vierge</p>
                                <p className="text-xs text-muted-foreground">
                                    Document avec en-tête patient uniquement - espace libre pour
                                    écriture manuelle
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'certificatAcuite' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0 space-y-2">
                                <p className="text-xs mb-2 font-semibold">CERTIFICAT D'ACUITÉ VISUELLE</p>
                                <p className="text-xs mb-2">
                                    Je certifie que le(a) patient(e) sus-nommé(e) présente:
                                </p>

                                {printControlFlags?.includeVisualAcuityWithoutCorrection && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold">Acuité visuelle sans correction:</p>
                                        <div className="flex gap-4">
                                            {visualAcuityPrintData?.visualAcuityVL_SC_OD && (
                                                <p className="text-xs">OD: {visualAcuityPrintData.visualAcuityVL_SC_OD}</p>
                                            )}
                                            {visualAcuityPrintData?.visualAcuityVL_SC_OG && (
                                                <p className="text-xs">OG: {visualAcuityPrintData.visualAcuityVL_SC_OG}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {printControlFlags?.includeVisualAcuityWithCorrection && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold">Acuité visuelle avec correction:</p>
                                        <div className="flex gap-4">
                                            {visualAcuityPrintData?.visualAcuityVL_AC_OD && (
                                                <p className="text-xs">OD: {visualAcuityPrintData.visualAcuityVL_AC_OD}</p>
                                            )}
                                            {visualAcuityPrintData?.visualAcuityVL_AC_OG && (
                                                <p className="text-xs">OG: {visualAcuityPrintData.visualAcuityVL_AC_OG}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'absence' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0 space-y-2">
                                <p className="text-xs mb-2 font-semibold">CERTIFICAT DE PRÉSENCE</p>
                                <p className="text-xs mb-2">
                                    {(() => {
                                        const today = new Date();
                                        const consultationDate = absencePrintData?.consultationDate || absenceData?.date || today;
                                        const isToday = consultationDate.toDateString() === today.toDateString();

                                        if (isToday) {
                                            return "Je certifie que le(a) patient(e) sus-nommé(e) s'est présenté(e) à ma consultation ce jour.";
                                        } else {
                                            const dateInLetters = consultationDate.toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            });
                                            return `Je certifie que le(a) patient(e) sus-nommé(e) s'est présenté(e) à ma consultation le ${dateInLetters}.`;
                                        }
                                    })()}
                                </p>
                                <p className="text-xs mb-2">
                                    Ce certificat peut justifier son absence professionnelle ou scolaire.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'workStop' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0">
                                <p className="text-xs mb-2 font-semibold">
                                    ARRÊT DE TRAVAIL
                                </p>

                                {(() => {
                                    const startDate = workStopPrintData?.startDate || workStopData?.startDate;
                                    const endDate = workStopPrintData?.endDate || workStopData?.endDate;
                                    const exitAuthorized = workStopPrintData?.exitAuthorized ?? workStopData?.exitAuthorized;

                                    if (!startDate || !endDate) return null;

                                    // Calculate duration in days
                                    const start = new Date(startDate);
                                    const end = new Date(endDate);
                                    const durationMs = end.getTime() - start.getTime();
                                    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

                                    // Convert number to French words
                                    const numberToFrenchWords = (num: number): string => {
                                        const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
                                        const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
                                        const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

                                        if (num === 0) return 'zéro';
                                        if (num < 10) return ones[num];
                                        if (num < 20) return teens[num - 10];
                                        if (num < 100) {
                                            const ten = Math.floor(num / 10);
                                            const one = num % 10;
                                            if (ten === 7) return 'soixante-' + teens[one];
                                            if (ten === 9) return 'quatre-vingt-' + teens[one];
                                            return tens[ten] + (one > 0 ? '-' + ones[one] : '');
                                        }
                                        return num.toString(); // Fallback for numbers >= 100
                                    };

                                    return (
                                        <div className="space-y-2">
                                            <p className="text-xs">
                                                Je certifie que le(a) patient(e) sus-nommé(e) présente un état oculaire nécessitant un arrêt de travail
                                            </p>
                                            <p className="text-xs">
                                                de: {numberToFrenchWords(durationDays)} ( {durationDays.toString().padStart(2, '0')} ) jours
                                            </p>
                                            <p className="text-xs">
                                                à compter du: {start.toLocaleDateString('fr-FR')}
                                            </p>
                                            {exitAuthorized && (
                                                <p className="text-xs">
                                                    sortie autorisée
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'medications' && (
                    <div className="mt-1">
                        <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                            <CardContent className="p-0">
                                {prescriptionData?.treatments && prescriptionData.treatments.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {/* Reverse order: oldest to newest (controller shows newest to oldest) */}
                                        {[...prescriptionData.treatments].reverse().map((treatment, reversedIndex) => {
                                            // Calculate original index for numbering (oldest = 1, newest = last)
                                            const originalIndex = prescriptionData.treatments.length - 1 - reversedIndex;
                                            const name = treatment.name || treatment.customName;
                                            if (!name) return null;

                                            const isActive = treatment.isNew;
                                            const nameWithStrength = treatment.strength
                                                ? `${name} - ${treatment.strength}`
                                                : name;

                                            return (
                                                <div
                                                    key={originalIndex}
                                                    className={cn(
                                                        "rounded-lg border p-2.5 transition-all",
                                                        isActive
                                                            ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20 shadow-sm"
                                                            : "bg-muted/30 border-border"
                                                    )}
                                                >
                                                    {/* Full medication display (no accordion) */}
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className={cn(
                                                            "text-xs font-semibold flex-[0_0_40%] text-left",
                                                            isActive ? "text-primary" : "text-foreground"
                                                        )}>
                                                            {reversedIndex + 1}. {nameWithStrength}
                                                        </div>
                                                        <div className={cn(
                                                            "text-xs flex-[0_0_25%] text-center",
                                                            isActive ? "text-primary/80" : "text-muted-foreground"
                                                        )}>
                                                            {treatment.type || ''}
                                                        </div>
                                                        <div className={cn(
                                                            "text-xs flex-[0_0_30%] text-right",
                                                            isActive ? "text-primary/80" : "text-muted-foreground"
                                                        )}>
                                                            {treatment.packaging || ''}
                                                        </div>
                                                    </div>

                                                    {/* Always show details (no accordion) */}
                                                    <div className={cn(
                                                        "space-y-1.5 pt-2 border-t",
                                                        isActive ? "border-primary/20" : "border-border"
                                                    )}>
                                                        {treatment.instructions && (
                                                            <div className={cn(
                                                                "text-xs ml-2",
                                                                isActive ? "text-primary/80" : "text-muted-foreground"
                                                            )}>
                                                                <span className="font-semibold">Instructions:</span> {treatment.instructions}
                                                            </div>
                                                        )}
                                                        {treatment.dosage && (
                                                            <div className={cn(
                                                                "text-xs ml-2",
                                                                isActive ? "text-primary/80" : "text-muted-foreground"
                                                            )}>
                                                                <span className="font-semibold">Dosage:</span> {treatment.dosage}
                                                            </div>
                                                        )}
                                                        {!treatment.instructions && !treatment.dosage && (
                                                            <div className={cn(
                                                                "text-xs ml-2 italic",
                                                                isActive ? "text-primary/60" : "text-muted-foreground/70"
                                                            )}>
                                                                Aucun détail supplémentaire
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground text-center py-4">
                                        Aucun médicament prescrit
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeDocTab === 'glasses' &&
                    (printControlFlags?.includeFarVision === true || printControlFlags?.includeNearVision === true ||
                        (printControlFlags?.includeRightEyeFar !== false || printControlFlags?.includeLeftEyeFar !== false ||
                            printControlFlags?.includeRightEyeNear !== false || printControlFlags?.includeLeftEyeNear !== false)) && (
                        <div className="mt-1">
                            <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                                <CardContent className="p-0">
                                    <p className="text-xs mb-2 font-semibold">
                                        VERRES CORRECTEURS
                                    </p>

                                    {/* Far vision values always shown when eyes enabled; "Vision de Loin" label only when checkbox selected */}
                                    {(printControlFlags?.includeRightEyeFar !== false || printControlFlags?.includeLeftEyeFar !== false) && (
                                        <>
                                            {printControlFlags?.includeFarVision === true && (
                                                <p className="text-xs mb-1 font-semibold">
                                                    Vision de Loin:
                                                </p>
                                            )}
                                            {printControlFlags?.includeRightEyeFar !== false && (
                                                <div className="mb-2 p-2 bg-blue-50/30 rounded border border-blue-200">
                                                    <p className="text-xs font-medium text-blue-700">
                                                        OD: {(() => {
                                                            const hasData = glassesPrintData?.rightEye?.sph &&
                                                                (parseFloat(glassesPrintData.rightEye.sph) !== 0 ||
                                                                    (glassesPrintData.rightEye.cyl && parseFloat(glassesPrintData.rightEye.cyl) !== 0) ||
                                                                    (glassesPrintData.rightEye.axis && parseFloat(glassesPrintData.rightEye.axis) !== 0));
                                                            const emptyOption = glassesPrintData?.rightEye?.emptyEyeOption || 'plan';

                                                            if (hasData) {
                                                                const s = glassesPrintData.rightEye.sph;
                                                                const c = glassesPrintData.rightEye.cyl;
                                                                const a = glassesPrintData.rightEye.axis;

                                                                const formatVal = (v: string) => {
                                                                    const n = parseFloat(v?.toString().replace(',', '.') || '0');
                                                                    if (isNaN(n)) return v || '';
                                                                    return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
                                                                };

                                                                const sphFormatted = formatVal(s);
                                                                const cylFormatted = c && c !== '0.00' && parseFloat(c.replace(',', '.')) !== 0
                                                                    ? ` (${formatVal(c)})`
                                                                    : '';
                                                                const axisFormatted = a && a !== '0' ? ` ${a}°` : '';

                                                                return `${sphFormatted}${cylFormatted}${axisFormatted}`;
                                                            } else if (emptyOption === 'conserver') {
                                                                return 'Verre en place';
                                                            } else {
                                                                return 'Plan';
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            )}

                                            {printControlFlags?.includeLeftEyeFar !== false && (
                                                <div className="mb-2 p-2 bg-green-50/30 rounded border border-green-200">
                                                    <p className="text-xs font-medium text-green-700">
                                                        OG: {(() => {
                                                            const hasData = glassesPrintData?.leftEye?.sph &&
                                                                (parseFloat(glassesPrintData.leftEye.sph) !== 0 ||
                                                                    (glassesPrintData.leftEye.cyl && parseFloat(glassesPrintData.leftEye.cyl) !== 0) ||
                                                                    (glassesPrintData.leftEye.axis && parseFloat(glassesPrintData.leftEye.axis) !== 0));
                                                            const emptyOption = glassesPrintData?.leftEye?.emptyEyeOption || 'plan';

                                                            if (hasData) {
                                                                const s = glassesPrintData.leftEye.sph;
                                                                const c = glassesPrintData.leftEye.cyl;
                                                                const a = glassesPrintData.leftEye.axis;

                                                                const formatVal = (v: string) => {
                                                                    const n = parseFloat(v?.toString().replace(',', '.') || '0');
                                                                    if (isNaN(n)) return v || '';
                                                                    return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
                                                                };

                                                                const sphFormatted = formatVal(s);
                                                                const cylFormatted = c && c !== '0.00' && parseFloat(c.replace(',', '.')) !== 0
                                                                    ? ` (${formatVal(c)})`
                                                                    : '';
                                                                const axisFormatted = a && a !== '0' ? ` ${a}°` : '';

                                                                return `${sphFormatted}${cylFormatted}${axisFormatted}`;
                                                            } else if (emptyOption === 'conserver') {
                                                                return 'Verre en place';
                                                            } else {
                                                                return 'Plan';
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Vision de Près - only if includeNearVision is explicitly true */}
                                    {printControlFlags?.includeNearVision === true && (
                                        <>
                                            <p className="text-xs mb-1 font-semibold">
                                                Vision de Près:
                                            </p>
                                            {printControlFlags?.includeRightEyeNear !== false && (
                                                <div className="mb-2 p-2 bg-blue-50/30 rounded border border-blue-200">
                                                    <p className="text-xs font-medium text-blue-700">
                                                        OD: {(() => {
                                                            const hasData = glassesPrintData?.rightEye?.nearSph &&
                                                                (parseFloat(glassesPrintData.rightEye.nearSph) !== 0 ||
                                                                    (glassesPrintData.rightEye.nearCyl && parseFloat(glassesPrintData.rightEye.nearCyl) !== 0) ||
                                                                    (glassesPrintData.rightEye.nearAxis && parseFloat(glassesPrintData.rightEye.nearAxis) !== 0));
                                                            const emptyOption = glassesPrintData?.rightEye?.emptyNearEyeOption || 'plan';

                                                            if (hasData) {
                                                                return `${glassesPrintData.rightEye.nearSph ? (parseFloat(glassesPrintData.rightEye.nearSph) > 0 ? `+${glassesPrintData.rightEye.nearSph}` : glassesPrintData.rightEye.nearSph) : '0.00'}${glassesPrintData.rightEye.nearCyl && glassesPrintData.rightEye.nearCyl !== '0.00' ? ` (${parseFloat(glassesPrintData.rightEye.nearCyl) > 0 ? `+${glassesPrintData.rightEye.nearCyl}` : glassesPrintData.rightEye.nearCyl})` : ''}${glassesPrintData.rightEye.nearAxis && glassesPrintData.rightEye.nearAxis !== '0' ? ` ${glassesPrintData.rightEye.nearAxis}°` : ''}`;
                                                            } else if (emptyOption === 'conserver') {
                                                                return 'Verre en place';
                                                            } else {
                                                                return 'Plan';
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            )}

                                            {printControlFlags?.includeLeftEyeNear !== false && (
                                                <div className="mb-2 p-2 bg-green-50/30 rounded border border-green-200">
                                                    <p className="text-xs font-medium text-green-700">
                                                        OG: {(() => {
                                                            const hasData = glassesPrintData?.leftEye?.nearSph &&
                                                                (parseFloat(glassesPrintData.leftEye.nearSph) !== 0 ||
                                                                    (glassesPrintData.leftEye.nearCyl && parseFloat(glassesPrintData.leftEye.nearCyl) !== 0) ||
                                                                    (glassesPrintData.leftEye.nearAxis && parseFloat(glassesPrintData.leftEye.nearAxis) !== 0));
                                                            const emptyOption = glassesPrintData?.leftEye?.emptyNearEyeOption || 'plan';

                                                            if (hasData) {
                                                                return `${glassesPrintData.leftEye.nearSph ? (parseFloat(glassesPrintData.leftEye.nearSph) > 0 ? `+${glassesPrintData.leftEye.nearSph}` : glassesPrintData.leftEye.nearSph) : '0.00'}${glassesPrintData.leftEye.nearCyl && glassesPrintData.leftEye.nearCyl !== '0.00' ? ` (${parseFloat(glassesPrintData.leftEye.nearCyl) > 0 ? `+${glassesPrintData.leftEye.nearCyl}` : glassesPrintData.leftEye.nearCyl})` : ''}${glassesPrintData.leftEye.nearAxis && glassesPrintData.leftEye.nearAxis !== '0' ? ` ${glassesPrintData.leftEye.nearAxis}°` : ''}`;
                                                            } else if (emptyOption === 'conserver') {
                                                                return 'Verre en place';
                                                            } else {
                                                                return 'Plan';
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {(rightEyeData?.pd || leftEyeData?.pd) && (
                                        <p className="text-xs mb-2">
                                            Distance Interpupillaire: {rightEyeData?.pd || leftEyeData?.pd} mm
                                        </p>
                                    )}

                                    {printControlFlags?.includeGlassType && (
                                        <p className="text-xs font-semibold">
                                            Type de verre: {glassesPrintData?.rightEye?.glassType || glassesPrintData?.leftEye?.glassType || 'Standard'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                {activeDocTab === 'report' &&
                    reportData &&
                    (reportData.antecedents ||
                        reportData.inspection ||
                        reportData.segmentAnterieur ||
                        reportData.fondOeil ||
                        reportData.conclusion ||
                        reportData.customTitle ||
                        reportData.customText) && (
                        <div className="mt-1">
                            <Card className="p-3 bg-card rounded-lg border border-border shadow-sm">
                                <CardContent className="p-0">
                                    <p className="text-xs mb-2 font-semibold">
                                        COMPTE RENDU OPHTALMOLOGIQUE
                                    </p>

                                    {(() => {
                                        // Get the combined antecedents value (same logic as ReportDocument)
                                        const generalHistory = reportData?.generalMedicalHistory || detailedClinicalExam?.generalMedicalHistory;
                                        const ophthalmologicalHistory = reportData?.ophthalmologicalHistory || detailedClinicalExam?.ophthalmologicalHistory;

                                        let antecedentsValue = '';
                                        if (generalHistory && ophthalmologicalHistory) {
                                            antecedentsValue = `${generalHistory}, ${ophthalmologicalHistory}`;
                                        } else if (generalHistory) {
                                            antecedentsValue = generalHistory;
                                        } else if (ophthalmologicalHistory) {
                                            antecedentsValue = ophthalmologicalHistory;
                                        }

                                        if (antecedentsValue) {
                                            return (
                                                <>
                                                    <p className="text-xs mb-1">
                                                        Antécédents:
                                                    </p>
                                                    <p className="text-xs mb-2">
                                                        {antecedentsValue.replace(/ \| /g, ' ')}
                                                    </p>
                                                </>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {reportData.inspection && (
                                        <>
                                            <p className="text-xs mb-1">
                                                Inspection:
                                            </p>
                                            <p className="text-xs mb-2">
                                                {reportData.inspection}
                                            </p>
                                        </>
                                    )}

                                    {/* Visual Acuity - Sans Correction */}
                                    {printControlFlags?.includeVisualAcuityWithoutCorrection &&
                                        (reportData.printVisualAcuityVL_SC_OD || reportData.printVisualAcuityVL_SC_OG ||
                                            reportData.visualAcuityVL_SC_OD || reportData.visualAcuityVL_SC_OG ||
                                            rightEyeData?.visualAcuityVL_SC || leftEyeData?.visualAcuityVL_SC) && (
                                            <>
                                                <p className="text-xs mb-1">
                                                    Acuité visuelle sans correction:
                                                </p>
                                                <div className="flex gap-4 mb-2">
                                                    {(reportData.printVisualAcuityVL_SC_OD || reportData.visualAcuityVL_SC_OD || rightEyeData?.visualAcuityVL_SC) && (
                                                        <p className="text-xs">
                                                            OD: {reportData.printVisualAcuityVL_SC_OD || reportData.visualAcuityVL_SC_OD || rightEyeData?.visualAcuityVL_SC}
                                                        </p>
                                                    )}
                                                    {(reportData.printVisualAcuityVL_SC_OG || reportData.visualAcuityVL_SC_OG || leftEyeData?.visualAcuityVL_SC) && (
                                                        <p className="text-xs">
                                                            OG: {reportData.printVisualAcuityVL_SC_OG || reportData.visualAcuityVL_SC_OG || leftEyeData?.visualAcuityVL_SC}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                    {/* Visual Acuity - Avec Correction */}
                                    {printControlFlags?.includeVisualAcuityWithCorrection &&
                                        (reportData.printVisualAcuityVL_AC_OD || reportData.printVisualAcuityVL_AC_OG ||
                                            reportData.visualAcuityVL_AC_OD || reportData.visualAcuityVL_AC_OG ||
                                            rightEyeData?.visualAcuityVL_AC || leftEyeData?.visualAcuityVL_AC) && (
                                            <>
                                                <p className="text-xs mb-1">
                                                    Acuité visuelle avec correction:
                                                </p>
                                                <div className="flex gap-4 mb-2">
                                                    {(reportData.printVisualAcuityVL_AC_OD || reportData.visualAcuityVL_AC_OD || rightEyeData?.visualAcuityVL_AC) && (
                                                        <p className="text-xs">
                                                            OD: {reportData.printVisualAcuityVL_AC_OD || reportData.visualAcuityVL_AC_OD || rightEyeData?.visualAcuityVL_AC}
                                                        </p>
                                                    )}
                                                    {(reportData.printVisualAcuityVL_AC_OG || reportData.visualAcuityVL_AC_OG || leftEyeData?.visualAcuityVL_AC) && (
                                                        <p className="text-xs">
                                                            OG: {reportData.printVisualAcuityVL_AC_OG || reportData.visualAcuityVL_AC_OG || leftEyeData?.visualAcuityVL_AC}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                    {/* Custom fields */}
                                    {reportData.customTitle && reportData.customText && (
                                        <>
                                            <p className="text-xs mb-1">
                                                {reportData.customTitle}:
                                            </p>
                                            <p className="text-xs mb-2">
                                                {reportData.customText}
                                            </p>
                                        </>
                                    )}

                                    {/* Tonométrie - Conditional */}
                                    {printControlFlags?.includeTonometry && (() => {
                                        const getCorrectedIOP = (eye: 'right' | 'left'): string => {
                                            const eyeData = tonometrie?.[eye === 'right' ? 'right_eye' : 'left_eye'];

                                            // If corrected IOP already exists, use it
                                            if (eyeData?.corrected_iop) {
                                                return eyeData.corrected_iop;
                                            }

                                            // Otherwise calculate it if we have IOP and pachymetry
                                            if (eyeData?.iop && eyeData?.pachymetry) {
                                                const pioNum = parseFloat(eyeData.iop);
                                                const pachyNum = parseFloat(eyeData.pachymetry);
                                                if (!isNaN(pioNum) && !isNaN(pachyNum)) {
                                                    // Apply formula: PIO corrigée = PIO mesurée – (CCT – 545)/50 × 2,5 mmHg
                                                    const corrected = pioNum - (pachyNum - 545) / 50 * 2.5;
                                                    return corrected.toFixed(1);
                                                }
                                            }

                                            return '';
                                        };

                                        const pioCorrigeeOD = reportData?.tonometryOD || getCorrectedIOP('right');
                                        const pioCorrigeeOG = reportData?.tonometryOG || getCorrectedIOP('left');

                                        if (pioCorrigeeOD || pioCorrigeeOG) {
                                            return (
                                                <>
                                                    <p className="text-xs mb-1">
                                                        Tonométrie:
                                                    </p>
                                                    <div className="flex gap-4 mb-2">
                                                        {pioCorrigeeOD && (
                                                            <p className="text-xs">
                                                                OD: {pioCorrigeeOD} mmHg
                                                            </p>
                                                        )}
                                                        {pioCorrigeeOG && (
                                                            <p className="text-xs">
                                                                OG: {pioCorrigeeOG} mmHg
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {reportData.segmentAnterieur && (
                                        <>
                                            <p className="text-xs mb-1">
                                                Segment antérieur:
                                            </p>
                                            <p className="text-xs mb-2">
                                                {reportData.segmentAnterieur}
                                            </p>
                                        </>
                                    )}

                                    {reportData.fondOeil && (
                                        <>
                                            <p className="text-xs mb-1">
                                                Fond d'œil:
                                            </p>
                                            <p className="text-xs mb-2">
                                                {reportData.fondOeil}
                                            </p>
                                        </>
                                    )}

                                    {(detailedClinicalExam?.diagnosis || reportData.conclusion) && (
                                        <>
                                            <p className="text-xs mb-1">
                                                Conclusion:
                                            </p>
                                            <p className="text-xs">
                                                {detailedClinicalExam?.diagnosis || reportData.conclusion}
                                            </p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
            </div>
        </ScrollArea >
    );
};

export default memo(DocumentPreview);
