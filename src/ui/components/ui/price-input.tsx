import * as React from 'react';
import { Input, InputProps } from './input';

interface PriceInputProps extends Omit<InputProps, 'value' | 'onChange'> {
    value: number | '';
    onValueChange: (value: number | '') => void;
}

export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
    ({ value, onValueChange, className, ...props }, ref) => {
        // Sync local string state with external numeric value
        const [displayValue, setDisplayValue] = React.useState<string>(
            value === '' ? '' : value.toString()
        );

        React.useEffect(() => {
            // Update display only if it represents a different number than the current input
            // This prevents stripping leading zeros while typing
            const numericValue = displayValue === '' ? '' : parseInt(displayValue, 10);
            if (numericValue !== value) {
                setDisplayValue(value === '' ? '' : value.toString());
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let newValue = e.target.value;

            // Remove any non-digit characters
            newValue = newValue.replace(/\D/g, '');

            // Update display state immediately (allows leading zeros while typing)
            setDisplayValue(newValue);

            // Update parent state with the numeric value
            if (newValue === '') {
                onValueChange('');
            } else {
                onValueChange(parseInt(newValue, 10));
            }
        };

        return (
            <Input
                {...props}
                ref={ref}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                className={className}
            />
        );
    }
);
PriceInput.displayName = 'PriceInput';
