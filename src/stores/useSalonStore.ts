import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  role: 'thợ chính' | 'phụ tá' | 'lễ tân' | 'quản lý';
  status: 'đang làm' | 'đã nghỉ';
  assignedServices: string[];
  specialties: string[];
  startDate: string;
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

interface SalonState {
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

const initialServices: Service[] = [
  { 
    id: "1", 
    name: "Gel Polish + Nail Art", 
    description: "Sơn gel bền màu kết hợp với nail art tùy chỉnh theo yêu cầu",
    category: "Nail Art",
    duration: 90, 
    price: 450000,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "2", 
    name: "Manicure + Pedicure", 
    description: "Chăm sóc móng tay và móng chân hoàn chỉnh bao gồm cắt, dũa, massage",
    category: "Manicure",
    duration: 120, 
    price: 380000,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "3", 
    name: "Nail Extension", 
    description: "Nối móng acrylic hoặc gel với độ dài và hình dáng theo yêu cầu",
    category: "Nối móng",
    duration: 150, 
    price: 650000,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "4", 
    name: "Basic Manicure", 
    description: "Cắt móng, dũa móng, đẩy lõi móng cơ bản",
    category: "Manicure",
    duration: 60, 
    price: 200000,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "5", 
    name: "French Manicure", 
    description: "Sơn móng kiểu Pháp cổ điển với đầu móng trắng",
    category: "Manicure",
    duration: 75, 
    price: 280000,
    status: "inactive",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
];

const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Mai Nguyễn",
    phone: "0901234567",
    role: "thợ chính",
    status: "đang làm",
    assignedServices: ["1", "3"],
    specialties: ["Gel Polish", "Nail Art", "Extension"],
    startDate: "2024-01-15",
  },
  {
    id: "2", 
    name: "Linh Trần",
    phone: "0987654321",
    role: "thợ chính",
    status: "đang làm",
    assignedServices: ["2", "4"],
    specialties: ["Manicure", "Pedicure", "Basic Care"],
    startDate: "2024-02-01",
  },
  {
    id: "3",
    name: "Hương Lê",
    phone: "0912345678", 
    role: "phụ tá",
    status: "đang làm",
    assignedServices: ["1", "3"],
    specialties: ["Extension", "Nail Art", "Design"],
    startDate: "2024-03-10",
  },
];

const initialCustomers: Customer[] = [
  { id: "1", name: "Nguyễn Thị Lan", phone: "0901234567", email: "lan.nguyen@email.com" },
  { id: "2", name: "Trần Minh Anh", phone: "0987654321", email: "anh.tran@email.com" },
  { id: "3", name: "Lê Thị Hoa", phone: "0912345678", email: "hoa.le@email.com" },
];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    date: "2024-06-27",
    time: "09:00",
    customer: "Nguyễn Thị Lan",
    phone: "0901234567",
    service: "Gel Polish + Nail Art",
    duration: "90 phút",
    price: "450.000đ",
    status: "confirmed",
    staff: "Mai",
    customerId: "1",
    serviceId: "1",
    staffId: "1",
  },
  {
    id: 2,
    date: "2024-06-27",
    time: "10:30",
    customer: "Trần Minh Anh",
    phone: "0987654321",
    service: "Manicure + Pedicure",
    duration: "120 phút",
    price: "380.000đ",
    status: "pending",
    staff: "Linh",
    customerId: "2",
    serviceId: "2",
    staffId: "2",
  },
  {
    id: 3,
    date: "2024-06-27",
    time: "14:00",
    customer: "Lê Thị Hoa",
    phone: "0912345678",
    service: "Nail Extension",
    duration: "150 phút",
    price: "650.000đ",
    status: "completed",
    staff: "Mai",
    customerId: "3",
    serviceId: "3",
    staffId: "1",
  },
];

