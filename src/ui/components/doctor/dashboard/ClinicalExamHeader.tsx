import { memo } from 'react';
import { Activity } from 'lucide-react';
import { Switch } from "@/ui/components/ui/switch";
import { useConsultationStore } from '@/ui/store/consultationStore';

export const ClinicalExamHeader = memo(function ClinicalExamHeader() {
    // Isolated subscription to dilatation state
    const dilatationRequired = useConsultationStore(state => state.dilatationRequired);
    const setDilatationRequired = useConsultationStore(state => state.setDilatationRequired);

    return (
        <div className="p-3 border-b bg-blue-50/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm bg-white/90">
            <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-slate-900">Examen Clinique</h3>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                <span className="text-xs font-medium text-amber-800">Dilatation</span>
                <Switch
                    checked={dilatationRequired}
                    onCheckedChange={setDilatationRequired}
                    className="scale-75 data-[state=checked]:bg-amber-500"
                />
            </div>
        </div>
    );
});
