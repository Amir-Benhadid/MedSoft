import React from 'react';
import { cn } from '@/ui/lib/utils';

interface DocumentSectionProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

/**
 * Wrapper for document sections with consistent styling.
 * Can optionally include a title and an action element (like a button).
 */
export const DocumentSection: React.FC<DocumentSectionProps> = ({
    title,
    children,
    className,
    action,
}) => {
    return (
        <div className={cn("space-y-4 mb-6", className)}>
            {(title || action) && (
                <div className="flex items-center justify-between mb-2">
                    {title && (
                        <h4 className="text-sm font-medium text-slate-700 uppercase tracking-wider">
                            {title}
                        </h4>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                {children}
            </div>
        </div>
    );
};
