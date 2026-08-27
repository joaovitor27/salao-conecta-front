import { api } from './api';

export interface SalonBranding {
  slug: string;
  name: string;
  brand_name: string;
  display_name: string;
  tagline: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  accent_color: string | null;
  updated_at: string;
}

export interface SalonProfile extends SalonBranding {
  id: string;
  description: string | null;
  email: string | null;
  phone_number: string | null;
  website: string | null;
  operating_hours: Record<string, unknown> | null;
}

export interface SalonProfilePayload {
  name?: string;
  display_name?: string;
  tagline?: string;
  description?: string | null;
  email?: string | null;
  phone_number?: string | null;
  website?: string | null;
  primary_color?: string;
  secondary_color?: string | null;
  accent_color?: string | null;
  /** Novo arquivo de logo. Envia como multipart automaticamente. */
  logo?: File | null;
}

export class SalonService {
  private endpoint = '/v1/salon';

  async getBranding(): Promise<SalonBranding> {
    const response = await api.get<SalonBranding>(`${this.endpoint}/branding`);
    return response.data;
  }

  async getPublicBranding(slug: string): Promise<SalonBranding> {
    const response = await api.get<SalonBranding>(`/v1/public/salons/${slug}/branding`);
    return response.data;
  }

  async getProfile(): Promise<SalonProfile> {
    const response = await api.get<SalonProfile>(`${this.endpoint}/profile`);
    return response.data;
  }

  async updateProfile(payload: SalonProfilePayload): Promise<SalonProfile> {
    const hasFile = payload.logo instanceof File;

    if (!hasFile) {
      const { logo: _logo, ...rest } = payload;
      const response = await api.patch<SalonProfile>(`${this.endpoint}/profile`, rest);
      return response.data;
    }

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined) return;
      if (value instanceof File) formData.append(key, value);
      else if (value === null) formData.append(key, '');
      else if (typeof value === 'object') formData.append(key, JSON.stringify(value));
      else formData.append(key, String(value));
    });

    const response = await api.patch<SalonProfile>(`${this.endpoint}/profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async removeLogo(): Promise<SalonProfile> {
    const response = await api.delete<SalonProfile>(`${this.endpoint}/logo`);
    return response.data;
  }
}

export const salonService = new SalonService();
