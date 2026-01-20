import { useAppointments, useDeleteAppointment, useUpdateAppointment, useMarkPresent, useToggleDilation, Appointment } from '@/ui/hooks/useAppointments';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/ui/lib/utils';
import { EventClickArg, DatesSetArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import { useSheetStack } from '@/ui/components/ui/sheet-stack';
import { getLocalISOString } from '@/ui/lib/time';

// Modular Components
import { EnhancedCalendarEvent } from './CalendarEvent';
import { CalendarMenu } from './CalendarMenu';
import { CalendarAppointmentContent } from './CalendarAppointmentSheet';
import { CalendarQuickActions } from './CalendarQuickActions';
import { MarkPresentDialog } from './MarkPresentDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/components/ui/alert-dialog";

interface CalendarProps {
    onDateSelect?: (date: string) => void;
    onEventClick?: (apt: Appointment) => void;
    onRangeChange?: (range: { start: Date, end: Date, view: string }) => void;
}

export default function Calendar({ onDateSelect, onEventClick, onRangeChange }: CalendarProps) {
    // --- State ---
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: getLocalISOString(new Date(new Date().setHours(0, 0, 0, 0))),
        end: getLocalISOString(new Date(new Date().setHours(23, 59, 59, 999)))
    });

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);
    const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
    const [isF4Pressed, setIsF4Pressed] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

    const calendarRef = useRef<FullCalendar>(null);
    const { openSheet, closeSheet } = useSheetStack();

    // --- Hooks ---
    const { data: appointments = [], isLoading } = useAppointments(dateRange.start, dateRange.end);
    const updateAppointment = useUpdateAppointment();
    const deleteAppointment = useDeleteAppointment();
    // const markPresent = useMarkPresent(); // Moved to MarkPresentDialog
    const toggleDilation = useToggleDilation();

    // --- Statistics ---
    const dilationCount = useMemo(() =>
        appointments.filter(apt => apt.needs_dilation && apt.state === 'booked').length,
        [appointments]
    );

    // --- F4 Key Listener ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F4') {
                e.preventDefault();
                setIsF4Pressed(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'F4') {
                setIsF4Pressed(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // --- Calendar Handlers (Memoized) ---
    const handleDatesSet = useCallback((arg: DatesSetArg) => {
        setDateRange({
            start: getLocalISOString(arg.start),
            end: getLocalISOString(arg.end)
        });
        onRangeChange?.({ start: arg.start, end: arg.end, view: arg.view.type });
    }, [onRangeChange]);

    const openAppointmentSheet = useCallback((apt: Appointment | null, date?: Date) => {
        openSheet(
            <CalendarAppointmentContent
                onClose={() => closeSheet('appointment-sheet')}
                appointment={apt}
                defaultDate={date}
            />,
            { id: 'appointment-sheet', width: 480 }
        );
    }, [openSheet, closeSheet]);

    const handleDateClick = useCallback((arg: { date: Date }) => {
        setDefaultDate(arg.date);
        setSelectedAppointment(null);
        openAppointmentSheet(null, arg.date);
        onDateSelect?.(arg.date.toISOString());
    }, [onDateSelect, openAppointmentSheet]);

    const handleEventClick = useCallback((arg: EventClickArg) => {
        const apt = appointments.find(a => a.id === arg.event.id);
        if (apt) {
            setSelectedAppointment(apt);
            // Position menu near the click or the event element
            const rect = arg.el.getBoundingClientRect();
            setMenuPosition({
                x: rect.left + window.scrollX,
                y: rect.bottom + window.scrollY
            });
            onEventClick?.(apt);
        }
    }, [appointments, onEventClick]);

    const handleEventDrop = useCallback(async (arg: EventDropArg) => {
        if (!arg.event.start || !arg.event.end) return;
        await updateAppointment.mutateAsync({
            id: arg.event.id,
            updates: {
                start_time: arg.event.start.toISOString(),
                end_time: arg.event.end.toISOString()
            }
        });
    }, [updateAppointment]);

    // --- Event Logic (Memoized) ---
    const isOverdue = useCallback((apt: Appointment) => {
        const now = new Date();
        const endTime = new Date(apt.end_time);
        return now > endTime && apt.state === 'booked';
    }, []);

    const calendarEvents = useMemo(() => {
        return appointments.map(apt => {
            const effectiveState = isOverdue(apt) ? 'overdue' : apt.state;
            return {
                id: apt.id,
                title: apt.title || 'Sans titre',
                start: apt.start_time,
                end: apt.end_time,
                extendedProps: {
                    ...apt,
                    state: effectiveState
                },
                backgroundColor: 'transparent',
                borderColor: 'transparent'
            };
        });
    }, [appointments, isOverdue]);

    const renderEventContent = useCallback((eventInfo: EventContentArg) => {
        const isDayView = eventInfo.view.type !== 'dayGridMonth';
        return <EnhancedCalendarEvent event={eventInfo.event} isDayView={isDayView} showArrivalAlways={isF4Pressed} />;
    }, [isF4Pressed]);

    // --- Menu Handlers (Memoized) ---
    const handleMenuClose = useCallback(() => {
        setMenuPosition(null);
    }, []);

    const handleEdit = useCallback(() => {
        if (selectedAppointment) {
            openAppointmentSheet(selectedAppointment);
        }
    }, [selectedAppointment, openAppointmentSheet]);

    const handleDelete = useCallback(() => {
        if (selectedAppointment) {
            setAppointmentToDelete(selectedAppointment);
        }
    }, [selectedAppointment]);

    const confirmDelete = async () => {
        if (appointmentToDelete) {
            await deleteAppointment.mutateAsync(appointmentToDelete.id);
            setAppointmentToDelete(null);
            setMenuPosition(null); // Also close menu
        }
    };



    // ... (keep usage as is)

    const [isMarkPresentDialogOpen, setIsMarkPresentDialogOpen] = useState(false);

    const handleMarkPresent = useCallback(() => {
        if (selectedAppointment) {
            setIsMarkPresentDialogOpen(true);
            setMenuPosition(null); // Close menu
        }
    }, [selectedAppointment]);

    const handleToggleDilation = useCallback(async () => {
        if (selectedAppointment) {
            await toggleDilation.mutateAsync({
                id: selectedAppointment.id,
                needsDilation: !selectedAppointment.needs_dilation
            });
        }
    }, [selectedAppointment, toggleDilation]);

    const handleNewAppointment = useCallback(() => {
        setSelectedAppointment(null);
        setDefaultDate(new Date());
        openAppointmentSheet(null, new Date());
    }, [openAppointmentSheet]);

    return (
        <div className="h-full w-full p-0 flex flex-col appointment-calendar-container overflow-hidden">
            {/* Quick Actions Toolbar */}
            <CalendarQuickActions
                onNewAppointment={handleNewAppointment}
                appointmentCount={appointments.length}
                dilationCount={dilationCount}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                /* Main Container */
                .appointment-calendar-container {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                }

                /* Toolbar Styles - Modern & Spacious */
                .appointment-calendar-container .fc-toolbar {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
                    border-radius: 12px !important;
                    padding: 10px 12px !important;
                    margin-bottom: 12px !important;
                    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.2), 0 8px 10px -6px rgba(79, 70, 229, 0.1) !important;
                    backdrop-filter: blur(12px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    flex-wrap: wrap !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-toolbar {
                        border-radius: 16px !important;
                        padding: 14px 20px !important;
                        margin-bottom: 16px !important;
                        gap: 12px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-toolbar {
                        border-radius: 20px !important;
                        padding: 16px 24px !important;
                        margin-bottom: 20px !important;
                        gap: 16px !important;
                    }
                }
                
                .appointment-calendar-container .fc-toolbar-title {
                    color: white !important;
                    font-weight: 800 !important;
                    font-size: 1.1rem !important;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
                    letter-spacing: -0.025em !important;
                    margin: 0 !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-toolbar-title {
                        font-size: 1.3rem !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-toolbar-title {
                        font-size: 1.5rem !important;
                    }
                }

                .appointment-calendar-container .fc-toolbar-chunk {
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-toolbar-chunk {
                        gap: 10px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-toolbar-chunk {
                        gap: 12px !important;
                    }
                }
                
                /* Button Styles - Refined */
                .appointment-calendar-container .fc-button {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-weight: 600 !important;
                    border-radius: 8px !important;
                    text-transform: none !important;
                    font-size: 0.7rem !important;
                    padding: 6px 10px !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-button {
                        border-radius: 10px !important;
                        font-size: 0.75rem !important;
                        padding: 7px 14px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-button {
                        font-size: 0.8125rem !important;
                        padding: 8px 16px !important;
                    }
                }
                
                .appointment-calendar-container .fc-button:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    transform: translateY(-1px) !important;
                }

                .appointment-calendar-container .fc-button:active {
                    transform: translateY(0px) !important;
                }
                
                .appointment-calendar-container .fc-button-active {
                    background: white !important;
                    color: #4f46e5 !important;
                    border-color: white !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                }

                .appointment-calendar-container .fc-button-group {
                    gap: 3px !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-button-group {
                        gap: 4px !important;
                    }
                }

                .appointment-calendar-container .fc-today-button {
                    background: #ffffff !important;
                    color: #4f46e5 !important;
                    font-weight: 700 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                }

                .appointment-calendar-container .fc-today-button:disabled {
                    background: rgba(255, 255, 255, 0.15) !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                    opacity: 1 !important;
                }

                .appointment-calendar-container .fc-button-group .fc-button {
                    border-radius: 8px !important;
                    margin-left: 0 !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-button-group .fc-button {
                        border-radius: 10px !important;
                    }
                }
                
                /* Column Header Styles - Cleaner */
                .appointment-calendar-container .fc-col-header {
                    background-color: #f8fafc !important;
                }

                .appointment-calendar-container .fc-col-header-cell {
                    padding: 8px 0 !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    vertical-align: middle !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-col-header-cell {
                        padding: 10px 0 !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-col-header-cell {
                        padding: 12px 0 !important;
                    }
                }
                
                .appointment-calendar-container .fc-col-header-cell-cushion {
                    font-weight: 700 !important;
                    color: #475569 !important;
                    text-decoration: none !important;
                    padding: 3px 6px !important;
                    font-size: 0.75rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-col-header-cell-cushion {
                        padding: 4px 8px !important;
                        font-size: 0.8125rem !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-col-header-cell-cushion {
                        font-size: 0.875rem !important;
                    }
                }
                
                .appointment-calendar-container .fc-col-header-cell-cushion:hover {
                    color: #4f46e5 !important;
                }
                
                /* Time Grid Slots */
                .appointment-calendar-container .fc-timegrid-slot {
                    height: 50px !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-timegrid-slot {
                        height: 60px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-timegrid-slot {
                        height: 70px !important;
                    }
                }
                
                .appointment-calendar-container .fc-timegrid-slot-label {
                    font-size: 0.65rem !important;
                    color: #94a3b8 !important;
                    font-weight: 600 !important;
                    padding-right: 8px !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-timegrid-slot-label {
                        font-size: 0.7rem !important;
                        padding-right: 10px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-timegrid-slot-label {
                        font-size: 0.75rem !important;
                        padding-right: 12px !important;
                    }
                }
                
                .appointment-calendar-container .fc-timegrid-axis {
                    background: #f8fafc !important;
                }
                
                /* Event Styles - Day/Week View */
                .appointment-calendar-container .fc-v-event {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                .appointment-calendar-container .fc-timegrid-event {
                    margin: 1px 2px !important;
                    border-radius: 8px !important;
                    overflow: visible !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-timegrid-event {
                        margin: 2px 3px !important;
                        border-radius: 10px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-timegrid-event {
                        margin: 2px 4px !important;
                        border-radius: 12px !important;
                    }
                }
                
                /* Month View (Day Grid) Design */
                .appointment-calendar-container .fc-daygrid-day {
                    transition: background-color 0.2s ease !important;
                }

                .appointment-calendar-container .fc-daygrid-day-frame {
                    min-height: 80px !important;
                    padding: 6px !important;
                    background: #ffffff !important;
                    border-radius: 0 !important;
                    margin: 0 !important;
                    transition: all 0.2s ease !important;
                    overflow: hidden !important;
                    border: none !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-daygrid-day-frame {
                        min-height: 100px !important;
                        padding: 8px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-daygrid-day-frame {
                        min-height: 140px !important;
                        padding: 10px !important;
                    }
                }
                
                .appointment-calendar-container .fc-daygrid-day:hover {
                    background-color: #f1f5f9 !important;
                }
                
                .appointment-calendar-container .fc-daygrid-day-top {
                    flex-direction: row !important;
                    justify-content: flex-end !important;
                    margin-bottom: 4px !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-daygrid-day-top {
                        margin-bottom: 6px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-daygrid-day-top {
                        margin-bottom: 8px !important;
                    }
                }

                .appointment-calendar-container .fc-daygrid-day-number {
                    font-weight: 700 !important;
                    font-size: 0.85rem !important;
                    padding: 4px !important;
                    color: #64748b !important;
                    text-decoration: none !important;
                    min-width: 24px !important;
                    min-height: 24px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 6px !important;
                    transition: all 0.2s ease !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-daygrid-day-number {
                        font-size: 0.9rem !important;
                        min-width: 28px !important;
                        min-height: 28px !important;
                        border-radius: 7px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-daygrid-day-number {
                        font-size: 1rem !important;
                        padding: 6px !important;
                        min-width: 32px !important;
                        min-height: 32px !important;
                        border-radius: 8px !important;
                    }
                }
                
                .appointment-calendar-container .fc-daygrid-event {
                    margin: 1px 2px !important;
                    border-radius: 6px !important;
                    padding: 0 !important;
                    border: none !important;
                    display: block !important;
                    width: auto !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-daygrid-event {
                        margin: 2px 3px !important;
                        border-radius: 7px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-daygrid-event {
                        margin: 2px 4px !important;
                        border-radius: 8px !important;
                    }
                }
                
                /* Today Highlight - Refined */
                .appointment-calendar-container .fc-day-today {
                    background-color: rgba(79, 70, 229, 0.04) !important;
                }
                
                .appointment-calendar-container .fc-day-today .fc-daygrid-day-number {
                    background-color: #ef4444 !important;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
                    color: white !important;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3) !important;
                }

                .appointment-calendar-container .fc-day-today .fc-col-header-cell-cushion {
                    color: #4f46e5 !important;
                }
                
                /* Now Indicator */
                .appointment-calendar-container .fc-timegrid-now-indicator-line {
                    border-color: #ef4444 !important;
                    border-width: 2px !important;
                    z-index: 10 !important;
                }

                .appointment-calendar-container .fc-timegrid-now-indicator-line::before {
                    content: '' !important;
                    position: absolute !important;
                    left: -6px !important;
                    top: -5px !important;
                    width: 10px !important;
                    height: 10px !important;
                    background-color: #ef4444 !important;
                    border-radius: 50% !important;
                }
                
                /* Grid Lines */
                .appointment-calendar-container .fc-theme-standard td, 
                .appointment-calendar-container .fc-theme-standard th {
                    border-color: #f1f5f9 !important;
                }

                .appointment-calendar-container .fc-theme-standard .fc-scrollgrid {
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    border: 1px solid #e2e8f0 !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-theme-standard .fc-scrollgrid {
                        border-radius: 10px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .appointment-calendar-container .fc-theme-standard .fc-scrollgrid {
                        border-radius: 12px !important;
                    }
                }

                /* Custom scrollbar for better look */
                .appointment-calendar-container .fc-scroller::-webkit-scrollbar {
                    width: 6px !important;
                    height: 6px !important;
                }

                @media (min-width: 640px) {
                    .appointment-calendar-container .fc-scroller::-webkit-scrollbar {
                        width: 8px !important;
                        height: 8px !important;
                    }
                }

                .appointment-calendar-container .fc-scroller::-webkit-scrollbar-track {
                    background: #f8fafc !important;
                }
                .appointment-calendar-container .fc-scroller::-webkit-scrollbar-thumb {
                    background: #cbd5e1 !important;
                    border-radius: 4px !important;
                }
                .appointment-calendar-container .fc-scroller::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8 !important;
                }

                /* Mobile-specific optimizations */
                @media (max-width: 639px) {
                    .appointment-calendar-container .fc-toolbar {
                        justify-content: center !important;
                    }

                    .appointment-calendar-container .fc-toolbar-chunk {
                        justify-content: center !important;
                    }

                    /* Hide some text on very small screens */
                    .appointment-calendar-container .fc-button .fc-icon {
                        margin: 0 !important;
                    }
                }
            `}} />

            <div className="flex-1 bg-background rounded-lg sm:rounded-xl border shadow-lg p-2 sm:p-3 lg:p-4 h-[600px] sm:h-[700px] lg:h-[850px]">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    locale={frLocale}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridDay,dayGridMonth'
                    }}
                    buttonText={{
                        today: "Aujourd'hui",
                        day: 'Jour',
                        week: 'Semaine',
                        month: 'Mois'
                    }}
                    titleFormat={{
                        year: 'numeric',
                        month: 'long',
                    }}
                    dayHeaderFormat={{
                        weekday: 'short',
                        day: 'numeric',
                        omitCommas: true
                    }}
                    events={calendarEvents}
                    editable={true}
                    droppable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={1}
                    weekends={true}
                    datesSet={handleDatesSet}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    slotMinTime="08:00:00"
                    slotMaxTime="18:00:00"
                    allDaySlot={false}
                    height="100%"
                    nowIndicator={true}
                    eventContent={renderEventContent}
                    slotDuration="01:00:00"
                    slotLabelInterval="01:00:00"
                    slotEventOverlap={false}
                    eventMaxStack={5}
                    expandRows={true}
                    forceEventDuration={true}
                    defaultTimedEventDuration="01:00:00"
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false,
                        hour12: false
                    }}
                    views={{
                        timeGridDay: {
                            dayHeaderFormat: {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            },
                        },
                        dayGridMonth: {
                            dayMaxEventRows: 3,
                            moreLinkClick: 'day',
                            fixedWeekCount: false,
                            showNonCurrentDates: true,
                            dayHeaderFormat: {
                                weekday: 'short'
                            }
                        }
                    }}
                />
            </div>

            <CalendarMenu
                appointment={selectedAppointment!}
                position={menuPosition}
                onClose={handleMenuClose}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkPresent={handleMarkPresent}
                onToggleDilation={handleToggleDilation}
            />

            <MarkPresentDialog
                isOpen={isMarkPresentDialogOpen}
                onClose={() => setIsMarkPresentDialogOpen(false)}
                appointment={selectedAppointment}
            />



            <AlertDialog open={!!appointmentToDelete} onOpenChange={(open) => !open && setAppointmentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le rendez-vous ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={confirmDelete}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
