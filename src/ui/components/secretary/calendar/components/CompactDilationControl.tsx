import { memo } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Switch } from '@/ui/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { Eye, Droplet } from 'lucide-react';
import { Badge } from '@/ui/components/ui/badge';

interface CompactDilationControlProps {
    control: Control<any>;
}

const DILATION_PRODUCTS = [
    { value: 'Tropicamyde', label: 'Tropi', short: 'T', color: 'bg-blue-500' },
    { value: 'Mydriaticum', label: 'Mydri', short: 'M', color: 'bg-cyan-500' },
    { value: 'Skiacol', label: 'Skia', short: 'S', color: 'bg-indigo-500' },
    { value: 'Atropine', label: 'Atro', short: 'A', color: 'bg-purple-500' },
] as const;

export const CompactDilationControl = memo(({ control }: CompactDilationControlProps) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold">Dilat.</span>
                </div>
                <Controller
                    name="needs_dilation"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    )}
                />
            </div>

            <Controller
                name="needs_dilation"
                control={control}
                render={({ field: { value: needsDilation } }) => (
                    needsDilation ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <Controller
                                name="dilation_status"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <SelectTrigger className="h-9 border-blue-200 focus:ring-blue-500">
                                            <div className="flex items-center gap-2">
                                                <Droplet className="h-3.5 w-3.5 text-blue-600" />
                                                <SelectValue placeholder="Produit..." />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DILATION_PRODUCTS.map((product) => (
                                                <SelectItem key={product.value} value={product.value}>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`${product.color} text-white h-5 w-5 p-0 flex items-center justify-center text-xs`}>
                                                            {product.short}
                                                        </Badge>
                                                        <span className="font-medium">{product.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    ) : <></>
                )}
            />
        </div>
    );
});

CompactDilationControl.displayName = 'CompactDilationControl';
