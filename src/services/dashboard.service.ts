import { api } from './api';
import { buildQueryParams, type QueryParams } from './query';

export interface DashboardAppointment {
  id: number;
  client_name: string;
  professional_name: string;
  service_name: string;
  service_price: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  status_display: string;
  discount: string;
}

export interface DashboardSummary {
  total_appointments: number;
  completed_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  estimated_revenue: string;
  completed_revenue: string;
  appointments: DashboardAppointment[];
}

export class DashboardService {
  private endpoint = '/v1/dashboard';

  async getSummary(params?: QueryParams): Promise<DashboardSummary> {
    const queryString = buildQueryParams(params);
    const response = await api.get<DashboardSummary>(`${this.endpoint}${queryString}`);
    return response.data;
  }
}

export const dashboardService = new DashboardService();
