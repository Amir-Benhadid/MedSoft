import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';

export const getInitials = (p: any) => `${p?.name?.[0] || ''}${p?.surname?.[0] || ''}`.toUpperCase();

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'in_consultation': return 'bg-blue-600 text-white border-blue-600';
        case 'waiting': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'booked': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'paid': return 'bg-teal-100 text-teal-700 border-teal-200';
        case 'creance': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-slate-100 text-slate-500';
    }
};

export const getStatusLabel = (status: string) => {
    switch (status) {
        case 'in_consultation': return 'En cours';
        case 'waiting': return 'En attente';
        case 'booked': return 'Prévu';
        case 'completed': return 'Terminé';
        case 'paid': return 'Payé';
        case 'creance': return 'Créance';
        default: return status;
    }
};

export const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        return format(new Date(year, month - 1, day), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
        return 'Date invalide';
    }
};

export const getAge = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
        return `${differenceInYears(new Date(), new Date(dateStr))} ans`;
    } catch {
        return '';
    }
};
