import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/components/ui/dialog";
import { Button } from "@/ui/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select";
import { Badge } from "@/ui/components/ui/badge";
import { Eye, Droplet, CheckCircle } from "lucide-react";
import { cn } from "@/ui/lib/utils";

interface DoctorDilationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (medication: string, eye: string) => void;
    isSubmitting: boolean;
}

const DILATION_PRODUCTS = [
    { value: 'Tropicamyde', label: 'Tropi', short: 'T', color: 'bg-blue-500' },
    { value: 'Mydriaticum', label: 'Mydri', short: 'M', color: 'bg-cyan-500' },
    { value: 'Skiacol', label: 'Skia', short: 'S', color: 'bg-indigo-500' },
    { value: 'Atropine', label: 'Atro', short: 'A', color: 'bg-purple-500' },
] as const;

export function DoctorDilationDialog({ isOpen, onClose, onConfirm, isSubmitting }: DoctorDilationDialogProps) {
    const [dilationStatus, setDilationStatus] = useState<string>("Mydriaticum"); // Default Mydriaticum
    const [selectedEye, setSelectedEye] = useState<string>("ODS"); // Default Both

    // Reset default when opening
    useEffect(() => {
        if (isOpen) {
            setDilationStatus("Mydriaticum");
            setSelectedEye("ODS");
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onConfirm(dilationStatus, selectedEye);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Eye className="w-6 h-6 text-blue-600" />
                        Demande de dilatation
                    </DialogTitle>
                    <DialogDescription>
                        Sélectionnez l'œil et le produit pour la dilatation.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Eye Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant={selectedEye === 'OD' ? 'default' : 'outline'}
                            onClick={() => setSelectedEye('OD')}
                            className={cn(selectedEye === 'OD' ? "bg-blue-600" : "text-slate-600")}
                        >
                            OD (Droit)
                        </Button>
                        <Button
                            variant={selectedEye === 'OG' ? 'default' : 'outline'}
                            onClick={() => setSelectedEye('OG')}
                            className={cn(selectedEye === 'OG' ? "bg-blue-600" : "text-slate-600")}
                        >
                            OG (Gauche)
                        </Button>
                        <Button
                            variant={selectedEye === 'ODS' ? 'default' : 'outline'}
                            onClick={() => setSelectedEye('ODS')}
                            className={cn(selectedEye === 'ODS' ? "bg-blue-600" : "text-slate-600")}
                        >
                            ODS (Les 2)
                        </Button>
                    </div>

                    {/* Product Selection */}
                    <Select value={dilationStatus} onValueChange={setDilationStatus}>
                        <SelectTrigger className="w-full h-12 bg-white border-blue-200 focus:ring-blue-500">
                            <div className="flex items-center gap-2">
                                <Droplet className="h-5 w-5 text-blue-600" />
                                <SelectValue placeholder="Choisir le produit..." />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {DILATION_PRODUCTS.map((product) => (
                                <SelectItem key={product.value} value={product.value} className="py-3">
                                    <div className="flex items-center gap-3">
                                        <Badge className={cn("text-white h-6 w-6 p-0 flex items-center justify-center text-xs", product.color)}>
                                            {product.short}
                                        </Badge>
                                        <span className="font-semibold text-base">{product.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Envoi...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Confirmer
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
