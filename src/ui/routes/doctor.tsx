/**
 * Doctor Dashboard Route
 * 
 * Main route for the doctor interface. Handles patient selection and
 * displays either the patient list, normal dashboard, or radiography dashboard
 * based on URL search parameters.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import DoctorPatientList from '@/ui/components/doctor/DoctorPatientList';
import DoctorDashboard from '@/ui/components/doctor/DoctorDashboard';
import RadiographyDashboard from '@/ui/components/doctor/RadiographyDashboard';
import { FloatingMessaging } from '@/ui/components/doctor/messaging/FloatingMessaging';
import { z } from 'zod';
import { useRealtime } from '@/ui/hooks/useRealtime';

/**
 * Search parameters schema for doctor route
 */
const doctorSearchSchema = z.object({
	patientId: z.string().optional(),
	mode: z.enum(['normal', 'radiography']).optional(),
	consultationId: z.string().optional(),
	action: z.enum(['view', 'consultation']).optional(),
	entrySource: z.enum(['shared_record']).optional(),
});

export const Route = createFileRoute('/doctor')({
	validateSearch: (search) => doctorSearchSchema.parse(search),
	component: DoctorPage,
});

function DoctorPage() {
	useRealtime();
	const { patientId, mode, consultationId, action, entrySource } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

    const setSelectedPatientId = (
        id: string | null,
        mode: 'normal' | 'radiography' = 'normal',
        actionOverride: 'view' | 'consultation' = 'consultation',
        source?: 'shared_record'
    ) => {
        navigate({
            search: (prev) => ({
                ...prev,
                patientId: id ?? undefined,
                mode: id ? mode : undefined,
                action: id ? actionOverride : undefined,
                entrySource: id ? source : undefined,
                consultationId: undefined // Reset consultationId on new patient selection
            }),
        });
	};

	return (
		<div className="flex h-screen w-full overflow-hidden bg-slate-50">
			{/* Single Page Flow: List OR Dashboard */}
			{patientId ? (
				mode === 'radiography' ? (
					<div className="flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
						<RadiographyDashboard
							key={patientId}
							patientId={patientId}
							consultationId={consultationId}
							onBack={() => setSelectedPatientId(null)}
						/>
					</div>
				) : (
					<div className="flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
						<DoctorDashboard
							key={patientId}
							patientId={patientId}
							consultationId={consultationId}
							action={action}
							entrySource={entrySource}
							onBack={() => setSelectedPatientId(null)}
						/>
					</div>
				)
			) : (
				<div className="flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
					<DoctorPatientList onSelectPatient={setSelectedPatientId} />
				</div>
			)}
			<FloatingMessaging />
		</div>
	);
}
