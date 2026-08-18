import { api } from './api';
import { buildQueryParams, type QueryParams } from './query';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export class BaseService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async list(params?: QueryParams): Promise<PaginatedResponse<T>> {
    const queryString = buildQueryParams(params);
    const response = await api.get<PaginatedResponse<T>>(`${this.endpoint}${queryString}`);
    return response.data;
  }

  async listAll(params?: QueryParams): Promise<T[]> {
    const queryString = buildQueryParams(params);
    const response = await api.get<T[]>(`${this.endpoint}${queryString}`);
    return response.data;
  }

  async get(id: string | number): Promise<T> {
    const response = await api.get<T>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await api.post<T>(this.endpoint, data);
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await api.patch<T>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`);
  }
}
