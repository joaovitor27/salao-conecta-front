import { api } from './api';
import type { PaginatedResponse } from './base.service';
import { buildQueryParams, type QueryParams } from './query';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
}

export interface CustomerListItem extends Customer {
  email: string | null;
  birth_date: string | null;
  is_active: boolean;
  appointments_count: number;
  last_visit: string | null;
  created_at: string;
}

export interface EmployeeServiceLink {
  service_id: number;
  service_name: string;
  commission_rate: string | null;
}

export interface Employee {
  id: string;
  full_name: string;
  role: string;
  services?: EmployeeServiceLink[];
}

export interface ServiceSalon {
  id: number;
  service_name: string;
  price: string;
  duration_minutes: number;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  label: string;
  end_label: string;
  period: 'morning' | 'afternoon' | 'evening';
}

export interface Availability {
  date: string;
  professional_id: string | null;
  duration_minutes: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  slots: AvailabilitySlot[];
}

class BusinessService {
  async getCustomers(search?: string): Promise<Customer[]> {
    const params = search ? { search } : {};
    const response = await api.get('/v1/customers', { params });
    // Assuming backend pagination could be active, return results if exists
    return response.data.results || response.data;
  }

  /** Listagem paginada de clientes (tela de clientes). */
  async listCustomers(params?: QueryParams): Promise<PaginatedResponse<CustomerListItem>> {
    const response = await api.get<PaginatedResponse<CustomerListItem>>(
      `/v1/customers${buildQueryParams({ page: 1, page_size: 10, ...params })}`,
    );
    return response.data;
  }

  async createCustomer(data: { name: string; phone: string; cpf: string }): Promise<Customer> {
    const response = await api.post('/v1/customers', data);
    return response.data;
  }

  /** Profissionais agendáveis. `serviceIds` retorna apenas quem realiza todos os serviços. */
  async getEmployees(serviceIds?: number[]): Promise<Employee[]> {
    const params = serviceIds?.length ? { service: serviceIds.join(',') } : {};
    const response = await api.get('/v1/employees', { params });
    return response.data;
  }

  async getServices(): Promise<ServiceSalon[]> {
    const response = await api.get('/v1/services');
    return response.data;
  }

  /** Horários livres para agendamento. */
  async getAvailability(params: {
    date: string;
    professional?: string | null;
    services?: number[];
    duration?: number;
    slot_minutes?: number;
    appointment?: number | string;
  }): Promise<Availability> {
    const query: Record<string, string> = { date: params.date };
    if (params.professional) query.professional = params.professional;
    if (params.services?.length) query.service = params.services.join(',');
    if (params.duration) query.duration = String(params.duration);
    if (params.slot_minutes) query.slot_minutes = String(params.slot_minutes);
    if (params.appointment) query.appointment = String(params.appointment);

    const response = await api.get<Availability>('/v1/availability', { params: query });
    return response.data;
  }
}

export const businessService = new BusinessService();
