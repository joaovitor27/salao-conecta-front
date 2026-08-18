import { BaseService } from './base.service';
import { api } from './api';

export interface Appointment {
  id: number;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  professional: {
    id: string;
    full_name: string;
    role: string;
  } | null;
  service: {
    id: number;
    service_name: string;
    price: string;
    duration_minutes: number;
  };
  start_time: string | null;
  end_time: string | null;
  status: string;
  status_display: string;
  discount: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreate {
  client_id: string; // UUID
  professional_id?: string | null; // UUID
  service_id: number;
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
}

export const appointmentService = new AppointmentService();
