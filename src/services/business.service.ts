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

export interface ServiceSalonFull {
  id: number;
  service_name: string;
  price: string;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceSalonPayload {
  service_name: string;
  price: string | number;
  duration_minutes: number;
  is_active?: boolean;
}

export interface OperatingHoursDay {
  open: string;
  close: string;
  closed?: boolean;
}

export interface OperatingHours {
  [key: string]: OperatingHoursDay | string;
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

  async getCustomer(id: string): Promise<CustomerListItem> {
    const response = await api.get<CustomerListItem>(`/v1/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: { name: string; phone: string; cpf: string }): Promise<Customer> {
    const response = await api.post('/v1/customers', data);
    return response.data;
  }

  async updateCustomer(id: string, data: Partial<Customer & { birth_date?: string | null; is_active?: boolean }>): Promise<Customer> {
    const response = await api.patch<Customer>(`/v1/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/v1/customers/${id}`);
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

  // Service management (CRUD)
  async listServicesManagement(params?: QueryParams): Promise<PaginatedResponse<ServiceSalonFull>> {
    const response = await api.get<PaginatedResponse<ServiceSalonFull>>(
      `/v1/salon/services${buildQueryParams({ page: 1, page_size: 10, ...params })}`
    );
    return response.data;
  }

  async createServiceSalon(data: ServiceSalonPayload): Promise<ServiceSalonFull> {
    const response = await api.post<ServiceSalonFull>('/v1/salon/services', data);
    return response.data;
  }

  async updateServiceSalon(id: number, data: Partial<ServiceSalonPayload>): Promise<ServiceSalonFull> {
    const response = await api.patch<ServiceSalonFull>(`/v1/salon/services/${id}`, data);
    return response.data;
  }

  async deleteServiceSalon(id: number): Promise<void> {
    await api.delete(`/v1/salon/services/${id}`);
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

  // Operating Hours
  async getOperatingHours(): Promise<{ operating_hours: Record<string, any> }> {
    const response = await api.get<{ operating_hours: Record<string, any> }>('/v1/salon/operating-hours');
    return response.data;
  }

  async updateOperatingHours(data: Record<string, any>): Promise<{ operating_hours: Record<string, any> }> {
    const response = await api.patch<{ operating_hours: Record<string, any> }>('/v1/salon/operating-hours', { operating_hours: data });
    return response.data;
  }
}

export const businessService = new BusinessService();
