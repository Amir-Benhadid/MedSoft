import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/ui/lib/utils';

interface DocumentHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    className?: string;
}

/**
 * Standardized header for document forms.
 * Displays a title, an optional subtitle, and an optional icon.
 */
export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    className,
}) => {
    return (
        <div className={cn("mb-6 flex items-start gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100", className)}>
            {Icon && (
                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-200 text-slate-600">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-800 leading-none">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-sm text-slate-500 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};
