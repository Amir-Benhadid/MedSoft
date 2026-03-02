import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/ui/components/ui/table';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { Eye, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';

interface HistoryTabProps {
    patientId: string;
}

export default function HistoryTab({ patientId }: HistoryTabProps) {
    const { data: consultations, isLoading } = useQuery({
        queryKey: ['consultations', 'history', patientId],
        queryFn: () => (orpcClient as any).consultations.listByPatient({ patientId }),
        enabled: !!patientId
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!consultations || consultations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>Aucune consultation passée</p>
            </div>
        );
    }


    // Filter and Aggregation for Medications
    const medicationHistory = consultations
        .filter((c: any) => c.prescription?.treatments && c.prescription.treatments.length > 0)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((c: any) => ({
            id: c.id,
            date: c.date,
            medications: c.prescription.treatments.map((t: any) => t.name).join(' - ')
        }));

    return (
        <div className="flex flex-col h-full gap-4">
            <Card className="h-full overflow-hidden flex flex-col border-none shadow-sm">
                <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-lg">Historique des consultations</CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Motif / Note</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {consultations.map((consultation: any) => (
                                <TableRow key={consultation.id} className="hover:bg-slate-50 cursor-pointer">
                                    <TableCell className="font-medium text-slate-700">
                                        {format(new Date(consultation.date), 'dd MMM yyyy', { locale: fr })}
                                        <div className="text-xs text-slate-400 font-normal">
                                            {format(new Date(consultation.date), 'HH:mm')}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {consultation.type || 'Consultation'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[300px] truncate text-slate-600 text-sm">
                                            {consultation.clinical_exam?.consultationReason ||
                                                consultation.clinical_exam?.diagnosis ||
                                                "Pas de notes"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}

function HistoryIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 3v9h9" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
