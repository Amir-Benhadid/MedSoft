import { EyeData } from "../types";
import { cn } from "@/ui/lib/utils";

interface ReadOnlyRefractionDisplayProps {
    data?: {
        leftEye?: EyeData;
        rightEye?: EyeData;
    };
}

export function ReadOnlyRefractionDisplay({ data }: ReadOnlyRefractionDisplayProps) {
    if (!data?.leftEye && !data?.rightEye) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                Aucune donnée de réfraction disponible
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-6 h-full">
            <EyeDisplay side="right" data={data?.rightEye} />
            <EyeDisplay side="left" data={data?.leftEye} />
        </div>
    );
}

function EyeDisplay({ side, data }: { side: 'left' | 'right', data?: EyeData }) {
    const isRight = side === 'right';
    const title = isRight ? "OD (Droit)" : "OG (Gauche)";
    const accentColor = isRight ? "text-green-600" : "text-blue-600";
    const bgColor = isRight ? "bg-green-50/50" : "bg-blue-50/50";
    const borderColor = isRight ? "border-green-200/50" : "border-blue-200/50";

    if (!data) {
        return (
            <div className="text-center text-slate-400 text-sm italic py-8">
                Aucune donnée
            </div>
        );
    }

    const hasRefraction = data.sph || data.cyl || data.axis || data.add;
    const hasVisualAcuity = data.visualAcuityVL_SC || data.visualAcuityVL_AC || data.visualAcuityVP_SC || data.visualAcuityVP_AC;
    const hasTonometry = data.tension || data.pachymetry;

    return (
        <div className="space-y-4">
            {/* Eye Title */}
            <div className={cn("text-sm font-semibold pb-2 border-b", accentColor, borderColor)}>
                {title}
            </div>

            {/* Visual Acuity */}
            {hasVisualAcuity && (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Acuité Visuelle
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {data.visualAcuityVL_SC && (
                            <DataRow label="VL (SC)" value={data.visualAcuityVL_SC} />
                        )}
                        {data.visualAcuityVL_AC && (
                            <DataRow label="VL (AC)" value={data.visualAcuityVL_AC} />
                        )}
                        {data.visualAcuityVP_SC && (
                            <DataRow label="VP (SC)" value={data.visualAcuityVP_SC} />
                        )}
                        {data.visualAcuityVP_AC && (
                            <DataRow label="VP (AC)" value={data.visualAcuityVP_AC} />
                        )}
                    </div>
                </div>
            )}

            {/* Refraction */}
            {hasRefraction && (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Réfraction
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        {data.sph && (
                            <DataRow label="Sphère" value={`${data.sph}`} />
                        )}
                        {data.cyl && (
                            <DataRow label="Cylindre" value={`${data.cyl}`} />
                        )}
                        {data.axis && (
                            <DataRow label="Axe" value={`${data.axis}°`} />
                        )}
                        {data.add && (
                            <DataRow label="Addition" value={`${data.add}`} />
                        )}
                    </div>
                </div>
            )}

            {/* Tonometry */}
            {hasTonometry && (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Tonométrie
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {data.tension && (
                            <DataRow label="PIO" value={`${data.tension} mmHg`} />
                        )}
                        {data.pachymetry && (
                            <DataRow label="Pachymétrie" value={`${data.pachymetry} μm`} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function DataRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-1 px-2 rounded bg-slate-50/50 border border-slate-100">
            <span className="text-slate-600 text-xs">{label}</span>
            <span className="font-semibold text-slate-900">{value}</span>
        </div>
    );
}
