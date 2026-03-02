import React, { useState, useEffect } from 'react';
import { useConfig } from '@/ui/contexts/ConfigContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import { Patient } from '@/ui/hooks/usePatients';
import { ArrowLeft, Calendar, Hash, User, Phone, MapPin, Activity } from 'lucide-react';

const patientSchema = z.object({
    name: z.string().min(1, 'Le prénom est requis'),
    surname: z.string().min(1, 'Le nom est requis'),
    dob: z.string().optional().nullable(),
    phone_number: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    oph_ants: z.string().optional().nullable(),
    gen_ants: z.string().optional().nullable(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
    initialData?: Partial<Patient>;
    onSubmit: (data: PatientFormValues) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function PatientForm({ initialData, onSubmit, onCancel, isLoading }: PatientFormProps) {
    const { appMode } = useConfig();
    const [age, setAge] = useState<string>('');

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: initialData?.name || '',
            surname: initialData?.surname || '',
            dob: initialData?.dob || '',
            phone_number: initialData?.phone_number || '',
            street: initialData?.street || '',
            city: initialData?.city || 'Constantine',
            oph_ants: initialData?.oph_ants || '',
            gen_ants: initialData?.gen_ants || '',
        }
    });





    // Calculate age handler
    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue('dob', val); // Manually set since we intercept onChange

        if (val) {
            const birthDate = new Date(val);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge.toString());
        } else {
            setAge('');
        }
    };

    // Initial Age Calculation (One-off effect for mount is okay, or just derived)
    // Actually, let's just calc initial age in state init?
    // Data might be async.
    // Let's keep a safer effect ONLY for external data load, but mostly rely on handlers.
    // Actually, since initialData drives defaultValues, we can just calc age once.
    useEffect(() => {
        if (initialData?.dob) {
            const birthDate = new Date(initialData.dob);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge.toString());
        }
    }, [initialData?.dob]); // Only runs on initial data load

    // Calculate DOB from age
    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const ageValue = e.target.value;
        setAge(ageValue);

        if (ageValue && !isNaN(parseInt(ageValue))) {
            const ageNum = parseInt(ageValue);
            const today = new Date();
            const birthYear = today.getFullYear() - ageNum;
            // Set to January 1st of the birth year as default
            const estimatedDob = new Date(birthYear, 0, 1);
            setValue('dob', estimatedDob.toISOString().split('T')[0]);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="hover:bg-primary/10"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">
                        {initialData?.id ? 'Modifier Patient' : 'Nouveau Patient'}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                    <Label htmlFor="surname" className="flex items-center gap-2 font-semibold">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Nom *
                    </Label>
                    <Input
                        id="surname"
                        {...register('surname')}
                        className="focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.surname && <p className="text-xs text-destructive">{errors.surname.message}</p>}
                </div>
                <div className="space-y-2 text-left">
                    <Label htmlFor="name" className="flex items-center gap-2 font-semibold">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Prénom *
                    </Label>
                    <Input
                        id="name"
                        {...register('name')}
                        className="focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2 text-left">
                    <Label htmlFor="dob" className="flex items-center gap-2 font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        Date de naissance
                    </Label>
                    <Input
                        id="dob"
                        type="date"
                        {...register('dob')}
                        onChange={(e) => {
                            register('dob').onChange(e); // Propagate to hook-form
                            handleDobChange(e); // Our custom handler
                        }}
                        className="focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="space-y-2 text-left">
                    <Label htmlFor="age" className="flex items-center gap-2 font-semibold">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        Âge
                    </Label>
                    <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={handleAgeChange}
                        min="0"
                        max="150"
                        className="focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="space-y-2 text-left">
                <Label htmlFor="phone" className="flex items-center gap-2 font-semibold">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Téléphone
                </Label>
                <Input
                    id="phone"
                    {...register('phone_number')}
                    className="focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                    <Label htmlFor="street" className="flex items-center gap-2 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Adresse
                    </Label>
                    <Input
                        id="street"
                        {...register('street')}
                        className="focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="space-y-2 text-left">
                    <Label htmlFor="city" className="flex items-center gap-2 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Ville
                    </Label>
                    <Input
                        id="city"
                        {...register('city')}
                        className="focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {appMode !== 'secretary' && (
                <div className="space-y-2 text-left">
                    <Label htmlFor="oph_ants" className="flex items-center gap-2 font-semibold">
                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                        Antécédents Ophtalmologiques
                    </Label>
                    <Textarea
                        id="oph_ants"
                        {...register('oph_ants')}
                        rows={2}
                        className="resize-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            )}

            <div className="space-y-2 text-left">
                <Label htmlFor="gen_ants" className="flex items-center gap-2 font-semibold">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    Antécédents Généraux
                </Label>
                <Textarea
                    id="gen_ants"
                    {...register('gen_ants')}
                    rows={2}
                    className="resize-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Enregistrement...
                        </span>
                    ) : (
                        'Enregistrer'
                    )}
                </Button>
            </div>
        </form>
    );
}
