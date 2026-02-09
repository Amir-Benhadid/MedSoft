export interface UnifiedPatientItem {
    patientId: string;
    patient: any; // Using any for flexibility to match unified fields
    status: 'in_consultation' | 'waiting' | 'booked' | 'completed' | 'paid' | 'cancelled';
    time: Date;
    source: 'waitlist' | 'appointment';
    waitlistId?: string;
    appointmentId?: string;
    notes?: string;
    needsDilation?: boolean;
    dilationStatus?: string;
    consultationTypeId?: number;
    arrivalTime?: Date; // When patient arrived (for waitlist entries)
}
