/**
 * Status transition rules — mirrored from the backend AppointmentStatusSerializer.
 * Maps each status to its allowed target statuses.
 */

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['pending', 'completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const STATUS_ACTION_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Voltar para Pendente',
  confirmed: 'Confirmar',
  completed: 'Concluir',
  cancelled: 'Cancelar',
};

export function canEdit(status: AppointmentStatus): boolean {
  return status !== 'completed' && status !== 'cancelled';
}

export function getAllowedTransitions(currentStatus: AppointmentStatus): AppointmentStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] ?? [];
}
