import { memo } from 'react';
import { EyeRefractionPanel } from "./EyeRefractionPanel";
import { EyeData } from "./types";
import { Button } from "@/ui/components/ui/button";
import { Copy } from "lucide-react";
import { useConsultationStore } from "@/ui/store/consultationStore";

interface RefractionTabProps {
    readOnly?: boolean;
    data?: {
        leftEye?: EyeData;
        rightEye?: EyeData;
    };
}

function RefractionTab({ readOnly, data }: RefractionTabProps) {
    // Use selectors to get full objects for copying
    const setLeftEye = useConsultationStore(state => state.setLeftEye);
    const setRightEye = useConsultationStore(state => state.setRightEye);

    const copyToLeft = () => {
        const rightEye = useConsultationStore.getState().rightEye;
        setLeftEye(rightEye);
    };

    const copyToRight = () => {
        const leftEye = useConsultationStore.getState().leftEye;
        setRightEye(leftEye);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
            <EyeRefractionPanel
                side="right"
                readOnly={readOnly}
                data={data?.rightEye}
                action={
                    !readOnly && (
                        <Button variant="ghost" size="sm" onClick={copyToRight} title="Copier OG vers OD" className="h-6 px-2 text-xs hover:bg-green-100">
                            <Copy className="w-3 h-3 mr-1" /> OG &#8594; OD
                        </Button>
                    )
                }
            />
            <EyeRefractionPanel
                side="left"
                readOnly={readOnly}
                data={data?.leftEye}
                action={
                    !readOnly && (
                        <Button variant="ghost" size="sm" onClick={copyToLeft} title="Copier OD vers OG" className="h-6 px-2 text-xs hover:bg-blue-100">
                            <Copy className="w-3 h-3 mr-1" /> OD &#8594; OG
                        </Button>
                    )
                }
            />
        </div>
    );
}

export default memo(RefractionTab);
