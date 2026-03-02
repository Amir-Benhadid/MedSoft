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
            {/* Scrollable Top Section */}
            <ScrollArea className="flex-shrink-0">
                <div className="flex flex-col">
                    {/* Top Section: Overlay Container */}
                    <div className="relative px-4 py-4 bg-muted/20 border-b border-border min-h-[160px] flex flex-col justify-center overflow-hidden">
                        {/* Stats - Always rendered, stays in place */}
                        <div className="w-full transition-all duration-500 ease-in-out">
                            <SecretaryStats />
                        </div>

                        {/* Payment Overlay - Slides in from top */}
                        <div className={cn(
                            "absolute top-0 left-0 right-0 min-h-full z-10 flex flex-col justify-start px-4 py-4 bg-card/95 backdrop-blur-sm transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
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
                    <div className="px-4 py-4 bg-primary/5 border-b border-primary/10 space-y-1">
                        <PatientSelectionSection />
                        <ConsultationSection />
                        {businessType === 'kinesis' && <RehabilitationSection />}
                        <PaymentSection />
                    </div>
                </div>
            </ScrollArea>

            {/* Dilation Section - Takes up all remaining height */}
            {appMode !== 'secretary' && (
                <div className="flex-1 flex flex-col min-h-0 px-4 bg-primary/10 border-t border-primary/10">
                    <DilationSection />
                </div>
            )}

            {/* Dialogs */}
            <PatientSelectorDialog />
        </div>
    );
}