const initialEnhancedCustomers: CustomerEnhanced[] = [
  {
    id: "1",
    name: "Nguyễn Thị Lan",
    phone: "0901234567",
    email: "lan.nguyen@email.com",
    birthday: "1990-05-15",
    points: 540,
    memberLevel: "VIP",
    totalSpent: 5400000,
    visitCount: 12,
    lastVisit: "2024-06-25",
    joinDate: "2023-01-15",
    visitHistory: [
      {
        id: "v1",
        date: "2024-06-25",
        services: ["Gel Polish + Nail Art"],
        amount: 450000,
        pointsEarned: 45
      },
      {
        id: "v2", 
        date: "2024-06-10",
        services: ["Manicure + Pedicure"],
        amount: 380000,
        pointsEarned: 38
      }
    ]
  },
  {
    id: "2",
    name: "Trần Minh Anh",
    phone: "0987654321", 
    email: "anh.tran@email.com",
    birthday: "1985-08-20",
    points: 320,
    memberLevel: "Thành viên",
    totalSpent: 3200000,
    visitCount: 8,
    lastVisit: "2024-06-20",
    joinDate: "2023-03-10",
    visitHistory: [
      {
        id: "v3",
        date: "2024-06-20",
        services: ["Basic Manicure"],
        amount: 200000,
        pointsEarned: 20
      }
    ]
  },
  {
    id: "3",
    name: "Lê Thị Hoa",
    phone: "0912345678",
    email: "hoa.le@email.com", 
    birthday: "1992-12-03",
    points: 780,
    memberLevel: "VIP",
    totalSpent: 7800000,
    visitCount: 15,
    lastVisit: "2024-06-27",
    joinDate: "2022-11-20",
    visitHistory: [
      {
        id: "v4",
        date: "2024-06-27",
        services: ["Nail Extension"],
        amount: 650000,
        pointsEarned: 65
      }
    ]
  },
  {
    id: "4",
    name: "Phạm Thị Thu",
    phone: "0923456789",
    email: "thu.pham@email.com",
    points: 120,
    memberLevel: "Mới",
    totalSpent: 1200000,
    visitCount: 3,
    lastVisit: "2024-06-15",
    joinDate: "2024-05-01",
    visitHistory: [
      {
        id: "v5",
        date: "2024-06-15",
        services: ["Basic Manicure"],
        amount: 200000,
        pointsEarned: 20
      }
    ]
  }
];

