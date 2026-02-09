import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface DebouncedTextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onChange: (value: string) => void;
    debounceTime?: number;
    label?: string;
}

const DebouncedTextField: React.FC<DebouncedTextFieldProps> = ({
    value,
    onChange,
    debounceTime = 0, // Default to 0 for immediate updates (can be overridden for persistence)
    label,
    className,
    ...props
}) => {
    const [innerValue, setInnerValue] = useState<string>((value as string) || '');
    const onChangeRef = useRef(onChange);
    const isUserTypingRef = useRef(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();
    const lastSentValueRef = useRef<string>((value as string) || '');
    const innerValueRef = useRef<string>((value as string) || '');

    // Keep refs in sync with state
    useEffect(() => {
        innerValueRef.current = innerValue;
    }, [innerValue]);

    // Keep the onChange ref current
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Update inner value when prop value changes from outside (not from user typing)
    useEffect(() => {
        const propValue = (value as string) || '';
        const currentInner = innerValueRef.current;

        // Only sync from prop if:
        // 1. We're not currently typing (user isn't actively typing)
        // 2. The prop value differs from our current inner value
        if (!isUserTypingRef.current) {
            if (propValue !== currentInner) {
                // External change - sync immediately
                setInnerValue(propValue);
                lastSentValueRef.current = propValue;
            }
        } else {
            // User is typing - only sync if prop matches what we last sent (parent caught up)
            // This prevents overwriting during rapid typing
            if (propValue === lastSentValueRef.current && propValue !== currentInner) {
                // Parent caught up with our last keystroke - sync
                setInnerValue(propValue);
            }
        }
    }, [value]);

    // Handle the input change immediately for the local state and parent update
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // Mark that user is typing
        isUserTypingRef.current = true;

        // Update local state immediately for smooth typing
        setInnerValue(newValue);

        // Clear any pending debounce/timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // If debounceTime is 0, update immediately; otherwise debounce
        if (debounceTime === 0) {
            lastSentValueRef.current = newValue;
            onChangeRef.current(newValue);

            // Reset typing flag after a short delay to allow parent to catch up
            // This prevents prop updates from overwriting during rapid typing
            debounceTimeoutRef.current = setTimeout(() => {
                isUserTypingRef.current = false;
            }, 100); // Small delay to allow parent state to update
        } else {
            debounceTimeoutRef.current = setTimeout(() => {
                isUserTypingRef.current = false;
                lastSentValueRef.current = newValue;
                onChangeRef.current(newValue);
            }, debounceTime);
        }
    }, [debounceTime]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const input = (
        <Input
            {...props}
            value={innerValue}
            onChange={handleChange}
            className={className}
        />
    );

    if (label) {
        return (
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{label}</Label>
                {input}
            </div>
        );
    }

    return input;
};

const MemoizedDebouncedTextField = React.memo(DebouncedTextField);
export default MemoizedDebouncedTextField;
