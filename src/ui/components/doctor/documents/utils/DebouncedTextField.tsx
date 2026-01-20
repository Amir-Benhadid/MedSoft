import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/ui/components/ui/input';
import { cn } from '@/ui/lib/utils';
import { Label } from '@/ui/components/ui/label';

interface DebouncedTextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
    label?: string;
    value?: string | number;
    onChange: (value: string) => void;
    debounceTime?: number;
    fullWidth?: boolean;
    size?: 'small' | 'medium';
}

const DebouncedTextField: React.FC<DebouncedTextFieldProps> = ({
    label,
    value,
    onChange,
    debounceTime = 300,
    className,
    fullWidth,
    size,
    ...props
}) => {
    const [localValue, setLocalValue] = useState<string>((value as string) || '');
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        setLocalValue((value as string) || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            if (newValue !== value) {
                onChange(newValue);
            }
        }, debounceTime);
    };

    // Also handle blur to ensure sync
    const handleBlur = () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        if (localValue !== value) {
            onChange(localValue);
        }
    };

    return (
        <div className={cn("space-y-1", fullWidth ? "w-full" : "")}>
            {label && <Label>{label}</Label>}
            <Input
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                    size === 'small' ? 'h-8 text-sm' : '',
                    className
                )}
                {...props}
            />
        </div>
    );
};

export default React.memo(DebouncedTextField);
