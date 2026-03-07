import React, { memo } from 'react';
import { Card, CardContent } from '@/ui/components/ui/card';
import { OptimizedInput } from '@/ui/components/ui/optimized-input';
import { Textarea } from '@/ui/components/ui/textarea';
import { Label } from '@/ui/components/ui/label';
import { useDocumentForm } from '../hooks/useDocumentForm';

const GenericDocumentForm: React.FC = () => {
    const { printGenericData, setPrintGenericData } = useDocumentForm();

    const handleTitleChange = (val: string) => {
        setPrintGenericData(prev => ({ ...prev, title: val }));
    };

    const handleTextChange = (val: string) => {
        setPrintGenericData(prev => ({ ...prev, text: val }));
    };

    return (
        <div className="space-y-4">
            <Card className="border border-border">
                <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="generic-title" className="text-sm font-semibold">Titre du document</Label>
                        <OptimizedInput
                            id="generic-title"
                            placeholder="Ex: CERTIFICAT MEDICAL, ATTESTATION..."
                            value={printGenericData.title}
                            onChange={handleTitleChange}
                            className="font-bold text-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="generic-text" className="text-sm font-semibold">Contenu du document</Label>
                        <Textarea
                            id="generic-text"
                            placeholder="Écrivez votre texte ici..."
                            value={printGenericData.text}
                            onChange={(e) => handleTextChange(e.target.value)}
                            className="min-h-[200px]"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default memo(GenericDocumentForm);
