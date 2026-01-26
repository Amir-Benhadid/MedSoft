import { ScrollArea } from "@/ui/components/ui/scroll-area";
import SecretaryStats from './SecretaryStats';

import PatientSelectionSection from './PatientSelectionSection';
import ConsultationSection from './ConsultationSection';
import PaymentSection from './PaymentSection';
import DilationSection from './DilationSection';
import RehabilitationSection from './RehabilitationSection'; // Import
import { PatientSelectorDialog } from './PatientSelectorDialog';
import { useConfig } from "@/ui/contexts/ConfigContext";
import { usePendingPayment } from '@/ui/hooks/useWorkflow';
import PaymentActionHeader from "./PaymentActionHeader";
import { cn } from "@/ui/lib/utils";

export default function SecretaryWorkflowSidebar() {
    const { appMode, businessType } = useConfig();
    const pendingPayments = usePendingPayment();
    const activePayment = Array.isArray(pendingPayments) ? pendingPayments[0] : null;

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex flex-col flex-1 min-h-0">
                {/* Scrollable Top Section */}
                <ScrollArea className="flex-shrink-0 max-h-full">
                    <div className="flex flex-col">
                        {/* Top Section: Overlay Container */}
                        <div className="relative px-4 py-8 bg-muted/20 border-b border-border min-h-[140px] flex flex-col justify-center overflow-hidden">
                            {/* Stats - Always rendered, stays in place */}
                            <div className="w-full transition-all duration-500 ease-in-out">
                                <SecretaryStats />
                            </div>

                            {/* Payment Overlay - Slides in from top */}
                            <div className={cn(
                                "absolute inset-0 z-10 flex flex-col justify-center px-4 bg-card/95 backdrop-blur-sm transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
                                activePayment ? "translate-y-0" : "-translate-y-full"
                            )}>
                                {activePayment && (
                                    <PaymentActionHeader
                                        payment={activePayment}
                                        queueSize={pendingPayments.length}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Workflow Section - Subtle Blue tint */}
                        <div className="px-4 py-8 bg-primary/5 border-b border-primary/10 space-y-1">
                            <PatientSelectionSection />
                            <ConsultationSection />
                            {businessType === 'kinesis' && <RehabilitationSection />}
                            <PaymentSection />
                        </div>

                        {/* Dilation Section - Subtle Indigo tint */}
                        {appMode !== 'secretary' && (
                            <div className="px-4 py-8 bg-primary/10 border-b border-primary/10">
                                <DilationSection />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Dialogs */}
            <PatientSelectorDialog />
        </div>
    );
}

