import { z } from 'zod';
import { EyeDataSchema, DetailedClinicalExamDataSchema } from '@/electron/db/schemas/consultation.schema';

export type EyeData = z.infer<typeof EyeDataSchema>;
export type DetailedClinicalExamData = z.infer<typeof DetailedClinicalExamDataSchema>;

export interface OptionType {
    value: string;
    label: string;
}

export const VISUAL_ACUITY_OPTIONS_DISTANCE_SC: OptionType[] = [
    { value: '12/10', label: '12/10' },
    { value: '11/10', label: '11/10' },
    { value: '', label: ' ' },
    { value: '10/10', label: '10/10' },
    { value: '9/10', label: '9/10' },
    { value: '8/10', label: '8/10' },
    { value: '7/10', label: '7/10' },
    { value: '6/10', label: '6/10' },
    { value: '5/10', label: '5/10' },
    { value: '4/10', label: '4/10' },
    { value: '3/10', label: '3/10' },
    { value: '2/10', label: '2/10' },
    { value: '1.5/10', label: '1.5/10' },
    { value: '1/10', label: '1/10' },
    { value: '<1/10', label: '<1/10' },
    { value: '1/20', label: '1/20' },
    { value: 'CLD', label: 'CLD' },
    { value: 'VLB', label: 'VLB' },
    { value: 'PL+', label: 'PL+' },
    { value: 'PL+/-', label: 'PL+/-' },
    { value: 'PL-', label: 'PL-' },
];

export const VISUAL_ACUITY_OPTIONS_DISTANCE_AC: OptionType[] = [
    { value: '', label: ' ' },
    { value: '10/10', label: '10/10' },
    { value: '9/10', label: '9/10' },
    { value: '8/10', label: '8/10' },
    { value: '7/10', label: '7/10' },
    { value: '6/10', label: '6/10' },
    { value: '5/10', label: '5/10' },
    { value: '4/10', label: '4/10' },
    { value: '3/10', label: '3/10' },
    { value: '2/10', label: '2/10' },
    { value: '1.5/10', label: '1.5/10' },
    { value: '1/10', label: '1/10' },
    { value: '<1/10', label: '<1/10' },
    { value: '1/20', label: '1/20' },
    { value: 'CLD', label: 'CLD' },
    { value: 'NA', label: 'NA' },
];

export const VISUAL_ACUITY_OPTIONS_NEAR: OptionType[] = [
    { value: '', label: ' ' },
    { value: 'P1', label: 'P1' },
    { value: 'P2', label: 'P2' },
    { value: 'P3', label: 'P3' },
    { value: 'P4', label: 'P4' },
    { value: 'P5', label: 'P5' },
    { value: 'P6', label: 'P6' },
    { value: 'P7', label: 'P7' },
    { value: 'P8', label: 'P8' },
];

export const SPHERE_VALUES = (() => {
    const values: OptionType[] = [];

    // Large negative values: -25 to -21 (1.0 increments)
    for (let i = -25; i < -21; i += 1) {
        const formatted = i.toFixed(2);
        values.push({ value: formatted, label: formatted });
    }

    // Medium negative values: -21 to 0 (0.25 increments)
    for (let i = -21; i < 0; i += 0.25) {
        const formatted = i.toFixed(2);
        values.push({ value: formatted, label: formatted });
    }

    // Empty option in the middle (between negatives and zero)
    values.push({ value: '', label: ' ' });

    // Zero
    values.push({ value: '0.00', label: '0.00' });

    // Medium positive values: 0.25 to 21 (0.25 increments)
    for (let i = 0.25; i < 21; i += 0.25) {
        const formatted = `+${i.toFixed(2)}`;
        values.push({ value: formatted, label: formatted });
    }

    // Large positive values: 21 to 25 (1.0 increments)
    for (let i = 21; i <= 25; i += 1) {
        const formatted = `+${i.toFixed(2)}`;
        values.push({ value: formatted, label: formatted });
    }

    return values;
})();

