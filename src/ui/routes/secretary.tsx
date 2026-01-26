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
import { Sheet, SheetContent } from '@/ui/components/ui/sheet';
import { SecretaryFloatingMessaging } from '@/ui/components/secretary/messaging/SecretaryFloatingMessaging';

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

	// Responsive State
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

	const handleCalendarRangeChange = (range: { start: Date, end: Date, view: string }) => {
		if (range.view === 'timeGridDay') {
			setCurrentViewDate(range.start);
		}
	};

	const handleDateSelect = (dateStr: string) => {
		setCurrentViewDate(new Date(dateStr));
	};

	const handleTabChange = (tab: string) => {
		if (tab === 'toggle-sidebar') {
			setIsSidebarOpen(true);
		} else if (tab === 'toggle-waitlist') {
			setIsWaitlistOpen(true);
		} else {
			setCurrentTab(tab);
		}
	};

	const { appMode } = useConfig();

	// Standardized Content Wrapper
	const ContentCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
		<div className={`flex-1 flex flex-col overflow-hidden bg-card rounded-xl shadow-sm border border-border relative h-full min-w-0 ${className}`}>
			{children}
		</div>
	);

	// Standardized Header for Tabs
	const TabHeader = ({ title, subtitle, icon: Icon }: { title: string, subtitle: string, icon: any }) => (
		<div className="bg-card border-b border-border px-6 py-4">
			<div className="flex items-center gap-3 mb-1">
				<div className="p-2 bg-primary/10 rounded-lg">
					<Icon className="w-5 h-5 text-primary" />
				</div>
				<div>
					<h2 className="text-xl font-bold text-foreground">{title}</h2>
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				</div>
			</div>
		</div>
	);

	// Render helpers
	const renderContent = () => {
		if (currentTab === 'agenda') {
			return (
				<div className="flex h-full overflow-hidden relative bg-transparent">
					<ContentCard className="flex-1 mr-6">
						<Calendar
							onRangeChange={handleCalendarRangeChange}
							onDateSelect={handleDateSelect}
						/>
					</ContentCard>

					{/* Desktop Waitlist - Now a separate card */}
					<div className="hidden lg:block w-[350px] shrink-0 h-full">
						<div className="h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
							<Waitlist date={currentViewDate} />
						</div>
					</div>

					{/* Mobile Waitlist Sheet */}
					<Sheet open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen}>
						<SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0 border-border bg-card">
							<div className="h-full pt-6">
								<Waitlist date={currentViewDate} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			);
		}

		if (currentTab === 'resume') {
			return (
				<ContentCard>
					<TabHeader title="Résumé du Jour" subtitle="Statistiques et activité quotidienne" icon={BarChart2} />
					<div className="flex-1 overflow-auto">
						<TodayResume />
					</div>
				</ContentCard>
			);
		}

		if (currentTab === 'tarifs' && appMode === 'both') {
			return (
				<ContentCard>
					<TabHeader title="Tarifs" subtitle="Configuration des types de consultation et prix" icon={CreditCard} />
					<div className="flex-1 p-6 overflow-hidden">
						<ConsultationTypesParams readonly={true} />
					</div>
				</ContentCard>
			);
		}

		if (currentTab === 'annuaire' && appMode === 'both') {
			return (
				<ContentCard>
					<TabHeader title="Annuaire Pro" subtitle="Liste des médecins, cliniques et contacts professionnels" icon={Users} />
					<div className="flex-1 p-6 overflow-hidden">
						<ProfessionalContactsParams />
					</div>
				</ContentCard>
			);
		}

		if (currentTab === 'monthly' && appMode === 'secretary') {
			return (
				<ContentCard>
					<TabHeader title="Résumé Mensuel" subtitle="Vue d'ensemble de l'activité du mois" icon={CalendarIcon} />
					<div className="flex-1 overflow-hidden">
						<MonthlyResume />
					</div>
				</ContentCard>
			);
		}

		if (currentTab === 'books' && appMode === 'secretary') {
			return (
				<ContentCard>
					<TabHeader title="Bibliothèque" subtitle="Documents et ressources PDF" icon={BookOpen} />
					<div className="flex-1 overflow-hidden">
						<BooksLibrary />
					</div>
				</ContentCard>
			);
		}

		if (currentTab === 'settings' && appMode === 'secretary') {
			return (
				<ContentCard>
					<TabHeader title="Paramètres" subtitle="Configuration des tarifs et types de consultation" icon={Settings} />
					<div className="flex-1 p-6 overflow-hidden">
						<ConsultationTypesParams />
					</div>
				</ContentCard>
			);
		}

		return (
			<ContentCard>
				<div className="flex-1 flex items-center justify-center text-muted-foreground">
					<div className="text-center">
						<p className="text-lg font-medium">Selectionnez un onglet valide</p>
					</div>
				</div>
			</ContentCard>
		);
	};

	return (
		<div className="h-screen w-full bg-secondary/20 flex flex-col overflow-hidden font-sans text-foreground">
			{/* Top Header */}
			<SecretaryHeader
				currentTab={currentTab}
				onTabChange={handleTabChange}
			/>

			{/* Main Content Area */}
			<main className="flex-1 flex overflow-hidden p-2 sm:p-4 lg:p-6 gap-2 sm:gap-4 lg:gap-6">
				{/* Desktop Sidebar - Workflow/Messaging - Takes styling from component itself or wrapper? */}
				{/* Let's wrap it in a Card style wrapper if the sidebar itself isn't one. The Sidebar has its own structure. */}
				<aside className="hidden lg:flex w-[380px] flex-col shrink-0 overflow-hidden h-full bg-card rounded-xl border border-border shadow-sm">
					<SecretaryWorkflowSidebar />
				</aside>

				{/* Mobile Sidebar Sheet */}
				<Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
					<SheetContent side="left" className="w-[85vw] sm:w-[380px] p-0 border-border bg-card">
						<div className="h-full pt-4">
							<SecretaryWorkflowSidebar />
						</div>
					</SheetContent>
				</Sheet>

				{/* Center Content */}
				<div className="flex-1 flex flex-col overflow-hidden relative h-full min-w-0">
					{renderContent()}
				</div>
			</main>
			<SecretaryFloatingMessaging />
		</div>
	);
}

// Helper icons
import { Calendar as CalendarIcon, BookOpen, BarChart2 } from 'lucide-react';
