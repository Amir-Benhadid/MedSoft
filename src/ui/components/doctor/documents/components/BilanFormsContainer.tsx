import React, { memo } from 'react';
import BilanForm from './BilanForm';
import { InternalBilanFields } from '../hooks/useDocumentsState';
import { useBilanFields } from '../hooks/useBilanFields';
import { useDocumentForm } from '../hooks/useDocumentForm';

interface BilanFormsContainerProps {
    activeDocTab: string;
}

const BilanFormsContainer: React.FC<BilanFormsContainerProps> = ({
    activeDocTab,
}) => {
    // Get form data from hook
    const {
        bilanFields,
        setBilanFields,
        customFieldInputs,
        setCustomFieldInputs,
    } = useDocumentForm();
    const {
        handleBilanFieldChange,
        handleRemoveCustomBilanField,
        addCustomField,
        updateCustomFieldInput,
    } = useBilanFields({
        bilanFields,
        setBilanFields,
        customFieldInputs,
        setCustomFieldInputs,
    });

    const bilanFormConfigs = {
        bilanPreOp: {
            title: 'Bilan Pré-Opératoire',
            fields: [
                { key: 'groupage', label: 'Groupage' },
                { key: 'fnsTP', label: 'FNS - TP' },
                { key: 'ionogramme', label: 'Ionogramme sanguin' },
                { key: 'glycemie', label: 'Glycémie à jeun' },
                { key: 'ureeCreatinine', label: 'Urée - créatinine sanguines' },
                { key: 'bilanHepatique', label: 'Bilan hépatique' },
                { key: 'ecgCardiologie', label: 'ECG / Avis de cardiologie' },
            ],
        },
        bilanDiabete: {
            title: 'Bilan de Diabète',
            fields: [
                { key: 'glycemieJeun', label: 'Glycémie à jeun' },
                { key: 'glycemiePostPrandiale', label: 'Glycémie post-prandiale' },
                { key: 'hbA1c', label: 'HbA1c' },
                { key: 'cholesterol', label: 'Cholestérol sanguin' },
                { key: 'tgb', label: 'TGB' },
            ],
        },
        bilanInflammatoire: {
            title: 'Bilan Inflammatoire',
            fields: [
                { key: 'fns', label: 'FNS' },
                { key: 'crp', label: 'CRP' },
                { key: 'fibrinogene', label: 'Fibrinogène' },
                { key: 'vs', label: 'VS' },
                { key: 'electrophorese', label: 'Électrophorèse des protéines' },
            ],
        },
        bilanUveite: {
            title: 'Bilan d\'Uvéite',
            fields: [
                { key: 'fns', label: 'FNS' },
                { key: 'vsCrp', label: 'VS - CRP' },
                { key: 'electrophorese', label: 'Électrophorèse des protéines' },
                { key: 'toxoplasmose', label: 'Sérologie de la toxoplasmose' },
                { key: 'idrTuberculine', label: 'IDR à la tuberculine' },
                { key: 'aslo', label: 'ASLO' },
                { key: 'typageHla', label: 'Typage HLA B5, B27, B12' },
                { key: 'vdrlTpha', label: 'VDRL, TPHA' },
                { key: 'serologie', label: 'Sérologie (Ag HBs, HIV…)' },
                { key: 'radioThorax', label: 'Radio du thorax, des sacro-iliaques' },
            ],
        },
    };

    const config = bilanFormConfigs[activeDocTab as keyof typeof bilanFormConfigs];

    if (!config) {
        return null;
    }

    return (
        <BilanForm
            bilanType={activeDocTab as keyof InternalBilanFields}
            title={config.title}
            fields={config.fields}
            bilanFields={bilanFields}
            customFieldInput={customFieldInputs[activeDocTab as keyof typeof customFieldInputs]}
            onFieldChange={handleBilanFieldChange}
            onCustomFieldInputChange={(value) =>
                updateCustomFieldInput(activeDocTab as keyof typeof customFieldInputs, value)
            }
            onAddCustomField={() => addCustomField(activeDocTab as keyof typeof customFieldInputs)}
            onRemoveCustomField={(index) => handleRemoveCustomBilanField(activeDocTab, index)}
        />
    );
};

export default memo(BilanFormsContainer);
