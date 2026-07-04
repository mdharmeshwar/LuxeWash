export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  duration: string; // e.g. "2.5 hours"
  description: string;
  features: string[];
}

export type AppointmentStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  licensePlate: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface ApiError {
  field?: string;
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: ApiError[];
}
