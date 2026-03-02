import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { FileText, Printer, Download, Eye } from 'lucide-react';

interface DocumentsTabProps {
    patientId: string;
}

export default function DocumentsTab({ patientId }: DocumentsTabProps) {
    // This is a placeholder structure. 
    // In a real implementation, this would fetch generated documents or allow generating new ones.

    const docTypes = [
        { id: 'prescription', label: 'Ordonnance', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'certificat', label: 'Certificat Médical', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'compte-rendu', label: 'Compte Rendu', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'lettre', label: 'Lettre d\'orientation', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="flex h-full gap-6">
            <div className="flex-1 flex flex-col gap-6">
                {/* Generation Grid */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg">Générer un document</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {docTypes.map((doc) => (
                                <button
                                    key={doc.id}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-full ${doc.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <doc.icon className={`w-6 h-6 ${doc.color}`} />
                                    </div>
                                    <span className="font-semibold text-slate-700 text-sm">{doc.label}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Documents List */}
                <Card className="flex-1 border-none shadow-sm flex flex-col">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg">Documents Récents</CardTitle>
                    </CardHeader>
                    <div className="flex-1 p-6 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 m-6 rounded-xl">
                        <p>Aucun document généré pour le moment</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
