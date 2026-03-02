import { useCallback } from 'react';
import { InternalBilanFields } from './useDocumentsState';

interface UseBilanFieldsProps {
    bilanFields: InternalBilanFields;
    setBilanFields: React.Dispatch<React.SetStateAction<InternalBilanFields>>;
    customFieldInputs: {
        bilanPreOp: string;
        bilanDiabete: string;
        bilanInflammatoire: string;
        bilanUveite: string;
    };
    setCustomFieldInputs: React.Dispatch<React.SetStateAction<{
        bilanPreOp: string;
        bilanDiabete: string;
        bilanInflammatoire: string;
        bilanUveite: string;
    }>>;
}

export const useBilanFields = ({
    bilanFields,
    setBilanFields,
    customFieldInputs,
    setCustomFieldInputs,
}: UseBilanFieldsProps) => {
    const handleBilanFieldChange = useCallback(
        (bilanType: string, field: string, checked: boolean) => {
            setBilanFields((prev) => ({
                ...prev,
                [bilanType]: {
                    ...prev[bilanType as keyof typeof prev],
                    [field]: checked,
                },
            }));
        },
        [setBilanFields]
    );

    const handleAddCustomBilanField = useCallback(
        (bilanType: string, customField: string) => {
            if (customField.trim()) {
                setBilanFields((prev) => ({
                    ...prev,
                    [bilanType]: {
                        ...prev[bilanType as keyof typeof prev],
                        customFields: [
                            ...(prev[bilanType as keyof typeof prev].customFields || []),
                            customField.trim(),
                        ],
                    },
                }));
            }
        },
        [setBilanFields]
    );

    const handleRemoveCustomBilanField = useCallback(
        (bilanType: string, index: number) => {
            setBilanFields((prev) => ({
                ...prev,
                [bilanType]: {
                    ...prev[bilanType as keyof typeof prev],
                    customFields:
                        prev[bilanType as keyof typeof prev].customFields?.filter(
                            (_, i) => i !== index
                        ) || [],
                },
            }));
        },
        [setBilanFields]
    );

    const addCustomField = useCallback(
        (bilanType: keyof typeof customFieldInputs) => {
            const value = customFieldInputs[bilanType];
            if (value?.trim()) {
                handleAddCustomBilanField(bilanType, value);
                setCustomFieldInputs((prev) => ({
                    ...prev,
                    [bilanType]: '',
                }));
            }
        },
        [customFieldInputs, handleAddCustomBilanField, setCustomFieldInputs]
    );

    const updateCustomFieldInput = useCallback(
        (bilanType: keyof typeof customFieldInputs, value: string) => {
            setCustomFieldInputs((prev) => ({
                ...prev,
                [bilanType]: value,
            }));
        },
        [setCustomFieldInputs]
    );

    return {
        handleBilanFieldChange,
        handleAddCustomBilanField,
        handleRemoveCustomBilanField,
        addCustomField,
        updateCustomFieldInput,
    };
};