export const CYLINDER_VALUES = (() => {
    const values: OptionType[] = [];

    // Medium negative values: -6 to 0 (0.25 increments)
    for (let i = -6; i < 0; i += 0.25) {
        const formatted = i.toFixed(2);
        values.push({ value: formatted, label: formatted });
    }

    // Empty option in the middle
    values.push({ value: '', label: ' ' });

    // Zero
    values.push({ value: '0.00', label: '0.00' });

    // Medium positive values: 0.25 to 6 (0.25 increments)
    for (let i = 0.25; i < 6; i += 0.25) {
        const formatted = `+${i.toFixed(2)}`;
        values.push({ value: formatted, label: formatted });
    }

    return values;
})();

export const AXIS_VALUES = (() => {
    const values: OptionType[] = [{ value: '', label: ' ' }];
    for (let i = 0; i <= 180; i += 5) {
        values.push({ value: i.toString(), label: i.toString() + '°' });
    }
    return values;
})();

export const ADD_VALUES = (() => {
    const values: OptionType[] = [{ value: '', label: ' ' }];
    for (let i = 0.75; i <= 4.0; i += 0.25) {
        const formatted = `+${i.toFixed(2)}`;
        values.push({ value: formatted, label: formatted });
    }
    return values;
})();

export const TENSION_VALUES = (() => {
    const values: OptionType[] = [{ value: '', label: ' ' }];
    for (let i = 0; i <= 60; i++) {
        values.push({ value: i.toString(), label: i.toString() });
    }
    return values;
})();

export const KERATOMETRY_VALUES = (() => {
    const values: OptionType[] = [{ value: '', label: ' ' }];
    for (let i = 30; i <= 60; i += 0.25) {
        const formatted = i.toFixed(2);
        values.push({ value: formatted, label: formatted });
    }
    return values;
})();

export const LENS_TYPE_OPTIONS: OptionType[] = [
    { value: '', label: ' ' },
    { value: 'Souple hydrogel', label: 'Souple hydrogel' },
    { value: 'Souple silicone-hydrogel', label: 'Souple silicone-hydrogel' },
    { value: 'RGP', label: 'RGP' },
    { value: 'Hybride', label: 'Hybride' },
    { value: 'Sclérale', label: 'Sclérale' },
    { value: 'Mini-sclérale', label: 'Mini-sclérale' },
    { value: 'Ortho-K', label: 'Ortho-K' },
];

export const LENS_BRAND_OPTIONS: OptionType[] = [
    { value: '', label: ' ' },
    { value: 'Acuvue', label: 'Acuvue' },
    { value: 'Air Optix', label: 'Air Optix' },
    { value: 'Biofinity', label: 'Biofinity' },
    { value: 'Dailies', label: 'Dailies' },
    { value: 'Proclear', label: 'Proclear' },
    { value: 'PureVision', label: 'PureVision' },
    { value: 'SofLens', label: 'SofLens' },
    { value: 'Bausch & Lomb', label: 'Bausch & Lomb' },
    { value: 'Alcon', label: 'Alcon' },
    { value: 'CooperVision', label: 'CooperVision' },
    { value: 'Johnson & Johnson', label: 'Johnson & Johnson' },
    { value: 'Autre', label: 'Autre' },
];

export const GLASS_TYPE_OPTIONS: OptionType[] = [
    { value: '', label: ' ' },
    { value: 'Verres anti-reflets', label: 'Verres anti-reflets' },
    { value: 'Anti Lumière bleue', label: 'Anti Lumière bleue' },
    { value: 'Anti-UV', label: 'Anti-UV' },
    { value: 'Progressifs', label: 'Progressifs' },
    { value: 'Solaires', label: 'Solaires' },
    { value: 'Photochromiques', label: 'Photochromiques' },
    { value: 'Organiques', label: 'Organiques' },
    { value: 'Minérales', label: 'Minérales' },
    { value: 'Bifocales', label: 'Bifocales' },
    { value: 'Concaves thérapeutiques', label: 'Concaves thérapeutiques' },
    { value: 'Photogris', label: 'Photogris' },
    { value: 'Photobruns', label: 'Photobruns' },
];

export const CONTACT_LENS_TYPE_OPTIONS: OptionType[] = [
    { value: '', label: ' ' },
    { value: 'Sphérique', label: 'Sphérique' },
    { value: 'Torique', label: 'Torique' },
];

export const PACHYMETRY_VALUES = (() => {
    const values: OptionType[] = [{ value: '', label: ' ' }];
    for (let i = 400; i <= 700; i++) {
        values.push({ value: i.toString(), label: i.toString() });
    }
    return values;
})();

