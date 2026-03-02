/**
 * Calendar utility functions
 * Handles appointment state colors, class names, and formatting
 * Adapted for new Appointment interface (snake_case)
 */

import type { Appointment } from '@/ui/hooks/useAppointments';

/**
 * Get border color for appointment based on state
 */
export function getAppointmentBorderColor(
    effectiveState: string,
    originalState: string
): string {
    if (effectiveState === 'overdue') return '#c62828';
    if (originalState === 'absent') return '#c62828';
    if (originalState === 'present') return '#2e7d32';
    if (originalState === 'paid') return '#9e9e9e';
    if (originalState === 'completed') return '#ff9800';
    if (originalState === 'in_consultation') return '#7b1fa2';
    return '#0d47a1';
}

/**
 * Get CSS class name for appointment based on state
 */
export function getAppointmentClassName(
    effectiveState: string,
    originalState: string
): string {
    if (effectiveState === 'overdue') return 'appointment-overdue';
    if (originalState === 'absent') return 'appointment-absent';
    if (originalState === 'present') return 'appointment-present';
    if (originalState === 'paid') return 'appointment-paid';
    if (originalState === 'completed') return 'appointment-completed';
    if (originalState === 'in_consultation') return 'appointment-in-consultation';
    return 'appointment-booked';
}

/**
 * Check if appointment is overdue
 */
export function isAppointmentOverdue(appointment: Appointment): boolean {
    const now = new Date();
    const aptEndTime = new Date(appointment.end_time);
    return now > aptEndTime && appointment.state === 'booked';
}

/**
 * Get effective state for appointment (handles overdue)
 */
export function getEffectiveAppointmentState(appointment: Appointment): string {
    return isAppointmentOverdue(appointment) ? 'overdue' : appointment.state;
}

/**
 * Format arrival time for display
 */
export function formatArrivalTime(
    arrivedAt: string | undefined | null
): string | null {
    if (!arrivedAt) return null;
    try {
        const date = new Date(arrivedAt);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch {
        return null;
    }
}

/**
 * Check if appointment has changed
 */
export function hasAppointmentChanged(
    prev: Appointment,
    current: Appointment
): boolean {
    return (
        prev.title !== current.title ||
        prev.start_time !== current.start_time || // Changed from start
        prev.end_time !== current.end_time ||     // Changed from end
        prev.state !== current.state ||
        prev.needs_dilation !== current.needs_dilation || // Changed from needsDilation
        prev.dilation_status !== current.dilation_status || // Changed from isDilated check (adapter logic needed if logic differs)
        prev.arrived_at !== current.arrived_at
    );
}

// Map tailwind/standard colors to appointment states for Shadcn badges/indicators if needed
export const appointmentStateColors = {
    booked: 'bg-primary text-primary-foreground',
    present: 'bg-green-600 text-white',
    in_consultation: 'bg-purple-600 text-white',
    completed: 'bg-orange-500 text-white',
    paid: 'bg-gray-500 text-white',
    overdue: 'bg-red-600 text-white',
};
