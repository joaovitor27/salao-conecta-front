import { api } from './api';
import type { PaginatedResponse } from './base.service';
import { buildQueryParams, type QueryParams } from './query';

export interface EmployeeServiceLink {
  service_id: number;
  service_name: string;
  commission_rate: string | null;
}

export interface Employee {
  id: string;
  full_name: string;
  cpf_cnpj: string;
  role: string;
  role_display: string;
  contract_type: string;
  contract_type_display: string;
  is_schedulable: boolean;
  is_active: boolean;
  fixed_salary: string;
  default_commission_rate: string;
  email: string | null;
  has_login: boolean;
  services: EmployeeServiceLink[];
  created_at: string;
  updated_at: string;
}

export interface EmployeeServicePayload {
  service_id: number;
  commission_rate?: string | number | null;
}

export interface EmployeePayload {
  full_name: string;
  cpf_cnpj: string;
  role: string;
  contract_type: string;
  is_schedulable: boolean;
  is_active?: boolean;
  fixed_salary?: string | number;
  default_commission_rate?: string | number;
  services: EmployeeServicePayload[];
  email?: string;
  password?: string;
}

export const EMPLOYEE_ROLES = [
  { value: 'professional', label: 'Profissional da Beleza', hasLogin: false },
  { value: 'receptionist', label: 'Recepcionista', hasLogin: true },
  { value: 'manager', label: 'Gerente/Administrador', hasLogin: true },
  { value: 'financial', label: 'Financeiro', hasLogin: true },
  { value: 'support', label: 'Apoio (Faxina, Manutenção)', hasLogin: false },
] as const;

export const CONTRACT_TYPES = [
  { value: 'commission', label: 'Comissionado (Autônomo/Parceiro)' },
  { value: 'fixed', label: 'Fixo (CLT/Mensalista)' },
] as const;

export const roleHasLogin = (role: string): boolean =>
  EMPLOYEE_ROLES.find((item) => item.value === role)?.hasLogin ?? false;

class EmployeeManagementService {
  private endpoint = '/v1/staff';

  async list(params?: QueryParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>(
      `${this.endpoint}${buildQueryParams({ page: 1, page_size: 10, ...params })}`,
    );
    return response.data;
  }

  async create(payload: EmployeePayload): Promise<Employee> {
    const response = await api.post<Employee>(this.endpoint, payload);
    return response.data;
  }

  async update(id: string, payload: Partial<EmployeePayload>): Promise<Employee> {
    const response = await api.patch<Employee>(`${this.endpoint}/${id}`, payload);
    return response.data;
  }

  async deactivate(id: string): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`);
  }

  async reactivate(id: string): Promise<Employee> {
    const response = await api.patch<Employee>(`${this.endpoint}/${id}`, { is_active: true });
    return response.data;
  }
}

export const employeeService = new EmployeeManagementService();
