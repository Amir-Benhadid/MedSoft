import { ScrollArea } from "@/ui/components/ui/scroll-area";
import SecretaryStats from './SecretaryStats';
import EnhancedMessaging from '../messaging/EnhancedMessaging';
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
        <div className="flex flex-col h-full bg-white border-l border-slate-200 relative">
            <div className="flex flex-col flex-1 min-h-0">
                {/* Scrollable Top Section */}
                <ScrollArea className="flex-shrink-0 max-h-[60vh]">
                    <div className="flex flex-col">
                        {/* Top Section: Overlay Container */}
                        <div className="relative px-4 py-8 bg-slate-50/80 border-b border-slate-100 min-h-[140px] flex flex-col justify-center overflow-hidden">
                            {/* Stats - Always rendered, stays in place */}
                            <div className="w-full transition-all duration-500 ease-in-out">
                                <SecretaryStats />
                            </div>

                            {/* Payment Overlay - Slides in from top */}
                            <div className={cn(
                                "absolute inset-0 z-10 flex flex-col justify-center px-4 bg-slate-50/95 backdrop-blur-sm transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
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
                        <div className="px-4 py-8 bg-[#f0f7ff] border-b border-blue-100/50 space-y-1">
                            <PatientSelectionSection />
                            <ConsultationSection />
                            {businessType === 'kinesis' && <RehabilitationSection />}
                            <PaymentSection />
                        </div>

                        {/* Dilation Section - Subtle Indigo tint */}
                        {appMode !== 'secretary' && (
                            <div className="px-4 py-8 bg-[#f5f3ff] border-b border-indigo-100/50">
                                <DilationSection />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Integrated Messaging & Tasks - Fills remaining space */}
                <div className="flex-1 min-h-0 border-t border-slate-100">
                    <EnhancedMessaging />
                </div>
            </div>

            {/* Dialogs */}
            <PatientSelectorDialog />
        </div>
    );
}

