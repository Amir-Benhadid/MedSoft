import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/ui/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
    id: string;
    label: string;
    icon: LucideIcon;
    isGroup?: boolean;
}

interface DocumentTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabClick: (tab: TabItem) => void;
    page: number;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
    tabs,
    activeTab,
    onTabClick,
    page,
}) => {
    // Check if a tab is active (including group logic)
    const isTabActive = (tab: TabItem) => {
        if (!tab.isGroup) return activeTab === tab.id;
        // Group logic should be handled by parent or passed down, 
        // effectively checking if activeTab starts with or belongs to group
        // For 'bilans', we know the IDs. Ideally, we should pass 'activeGroup' prop if generic.
        // For now, hardcoding the known groups from DocumentsContainer
        if (tab.id === 'bilans') {
            return ['bilanPreOp', 'bilanDiabete', 'bilanInflammatoire', 'bilanUveite'].includes(activeTab);
        }
        return activeTab === tab.id; // Fallback
    };

    return (
        <div className="flex-1 relative overflow-hidden h-[36px]">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={page}
                    initial={{ x: page === 0 ? -50 : 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: page === 0 ? 50 : -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="grid grid-cols-5 gap-1.5 w-full h-full absolute inset-0"
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = isTabActive(tab);
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabClick(tab)}
                                className={cn(
                                    "flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-tight transition-all duration-200 border truncate",
                                    active
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-primary/30"
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", active ? "text-primary-foreground" : "text-muted-foreground")} />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
