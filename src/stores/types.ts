
import { Customer, Appointment } from '@/utils/dataStore';

// Enhanced Service interface
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in minutes
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Employee interface (unified)
export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  role: 'thợ chính' | 'phụ tá' | 'lễ tân' | 'quản lý' | 'thợ';
  status: 'đang làm' | 'đã nghỉ';
  assignedServices: string[];
  specialties: string[];
  startDate: string;
  start_date?: string; // For Supabase compatibility
  commission_rate?: number; // Commission rate as decimal (0.10 = 10%)
  workSchedule?: {
    employeeId: string;
    employeeName: string;
    defaultSchedule: {
      [key: number]: {
        workType: 'off' | 'full' | 'half' | 'quarter' | 'custom';
        startTime?: string;
        endTime?: string;
      };
    };
    scheduleOverrides: {
      date: string;
      schedule: {
        workType: 'off' | 'full' | 'half' | 'quarter' | 'custom';
        startTime?: string;
        endTime?: string;
      };
      reason?: string;
    }[];
  };
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  status: 'working' | 'completed' | 'absent';
}

// Enhanced Customer interface
export interface CustomerEnhanced {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  points: number;
  memberLevel: 'Mới' | 'Thành viên' | 'VIP' | 'VVIP';
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  joinDate: string;
  visitHistory: {
    id: string;
    date: string;
    services: string[];
    amount: number;
    pointsEarned: number;
  }[];
}

export interface SalonState {
  // State
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  nextAppointmentId: number;
  nextCustomerId: number;
  
  // Enhanced customers
  enhancedCustomers: CustomerEnhanced[];
  nextEnhancedCustomerId: number;
  
  // Employee management state (unified)
  employees: Employee[];
  timeRecords: TimeRecord[];
  nextEmployeeId: number;
  nextTimeRecordId: number;
  
  // Actions
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateService: (id: string, service: Partial<Omit<Service, 'id' | 'createdAt'>>) => void;
  deleteService: (id: string) => void;
  toggleServiceStatus: (id: string) => void;
  
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  deduplicateCustomers: () => void;
  
  // Enhanced customer actions
  addEnhancedCustomer: (customer: Omit<CustomerEnhanced, 'id' | 'points' | 'memberLevel' | 'totalSpent' | 'visitCount' | 'joinDate' | 'visitHistory'>) => void;
  updateEnhancedCustomer: (id: string, customer: Partial<CustomerEnhanced>) => void;
  deleteEnhancedCustomer: (id: string) => void;
  addPointsToCustomer: (customerId: string, points: number, amount: number, services: string[]) => void;
  calculateMemberLevel: (points: number) => 'Mới' | 'Thành viên' | 'VIP' | 'VVIP';
  
  addAppointment: (appointment: any) => Appointment;
  updateAppointment: (id: number, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: number) => void;
  
  // Employee actions  
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Time tracking actions
  checkIn: (employeeId: string) => void;
  checkOut: (employeeId: string) => void;
  getTimeRecordsForEmployee: (employeeId: string, startDate?: string, endDate?: string) => TimeRecord[];
  getTotalHoursForEmployee: (employeeId: string, period: 'week' | 'month') => number;
  
  // Utility functions
  getAvailableEmployeesForService: (serviceId: string) => Employee[];
  
  // Data initialization
  initializeData: () => void;
}
