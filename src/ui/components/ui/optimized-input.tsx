import * as React from "react"
import { Input, InputProps } from "@/ui/components/ui/input"
import { Textarea } from "@/ui/components/ui/textarea"
import { Label } from "@/ui/components/ui/label"
import { cn } from "@/ui/lib/utils"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

interface OptimizedInputProps extends Omit<InputProps, 'onChange'> {
    value?: string | number;
    onChange: (value: string) => void;
    label?: string;
    suffix?: string;
}

export const OptimizedInput = React.forwardRef<HTMLInputElement, OptimizedInputProps>(
    ({ value, onChange, label, suffix, className, ...props }, ref) => {
        const [localValue, setLocalValue] = React.useState<string | number>(value || "");

        React.useEffect(() => {
            setLocalValue(value || "");
        }, [value]);

        const handleBlur = () => {
            if (String(localValue) !== String(value || "")) {
                onChange(String(localValue));
            }
        }

        const input = (
            <div className={cn("relative w-full", className?.includes('h-full') && "h-full")}>
                <Input
                    ref={ref}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    className={cn("selection:bg-blue-100/60", className, suffix && "pr-8")}
                    {...props}
                />
                {suffix && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{suffix}</span>
                    </div>
                )}
            </div>
        );

        if (label) {
            return (
                <div className="grid w-full gap-1.5">
                    <Label>{label}</Label>
                    {input}
                </div>
            );
        }

        return input;
    }
);
OptimizedInput.displayName = "OptimizedInput";

interface OptimizedTextareaProps extends Omit<TextareaProps, 'onChange'> {
    value?: string;
    onChange: (value: string) => void;
}

export const OptimizedTextarea = React.forwardRef<HTMLTextAreaElement, OptimizedTextareaProps>(
    ({ value, onChange, className, ...props }, ref) => {
        const [localValue, setLocalValue] = React.useState<string>(value || "");

        React.useEffect(() => {
            setLocalValue(value || "");
        }, [value]);

        const handleBlur = () => {
            if (localValue !== (value || "")) {
                onChange(localValue);
            }
        }

        return (
            <Textarea
                ref={ref}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                className={cn("selection:bg-blue-100/60", className)}
                {...props}
            />
        );
    }
);
OptimizedTextarea.displayName = "OptimizedTextarea";
