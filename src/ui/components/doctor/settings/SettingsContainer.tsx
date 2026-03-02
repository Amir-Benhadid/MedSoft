import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";
import { Settings, Pill, Euro, List } from "lucide-react";

import { ConsultationTypesParams } from "./ConsultationTypesParams";
import { MedicationsParams } from "./MedicationsParams";
import { AutocompleteParams } from "./AutocompleteParams";
import { ProfessionalContactsParams } from "./ProfessionalContactsParams";
import { RadiographyParams } from "./RadiographyParams";

export function SettingsContainer() {
    return (
        <div className="h-full flex flex-col bg-slate-50">
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Settings className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Paramètres</h2>
                        <p className="text-sm text-slate-500">Gérez les configurations médicales et administratives</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
                <Tabs defaultValue="medications" className="h-full flex flex-col">
                    <TabsList className="w-fit mb-6 bg-white border shadow-sm p-1">
                        <TabsTrigger value="medications" className="gap-2">
                            <Pill className="w-4 h-4" />
                            Médicaments
                        </TabsTrigger>
                        <TabsTrigger value="consultations" className="gap-2">
                            <Euro className="w-4 h-4" />
                            Types de Consultation
                        </TabsTrigger>
                        <TabsTrigger value="autocomplete" className="gap-2">
                            <List className="w-4 h-4" />
                            Listes & Autocomplete
                        </TabsTrigger>
                        <TabsTrigger value="professionals" className="gap-2">
                            <List className="w-4 h-4" />
                            Annuaire Pro
                        </TabsTrigger>
                        <TabsTrigger value="radiography" className="gap-2">
                            <List className="w-4 h-4" />
                            Types de Protocoles
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden relative">
                        <TabsContent value="medications" className="h-full m-0 p-0 outline-none data-[state=active]:flex flex-col">
                            <MedicationsParams />
                        </TabsContent>

                        <TabsContent value="consultations" className="h-full m-0 p-0 outline-none data-[state=active]:flex flex-col">
                            <ConsultationTypesParams />
                        </TabsContent>

                        <TabsContent value="autocomplete" className="h-full m-0 p-0 outline-none data-[state=active]:flex flex-col">
                            <AutocompleteParams />
                        </TabsContent>

                        <TabsContent value="professionals" className="h-full m-0 p-0 outline-none data-[state=active]:flex flex-col">
                            <ProfessionalContactsParams />
                        </TabsContent>

                        <TabsContent value="radiography" className="h-full m-0 p-0 outline-none data-[state=active]:flex flex-col">
                            <RadiographyParams />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
