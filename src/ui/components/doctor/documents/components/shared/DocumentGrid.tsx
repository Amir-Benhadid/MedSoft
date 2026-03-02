import React from 'react';
import { cn } from '@/ui/lib/utils';

interface DocumentGridProps {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

/**
 * Grid layout for document fields.
 * Defaults to 2 columns.
 */
export const DocumentGrid: React.FC<DocumentGridProps> = ({
    children,
    cols = 2,
    className,
}) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn("grid gap-4", gridCols[cols], className)}>
            {children}
        </div>
    );
};
