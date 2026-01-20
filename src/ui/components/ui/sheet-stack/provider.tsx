
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { cn } from '@/ui/lib/utils';
import { X } from 'lucide-react';

export interface StackedSheetOptions {
    id?: string;
    width?: number | string; // e.g., 400, "400px", "50%"
    title?: string;
    className?: string; // For the content container
    onDismiss?: () => void;
}

export interface StackedSheetItem extends StackedSheetOptions {
    id: string; // Guaranteed ID
    content: ReactNode;
    isOpen: boolean;
    isClosing?: boolean; // Internal flag to track removal process
}

interface SheetStackContextType {
    openSheet: (content: ReactNode, options?: StackedSheetOptions) => string;
    closeSheet: (id: string) => void;
    closeAll: () => void;
    updateSheet: (id: string, updates: Partial<StackedSheetItem>) => void;
    sheets: StackedSheetItem[];
}

const SheetStackContext = createContext<SheetStackContextType | undefined>(undefined);

export function useSheetStack() {
    const context = useContext(SheetStackContext);
    if (!context) {
        throw new Error('useSheetStack must be used within a SheetStackProvider');
    }
    return context;
}

interface SheetStackProviderProps {
    children: ReactNode;
    baseOffset?: number; // Optional default offset
}

export function SheetStackProvider({ children, baseOffset = 0 }: SheetStackProviderProps) {
    const [sheets, setSheets] = useState<StackedSheetItem[]>([]);

    const openSheet = useCallback((content: ReactNode, options?: StackedSheetOptions) => {
        const id = options?.id || crypto.randomUUID();
        setSheets((prev) => {
            // Check if exists
            const exists = prev.find((s) => s.id === id);
            if (exists) {
                // If exists (even if closing), bring it back to life
                return prev.map(s => s.id === id ? {
                    ...s,
                    isOpen: true,
                    isClosing: false, // Cancel closing
                    content,
                    ...options
                } : s);
            }
            // Add new sheet
            return [...prev, { id, content, isOpen: true, width: options?.width || 400, ...options }];
        });
        return id;
    }, []);

    const closeSheet = useCallback((id: string) => {
        // Find existing sheet to trigger onDismiss
        const sheet = sheets.find(s => s.id === id);
        if (sheet?.onDismiss) {
            sheet.onDismiss();
        }

        setSheets((prev) => {
            return prev.map(s => s.id === id ? { ...s, isOpen: false, isClosing: true } : s);
        });

        // Remove from state after animation completes
        // Standard transition duration is 500ms
        setTimeout(() => {
            setSheets((prev) => prev.filter((s) => {
                // Only remove if it matches ID AND is still marked as closing/closed
                // This prevents removing a sheet that was re-opened during the timeout
                if (s.id === id) {
                    return s.isOpen; // Keep it if isOpen is true (re-opened)
                }
                return true; // Keep others
            }));
        }, 500);
    }, [sheets]);

    const closeAll = useCallback(() => {
        setSheets([]); // Immediate close for all
    }, []);

    const updateSheet = useCallback((id: string, updates: Partial<StackedSheetItem>) => {
        setSheets((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    }, []);


    return (
        <SheetStackContext.Provider value={{ openSheet, closeSheet, closeAll, updateSheet, sheets }}>
            {children}
            <SheetStackRenderer sheets={sheets} closeSheet={closeSheet} />
        </SheetStackContext.Provider>
    );
}

function SheetStackRenderer({ sheets, closeSheet }: { sheets: StackedSheetItem[], closeSheet: (id: string) => void }) {
    if (sheets.length === 0) return null;

    // The first sheet dictates the "Main Layer" properties
    const firstSheet = sheets[0];
    const firstSheetWidth = typeof firstSheet.width === 'number' ? firstSheet.width : parseInt(String(firstSheet.width || "400").replace('px', ''), 10) || 400;

    // Filter out completely closed sheets that might be lingering if timeout hasn't fired yet? 
    // actually we keep them to animate out.

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex justify-end">
            {/* Overlay - only if at least one sheet is open? */}
            {sheets.some(s => s.isOpen) && (
                <div
                    className="absolute inset-0 bg-black/80 pointer-events-auto transition-opacity duration-300 animate-in fade-in"
                    onClick={() => {
                        // Close the top-most visible sheet?
                        // Usually click overlay closes everything or just the top one.
                        // For stack, maybe close the last one.
                        const visibleSheets = sheets.filter(s => s.isOpen);
                        if (visibleSheets.length > 0) {
                            closeSheet(visibleSheets[visibleSheets.length - 1].id);
                        }
                    }}
                />
            )}

            {sheets.map((sheet, index) => {
                const isFirst = index === 0;

                // Z-Index Logic: First sheet is HIGHEST. Subsequent are LOWER.
                // e.g. Sheet 0: z-50. Sheet 1: z-49.
                const zIndex = 50 - index;

                // Padding logic: If not first, add padding right equal to first sheet's width
                const paddingRight = !isFirst ? firstSheetWidth : 0;

                // Styles
                const widthStyle = typeof sheet.width === 'number' ? `${sheet.width}px` : sheet.width;

                return (
                    <div
                        key={sheet.id}
                        className={cn(
                            "absolute inset-y-0 right-0 h-full bg-background shadow-2xl transition-transform duration-500 ease-in-out pointer-events-auto flex flex-col border-l",
                            sheet.className
                        )}
                        style={{
                            zIndex: zIndex,
                            width: isFirst ? widthStyle : `calc(${widthStyle} + ${firstSheetWidth}px)`, // Add padding to total width
                            paddingRight: paddingRight, // Push content to left
                            transform: sheet.isOpen ? 'translateX(0)' : 'translateX(100%)',
                        }}
                    >
                        {sheet.content}
                    </div>
                );
            })}
        </div>
    );
}
