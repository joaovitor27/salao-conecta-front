import { BaseService } from './base.service';
import { api } from './api';

export interface AppointmentItem {
  id: string;
  service: number;
  service_name: string;
  price: string;
  duration_minutes: number;
}

export interface Appointment {
  id: number;
  client: {
    id: string;
    name: string;
    phone: string;
    cpf?: string;
  };
  professional: {
    id: string;
    full_name: string;
    role: string;
  } | null;
  items: AppointmentItem[];
  start_time: string | null;
  end_time: string | null;
  status: string;
  status_display: string;
  total_price: string;
  discount: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentItemCreate {
  service_id: number;
  price?: string | number;
}

export interface AppointmentCreate {
  client_id: string; // UUID
  professional_id?: string | null; // UUID
  services: AppointmentItemCreate[];
  start_time: string; // ISO String
  discount?: string | number;
  notes?: string;
}

class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super('/v1/appointments');
  }

  // Override create to use AppointmentCreate instead of Partial<Appointment>
  async createAppointment(data: AppointmentCreate): Promise<Appointment> {
    const response = await api.post<Appointment>(this.endpoint, data);
    return response.data;
  }

  async updateAppointment(id: number | string, data: AppointmentCreate): Promise<Appointment> {
    const response = await api.put<Appointment>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  // Atualizar apenas o status
  async updateStatus(id: number | string, status: string): Promise<Appointment> {
    const response = await api.patch<Appointment>(`${this.endpoint}/${id}/status`, { status });
    return response.data;
  }

  // Listar atendimentos por intervalo de datas (para o calendário)
  async listByDateRange(
    dateFrom: string,
    dateTo: string,
    filters?: { professional?: string[]; service?: string[]; status?: string[] },
  ): Promise<Appointment[]> {
    const params: Record<string, string> = {
      date_from: dateFrom,
      date_to: dateTo,
      page_size: '500',
    };
    if (filters?.professional?.length) params.professional = filters.professional.join(',');
    if (filters?.service?.length) params.service = filters.service.join(',');
    if (filters?.status?.length) params.status = filters.status.join(',');

    const response = await api.get<{ results: Appointment[] }>(this.endpoint, { params });
    return response.data.results;
  }
}

export const appointmentService = new AppointmentService();

