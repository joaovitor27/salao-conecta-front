import { api } from './api';

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface Employee {
  id: string;
  full_name: string;
  role: string;
}

export interface ServiceSalon {
  id: number;
  service_name: string;
  price: string;
  duration_minutes: number;
}

class BusinessService {
  async getCustomers(search?: string): Promise<Customer[]> {
    const params = search ? { search } : {};
    const response = await api.get('/v1/customers', { params });
    return response.data;
  }

  async createCustomer(data: { name: string; phone: string }): Promise<Customer> {
    const response = await api.post('/v1/customers', data);
    return response.data;
  }

  async getEmployees(): Promise<Employee[]> {
    const response = await api.get('/v1/employees');
    return response.data;
  }

  async getServices(): Promise<ServiceSalon[]> {
    const response = await api.get('/v1/services');
    return response.data;
  }
}

export const businessService = new BusinessService();
