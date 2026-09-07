import axios from 'axios';

const bookingApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

export interface SalonData {
  slug: string;
  brand_name: string;
  tagline: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  phone_number: string;
  address_display: string;
}

export interface ServiceData {
  id: number;
  service_name: string;
  description: string;
  price: string;
  duration_minutes: number;
  image_url: string;
}

export interface ProfessionalData {
  id: string;
  first_name: string;
  services: { service_id: number; service_name: string }[];
}

export interface AvailabilityParams {
  date: string;
  service: string;
  professional?: string;
  duration?: number;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  label: string;
  end_label: string;
  period: 'morning' | 'afternoon' | 'evening';
}

export interface AvailabilityResponse {
  date: string;
  professional_id: string | null;
  duration_minutes: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  slots: AvailabilitySlot[];
}

export interface CreateBookingData {
  client_name: string;
  client_phone: string;
  start_time: string;
  services: { service_id: number; professional_id?: string }[];
  notes?: string;
}

export interface BookingConfirmation {
  appointment_id: number;
  salon_name: string;
  salon_phone: string;
  client_name: string;
  date: string;
  start_time: string;
  end_time: string;
  services: {
    service_name: string;
    professional_name: string;
    price: string;
    duration_minutes: number;
  }[];
  total_price: string;
  whatsapp_url: string;
}

export const bookingService = {
  getSalon: async (slug: string): Promise<SalonData> => {
    const { data } = await bookingApi.get(`/v1/booking/${slug}/salon`);
    return data;
  },
  getServices: async (slug: string): Promise<ServiceData[]> => {
    const { data } = await bookingApi.get(`/v1/booking/${slug}/services`);
    return data;
  },
  getProfessionals: async (slug: string, serviceIds?: number[]): Promise<ProfessionalData[]> => {
    const params = serviceIds?.length ? { service: serviceIds.join(',') } : {};
    const { data } = await bookingApi.get(`/v1/booking/${slug}/professionals`, { params });
    return data;
  },
  getAvailability: async (slug: string, params: AvailabilityParams): Promise<AvailabilityResponse> => {
    const { data } = await bookingApi.get(`/v1/booking/${slug}/availability`, { params });
    return data;
  },
  createBooking: async (slug: string, data: CreateBookingData): Promise<BookingConfirmation> => {
    const { data: responseData } = await bookingApi.post(`/v1/booking/${slug}/appointments`, data);
    return responseData;
  },
};
