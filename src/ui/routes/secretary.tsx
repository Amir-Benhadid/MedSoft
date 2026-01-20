/**
 * Secretary Dashboard Route
 * 
 * Main route for the secretary interface. Provides a tabbed interface with:
 * - Agenda: Calendar and waitlist
 * - Resume: Today's statistics
 * - Tarifs: Consultation types configuration (if appMode is 'both')
 * - Annuaire: Professional contacts (if appMode is 'both')
 * - Monthly: Monthly statistics (if appMode is 'secretary')
 * - Books: PDF library (if appMode is 'secretary')
 * - Settings: Consultation types settings (if appMode is 'secretary')
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import Calendar from '@/ui/components/secretary/calendar/Calendar';
import Waitlist from '@/ui/components/secretary/waitlist/Waitlist';
import SecretaryHeader from '@/ui/components/secretary/SecretaryHeader';
import SecretaryWorkflowSidebar from '@/ui/components/secretary/workflow/SecretaryWorkflowSidebar';
import { TodayResume } from '@/ui/components/shared/stats/TodayResume';
import { BooksLibrary } from '@/ui/components/doctor/books/BookLibrary';
import { MonthlyResume } from '@/ui/components/doctor/resume/MonthlyResume';
import { ConsultationTypesParams } from '@/ui/components/doctor/settings/ConsultationTypesParams';
import { ProfessionalContactsParams } from '@/ui/components/doctor/settings/ProfessionalContactsParams';
import { Settings, CreditCard, Users } from 'lucide-react';
import { useConfig } from '@/ui/contexts/ConfigContext';

export const Route = createFileRoute('/secretary')({
	component: SecretaryPage,
});

/**
 * Secretary page component
 * 
 * Renders the secretary dashboard with workflow sidebar, calendar, waitlist,
 * and various tabs based on app mode and selected tab.
 * 
 * @returns {JSX.Element} Secretary page component
 */
function SecretaryPage() {
	const [currentTab, setCurrentTab] = useState('agenda');
	const [currentViewDate, setCurrentViewDate] = useState(new Date());

	const handleCalendarRangeChange = (range: { start: Date, end: Date, view: string }) => {
		// Only update the view date if we are in a day view, or if we want to 
		// track the start of the range as the potential "context" date.
		// For now, let's sync strictly on day view, or stick to start date.
		// If in month view, maybe we don't force waitlist to update wildly, but 
		// typically "tabs change" implies day-to-day navigation.
		if (range.view === 'timeGridDay') {
			setCurrentViewDate(range.start);
		}
	};

	const handleDateSelect = (dateStr: string) => {
		setCurrentViewDate(new Date(dateStr));
	};

	const { appMode } = useConfig();

	return (
		<div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
			{/* Top Header */}
			<SecretaryHeader
				currentTab={currentTab}
				onTabChange={setCurrentTab}
			/>

			{/* Main Content Area */}
			<main className="flex-1 flex overflow-hidden p-4 gap-4">
				{/* Left Sidebar - Workflow/Messaging */}
				<aside className="w-[380px] flex flex-col shrink-0 overflow-hidden h-full">
					<SecretaryWorkflowSidebar />
				</aside>

				{/* Center Content */}
				<div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 relative h-full">
					{currentTab === 'agenda' ? (
						<div className="flex h-full overflow-hidden">
							<div className="flex-1 h-full overflow-hidden">
								<Calendar
									onRangeChange={handleCalendarRangeChange}
									onDateSelect={handleDateSelect}
								/>
							</div>
							<div className="w-[350px] border-l border-slate-200 bg-slate-50/50 h-full overflow-hidden">
								<Waitlist date={currentViewDate} />
							</div>
						</div>
					) : currentTab === 'resume' ? (
						<div className="flex-1 overflow-auto">
							<TodayResume />
						</div>
					) : (currentTab === 'tarifs' && appMode === 'both') ? (
						<div className="h-full flex flex-col bg-slate-50">
							<div className="bg-white border-b px-6 py-4">
								<div className="flex items-center gap-3 mb-1">
									<div className="p-2 bg-slate-100 rounded-lg">
										<CreditCard className="w-5 h-5 text-slate-600" />
									</div>
									<div>
										<h2 className="text-xl font-bold text-slate-900">Tarifs</h2>
										<p className="text-sm text-slate-500">Configuration des types de consultation et prix</p>
									</div>
								</div>
							</div>
							<div className="flex-1 p-6 overflow-hidden">
								<div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden h-full flex flex-col">
									<ConsultationTypesParams readonly={true} />
								</div>
							</div>
						</div>
					) : (currentTab === 'annuaire' && appMode === 'both') ? (
						<div className="h-full flex flex-col bg-slate-50">
							<div className="bg-white border-b px-6 py-4">
								<div className="flex items-center gap-3 mb-1">
									<div className="p-2 bg-slate-100 rounded-lg">
										<Users className="w-5 h-5 text-slate-600" />
									</div>
									<div>
										<h2 className="text-xl font-bold text-slate-900">Annuaire Pro</h2>
										<p className="text-sm text-slate-500">Liste des médecins, cliniques et contacts professionnels</p>
									</div>
								</div>
							</div>
							<div className="flex-1 p-6 overflow-hidden">
								<div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden h-full flex flex-col">
									<ProfessionalContactsParams />
								</div>
							</div>
						</div>
					) : (currentTab === 'monthly' && appMode === 'secretary') ? (
						<div className="flex-1 overflow-hidden">
							<MonthlyResume />
						</div>
					) : (currentTab === 'books' && appMode === 'secretary') ? (
						<div className="flex-1 overflow-hidden">
							<BooksLibrary />
						</div>
					) : (currentTab === 'settings' && appMode === 'secretary') ? (
						<div className="h-full flex flex-col bg-slate-50">
							<div className="bg-white border-b px-6 py-4">
								<div className="flex items-center gap-3 mb-1">
									<div className="p-2 bg-slate-100 rounded-lg">
										<Settings className="w-5 h-5 text-slate-600" />
									</div>
									<div>
										<h2 className="text-xl font-bold text-slate-900">Paramètres</h2>
										<p className="text-sm text-slate-500">Configuration des tarifs et types de consultation</p>
									</div>
								</div>
							</div>
							<div className="flex-1 p-6 overflow-hidden">
								<div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden h-full flex flex-col">
									<ConsultationTypesParams />
								</div>
							</div>
						</div>
					) : (
						<div className="flex-1 flex items-center justify-center text-slate-400">
							<div className="text-center">
								<p className="text-lg font-medium">Selectionnez un onglet valide</p>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
