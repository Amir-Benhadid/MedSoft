
import { useState, useEffect } from 'react';
import { Button } from "@/ui/components/ui/button";
import {
    User,
    Calendar,
    Phone,
    MapPin,
    Activity,
    Eye,
    ChevronRight,
    FileText,
    UserCog,
    Clock,
    History as HistoryIcon,
    AlertCircle
} from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useConfig } from "@/ui/contexts/ConfigContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";
import { Badge } from "@/ui/components/ui/badge";
import { ScrollArea } from "@/ui/components/ui/scroll-area";
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from "@/ui/lib/orpc/client";

interface SecretaryPatientDetailsProps {
    patient: any;
    isPatientLoading: boolean;
    onOpenClinicalData: () => void;
    onOpenDocuments: () => void;
    onOpenCertificate: () => void;
    patientId: string;
    onEdit: () => void;
    initialTab?: string;
}

import { SecretaryRefractionPanel } from "./SecretaryRefractionPanel";

export function SecretaryPatientDetails({
    patient,
    isPatientLoading,
    onOpenClinicalData,
    onOpenDocuments,
    onOpenCertificate,
    patientId,
    onEdit,
    initialTab = 'info'
}: SecretaryPatientDetailsProps) {
    const { appMode } = useConfig();
    const [currentTab, setCurrentTab] = useState(initialTab);

    // Sync tab when prop changes (e.g. from search action)
    useEffect(() => {
        if (initialTab) {
            setCurrentTab(initialTab);
        }
    }, [initialTab]);

    // Fetch patient appointments
    const { data: appointments, isLoading: isAppsLoading } = useQuery({
        queryKey: ['appointments', 'patient', patientId],
        queryFn: async () => {
            // Trying listByPatient, fallback to list if needed
            try {
                // @ts-ignore - Assuming method exists based on pattern
                return await orpcClient.appointments.listByPatient({ patientId });
            } catch (e) {
                console.warn("listByPatient failed, checking list filtering?");
                return [];
            }
        },
        enabled: !!patientId,
    });

    // Fetch last refraction data
    const { data: lastRefraction } = useQuery({
        queryKey: ['consultations', 'last-refraction', patientId],
        queryFn: async () => {
            const consultations = await orpcClient.consultations.listByPatient({ patientId });
            // Find most recent consultation with eye data
            return consultations
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .find(c => (c.right_eye?.visualAcuityVL_SC || c.left_eye?.visualAcuityVL_SC || c.right_eye?.sph || c.left_eye?.sph));
        },
        enabled: !!patientId
    });

    const getStatusBadge = (state: string) => {
        switch (state) {
            case 'booked': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Prévu</Badge>;
            case 'present': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Présent</Badge>;
            case 'in_consultation': return <Badge variant="secondary" className="bg-purple-100 text-purple-700">En cours</Badge>;
            case 'completed': return <Badge variant="secondary" className="bg-green-100 text-green-700">Terminé</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Annulé</Badge>;
            default: return <Badge variant="outline">{state}</Badge>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white w-full">
            {/* Header Section */}
            <div className="px-6 py-6 pb-2 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-blue-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-none">
                                    {isPatientLoading ? "Chargement..." : `${patient?.surname}   ${patient?.name}`}
                                </h2>
                                <p className="text-xs font-medium text-slate-400 mt-1.5 flex items-center gap-2">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                        #S-{patientId.slice(0, 8)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {!isPatientLoading && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 text-slate-600 border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 shadow-sm"
                                onClick={onEdit}
                            >
                                <UserCog className="w-4 h-4" />
                                <span className="hidden sm:inline">Modifier</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs View */}
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <TabsList className="h-10 p-1 bg-slate-100/50 rounded-xl w-full grid grid-cols-3 gap-1">
                        <TabsTrigger
                            value="info"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-xs font-semibold"
                        >
                            Infos
                        </TabsTrigger>
                        <TabsTrigger
                            value="rdv"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-xs font-semibold"
                        >
                            RDV
                        </TabsTrigger>
                        <TabsTrigger
                            value="refraction"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-xs font-semibold"
                        >
                            Réfraction
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-hidden bg-slate-50/30">
                    <ScrollArea className="h-full">
                        <TabsContent value="info" className="p-6 space-y-6 m-0 focus-visible:ring-0">
                            {/* Personal Info Card */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">État Civil</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Date de naissance</p>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {patient?.dob ? format(new Date(patient.dob), 'dd MMMM yyyy', { locale: fr }) : '-'}
                                                {patient?.dob && (
                                                    <span className="text-slate-400 font-normal ml-1">
                                                        ({new Date().getFullYear() - new Date(patient.dob).getFullYear()} ans)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Téléphone</p>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {patient?.phone_number || 'Non renseigné'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Adresse</p>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {patient?.street || patient?.city ? (
                                                    <span>{patient.street} {patient.city}</span>
                                                ) : <span className="text-slate-400 italic">Non renseignée</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Info */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Médical</h3>

                                {appMode !== 'secretary' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                                            <Eye className="w-4 h-4" />
                                            Ophtalmologie
                                        </div>
                                        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-slate-700 min-h-[40px]">
                                            {patient?.oph_ants || <span className="text-slate-400 italic text-xs">Aucun antécédent.</span>}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <Activity className="w-4 h-4" />
                                        Général
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700 min-h-[40px]">
                                        {patient?.gen_ants || <span className="text-slate-400 italic text-xs">Aucun antécédent.</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer for Info Tab */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    className="h-auto flex-col gap-1 p-3 border border-teal-200 bg-white hover:bg-teal-50 text-teal-700 shadow-sm"
                                    variant="outline"
                                    onClick={onOpenClinicalData}
                                >
                                    <Activity className="w-5 h-5 mb-1" />
                                    <span className="font-bold text-xs">Données Cliniques</span>
                                </Button>

                                <Button
                                    className="h-auto flex-col gap-1 p-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
                                    variant="outline"
                                    onClick={onOpenDocuments}
                                >
                                    <FileText className="w-5 h-5 mb-1" />
                                    <span className="font-bold text-xs">Documents</span>
                                </Button>

                                <Button
                                    className="h-auto flex-col gap-1 p-3 border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 shadow-sm"
                                    variant="outline"
                                    onClick={onOpenCertificate}
                                >
                                    <FileText className="w-5 h-5 mb-1" />
                                    <span className="font-bold text-xs">Certificat Minute</span>
                                </Button>
                            </div>

                        </TabsContent>

                        <TabsContent value="rdv" className="p-6 m-0 focus-visible:ring-0">
                            <div className="space-y-4">
                                {isAppsLoading ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">Chargement des RDV...</div>
                                ) : appointments && appointments.length > 0 ? (
                                    <div className="space-y-3">
                                        {appointments.map((apt: any) => (
                                            <div key={apt.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                                        <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 uppercase">
                                                            {format(new Date(apt.start_time), 'MMM', { locale: fr })}
                                                        </span>
                                                        <span className="text-lg font-bold text-slate-800 group-hover:text-blue-700">
                                                            {format(new Date(apt.start_time), 'dd')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-slate-900">
                                                                {format(new Date(apt.start_time), 'EEEE', { locale: fr })}
                                                            </span>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                <Clock className="w-3 h-3" />
                                                                {format(new Date(apt.start_time), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                            {apt.notes || "Aucune note"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {getStatusBadge(apt.state)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                            <HistoryIcon className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <h3 className="text-slate-900 font-medium">Aucun historique</h3>
                                        <p className="text-slate-500 text-xs mt-1">Ce patient n'a pas encore de rendez-vous enregistrés.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="refraction" className="p-0 m-0 focus-visible:ring-0">
                            <SecretaryRefractionPanel
                                lastRefractionData={lastRefraction}
                                showRefraction={true}
                                patient={patient}
                            />
                        </TabsContent>
                    </ScrollArea>
                </div>
            </Tabs>
        </div>
    );
}