export const useSalonStore = create<SalonState>()(
  persist(
    (set, get) => ({
      // Initial state
      services: [...initialServices],
      customers: [...initialCustomers],
      appointments: [...initialAppointments],
      nextAppointmentId: 4,
      nextCustomerId: 4,
      
      // Enhanced customers state
      enhancedCustomers: [...initialEnhancedCustomers],
      nextEnhancedCustomerId: 5,
      
      // Employee state (unified)
      employees: [...initialEmployees],
      timeRecords: [],
      nextEmployeeId: 4,
      nextTimeRecordId: 1,
      
      // Service actions
      addService: (service) => set((state) => {
        const now = new Date().toISOString();
        const newService: Service = {
          ...service,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now
        };
        return {
          services: [...state.services, newService]
        };
      }),

      updateService: (id, service) => set((state) => ({
        services: state.services.map(s => 
          s.id === id 
            ? { ...s, ...service, updatedAt: new Date().toISOString() } 
            : s
        )
      })),

      deleteService: (id) => set((state) => ({
        services: state.services.filter(s => s.id !== id)
      })),

      toggleServiceStatus: (id) => set((state) => ({
        services: state.services.map(s => 
          s.id === id 
            ? { 
                ...s, 
                status: s.status === 'active' ? 'inactive' : 'active',
                updatedAt: new Date().toISOString()
              } 
            : s
        )
      })),

      // Customer actions
      addCustomer: (customer) => {
        const newCustomer: Customer = {
          ...customer,
          id: get().nextCustomerId.toString()
        };
        
        set((state) => ({
          customers: [...state.customers, newCustomer],
          nextCustomerId: state.nextCustomerId + 1
        }));
        
        return newCustomer;
      },

      updateCustomer: (id, customer) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...customer } : c)
      })),

      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),

      // Enhanced customer actions
      addEnhancedCustomer: (customer) => set((state) => ({
        enhancedCustomers: [...state.enhancedCustomers, {
          ...customer,
          id: state.nextEnhancedCustomerId.toString(),
          points: 0,
          memberLevel: 'Mới' as const,
          totalSpent: 0,
          visitCount: 0,
          joinDate: new Date().toISOString().split('T')[0],
          visitHistory: []
        }],
        nextEnhancedCustomerId: state.nextEnhancedCustomerId + 1
      })),

      updateEnhancedCustomer: (id, customer) => set((state) => ({
        enhancedCustomers: state.enhancedCustomers.map(c => c.id === id ? { ...c, ...customer } : c)
      })),

      deleteEnhancedCustomer: (id) => set((state) => ({
        enhancedCustomers: state.enhancedCustomers.filter(c => c.id !== id)
      })),

      addPointsToCustomer: (customerId, points, amount, services) => set((state) => {
        const customer = state.enhancedCustomers.find(c => c.id === customerId);
        if (!customer) return state;

        const newPoints = customer.points + points;
        const newTotalSpent = customer.totalSpent + amount;
        const newVisitCount = customer.visitCount + 1;
        const newMemberLevel = get().calculateMemberLevel(newPoints);

        const newVisit = {
          id: `v${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          services,
          amount,
          pointsEarned: points
        };

        return {
          enhancedCustomers: state.enhancedCustomers.map(c =>
            c.id === customerId
              ? {
                  ...c,
                  points: newPoints,
                  totalSpent: newTotalSpent,
                  visitCount: newVisitCount,
                  memberLevel: newMemberLevel,
                  lastVisit: new Date().toISOString().split('T')[0],
                  visitHistory: [...c.visitHistory, newVisit]
                }
              : c
          )
        };
      }),

      calculateMemberLevel: (points) => {
        if (points >= 1000) return 'VVIP';
        if (points >= 500) return 'VIP';
        if (points >= 100) return 'Thành viên';
        return 'Mới';
      },

      // Appointment actions
      addAppointment: (appointmentData) => {
        const state = get();
        const service = state.services.find(s => s.id === appointmentData.serviceId);
        const employee = state.employees.find(e => e.id === appointmentData.staffId);

        // Add customer if it's a new customer
        let customerId = appointmentData.customerId;
        if (!customerId && appointmentData.customerName) {
          const newCustomer = get().addCustomer({
            name: appointmentData.customerName,
            phone: appointmentData.customerPhone,
            email: appointmentData.customerEmail || undefined
          });
          customerId = newCustomer.id;
        }

        const newAppointment: Appointment = {
          id: state.nextAppointmentId,
          date: appointmentData.date.toISOString().split('T')[0],
          time: appointmentData.time,
          customer: appointmentData.customerName,
          phone: appointmentData.customerPhone,
          service: service?.name || "Unknown Service",
          duration: `${service?.duration || 0} phút`,
          price: `${service?.price.toLocaleString() || 0}đ`,
          status: "confirmed",
          staff: employee?.name || "Unknown Staff",
          customerId,
          serviceId: appointmentData.serviceId,
          staffId: appointmentData.staffId,
          notes: appointmentData.notes
        };

        set((state) => ({
          appointments: [...state.appointments, newAppointment],
          nextAppointmentId: state.nextAppointmentId + 1
        }));

        console.log("Appointment saved to Zustand store:", newAppointment);
        return newAppointment;
      },

      updateAppointment: (id, appointment) => set((state) => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, ...appointment } : a)
      })),

      deleteAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter(a => a.id !== id)
      })),

      // Employee actions  
      addEmployee: (employee) => set((state) => ({
        employees: [...state.employees, { ...employee, id: state.nextEmployeeId.toString() }],
        nextEmployeeId: state.nextEmployeeId + 1
      })),

      updateEmployee: (id, employee) => set((state) => ({
        employees: state.employees.map(e => e.id === id ? { ...e, ...employee } : e)
      })),

      deleteEmployee: (id) => set((state) => ({
        employees: state.employees.filter(e => e.id !== id)
      })),

      // Time tracking actions
      checkIn: (employeeId) => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        const state = get();
        const employee = state.employees.find(e => e.id === employeeId);
        
        if (!employee) return;

        const existingRecord = state.timeRecords.find(
          r => r.employeeId === employeeId && r.date === today
        );

        if (existingRecord) {
          // Update existing record
          set((state) => ({
            timeRecords: state.timeRecords.map(r =>
              r.id === existingRecord.id
                ? { ...r, checkIn: now, status: 'working' as const }
                : r
            )
          }));
        } else {
          // Create new record
          const newRecord: TimeRecord = {
            id: state.nextTimeRecordId.toString(),
            employeeId,
            employeeName: employee.name,
            date: today,
            checkIn: now,
            status: 'working'
          };
          
          set((state) => ({
            timeRecords: [...state.timeRecords, newRecord],
            nextTimeRecordId: state.nextTimeRecordId + 1
          }));
        }
      },

      checkOut: (employeeId) => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        
        set((state) => ({
          timeRecords: state.timeRecords.map(r => {
            if (r.employeeId === employeeId && r.date === today && r.checkIn) {
              const checkInTime = new Date(`${today} ${r.checkIn}`);
              const checkOutTime = new Date(`${today} ${now}`);
              const totalHours = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) * 100) / 100;
              
              return {
                ...r,
                checkOut: now,
                totalHours,
                status: 'completed' as const
              };
            }
            return r;
          })
        }));
      },

      getTimeRecordsForEmployee: (employeeId, startDate, endDate) => {
        const state = get();
        let records = state.timeRecords.filter(r => r.employeeId === employeeId);
        
        if (startDate) {
          records = records.filter(r => r.date >= startDate);
        }
        if (endDate) {
          records = records.filter(r => r.date <= endDate);
        }
        
        return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTotalHoursForEmployee: (employeeId, period) => {
        const state = get();
        const now = new Date();
        let startDate: Date;
        
        if (period === 'week') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        const records = state.timeRecords.filter(r => 
          r.employeeId === employeeId && 
          new Date(r.date) >= startDate &&
          r.totalHours
        );
        
        return records.reduce((total, record) => total + (record.totalHours || 0), 0);
      },

      // Utility functions
      getAvailableEmployeesForService: (serviceId) => {
        return get().employees.filter(employee => 
          employee.assignedServices.includes(serviceId) && employee.status === 'đang làm'
        );
      },

      // Initialize data
      initializeData: () => set({
        services: [...initialServices],
        customers: [...initialCustomers],
        appointments: [...initialAppointments],
        nextAppointmentId: 4,
        nextCustomerId: 4,
        employees: [...initialEmployees],
        timeRecords: [],
        nextEmployeeId: 4,
        nextTimeRecordId: 1,
        enhancedCustomers: [...initialEnhancedCustomers],
        nextEnhancedCustomerId: 5,
      }),
    }),
    {
      name: 'salon-storage',
      partialize: (state) => ({
        services: state.services,
        customers: state.customers,
        appointments: state.appointments,
        nextAppointmentId: state.nextAppointmentId,
        nextCustomerId: state.nextCustomerId,
        employees: state.employees,
        timeRecords: state.timeRecords,
        nextEmployeeId: state.nextEmployeeId,
        nextTimeRecordId: state.nextTimeRecordId,
        enhancedCustomers: state.enhancedCustomers,
        nextEnhancedCustomerId: state.nextEnhancedCustomerId,
      }),
    }
  )
);
