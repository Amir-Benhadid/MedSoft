import { useEffect } from 'react';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { lentilleService } from '@/ui/services/LentilleService';
import { formatNumberWithSign } from '@/shared/formatters';

function writeContactLensResult(eye: 'right' | 'left', eyeData: any, converted: any) {
    const fieldPrefix = eye === 'right' ? 'rightEye' : 'leftEye';
    const type = eyeData.contactLensType || 'Sphérique';
    const isSpherical = type === 'Sphérique';

    const currentState = useConsultationStore.getState();
    const unified = currentState.documentOverrides.unifiedDocumentsState || {};
    const printStates = unified.printStates || {};
    const contactsData = { ...(printStates.printContactLensesData || { leftEye: {}, rightEye: {} }) };

    if (converted && isFinite(converted.sphere)) {
        contactsData[fieldPrefix] = {
            ...(contactsData[fieldPrefix] || {}),
            sph: formatNumberWithSign(converted.sphere),
            cyl: isSpherical ? '' : formatNumberWithSign(converted.cylinder),
            axis: isSpherical ? '' : String(converted.axis ?? ''),
            contactLensType: type,
            diam: eyeData.diam || '',
            axis_k: eyeData.rayon || eyeData.axis_k || '',
            lensBrand: eyeData.lensBrand || '',
            lensType: eyeData.lensType || '',
        };
    } else {
        contactsData[fieldPrefix] = {
            ...(contactsData[fieldPrefix] || {}),
            sph: eyeData.sph || '',
            cyl: eyeData.cyl || '',
            axis: String(eyeData.axis ?? ''),
            contactLensType: type,
            diam: eyeData.diam || '',
            axis_k: eyeData.rayon || eyeData.axis_k || '',
            lensBrand: eyeData.lensBrand || '',
            lensType: eyeData.lensType || '',
        };
    }

    const newUnified = {
        ...unified,
        printStates: { ...printStates, printContactLensesData: contactsData },
    };
    useConsultationStore.getState().setDocumentOverride('unifiedDocumentsState', newUnified);
    useConsultationStore.getState().setDocumentOverride('contacts', contactsData);
}

export function useContactLensSync() {
    const rightEye = useConsultationStore(state => state.rightEye);
    const leftEye = useConsultationStore(state => state.leftEye);

    useEffect(() => {
        let cancelled = false;
        const type = rightEye.contactLensType || 'Sphérique';

        lentilleService.convertToContactLens(
            rightEye.sph || '', rightEye.cyl || '', rightEye.axis || '', type
        ).then(converted => {
            if (cancelled) return;
            writeContactLensResult('right', rightEye, converted);
        });

        return () => { cancelled = true; };
    }, [rightEye.sph, rightEye.cyl, rightEye.axis, rightEye.contactLensType, rightEye.diam, rightEye.axis_k, rightEye.rayon, rightEye.lensBrand, rightEye.lensType]);

    useEffect(() => {
        let cancelled = false;
        const type = leftEye.contactLensType || 'Sphérique';

        lentilleService.convertToContactLens(
            leftEye.sph || '', leftEye.cyl || '', leftEye.axis || '', type
        ).then(converted => {
            if (cancelled) return;
            writeContactLensResult('left', leftEye, converted);
        });

        return () => { cancelled = true; };
    }, [leftEye.sph, leftEye.cyl, leftEye.axis, leftEye.contactLensType, leftEye.diam, leftEye.axis_k, leftEye.rayon, leftEye.lensBrand, leftEye.lensType]);
}
