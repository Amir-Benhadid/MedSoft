import * as React from "react"
import { cn } from "@/ui/lib/utils"
// We use lucide-react for consistency, ensure it's installed
import { ChevronDown } from "lucide-react"

export interface NativeSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
    ({ className, options, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    className={cn(
                        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={`${option.value}-${option.label}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        )
    }
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
