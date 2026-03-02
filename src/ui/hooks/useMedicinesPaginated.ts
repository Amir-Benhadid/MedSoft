export interface MedicineOption {
    value: string;
    label: string;
    category?: string;
    form?: string;
    strength?: string;
    defaultDosage?: string;
    prescriptionRequired?: boolean;
    packaging?: string;
    id?: string;
    manufacturer?: string;
    activeIngredient?: string;
}
