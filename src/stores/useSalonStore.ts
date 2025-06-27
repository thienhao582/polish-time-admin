
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Service, Staff, Customer, Appointment } from '@/utils/dataStore';

interface SalonState {
  // State
  services: Service[];
  staff: Staff[];
  customers: Customer[];
  appointments: Appointment[];
  nextAppointmentId: number;
  nextCustomerId: number;
  
  // Actions
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  updateStaffServices: (staffId: string, assignedServices: string[]) => void;
  deleteStaff: (id: string) => void;
  
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addAppointment: (appointment: any) => Appointment;
  updateAppointment: (id: number, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: number) => void;
  
  // Utility functions
  getAvailableStaffForService: (serviceId: string) => Staff[];
  
  // Data initialization
  initializeData: () => void;
}

const initialServices: Service[] = [
  { id: "1", name: "Gel Polish + Nail Art", duration: 90, price: 450000 },
  { id: "2", name: "Manicure + Pedicure", duration: 120, price: 380000 },
  { id: "3", name: "Nail Extension", duration: 150, price: 650000 },
  { id: "4", name: "Basic Manicure", duration: 60, price: 200000 },
];

const initialStaff: Staff[] = [
  { 
    id: "1", 
    name: "Mai", 
    specialties: ["Gel Polish", "Nail Art", "Extension"],
    assignedServices: ["1", "3"]
  },
  { 
    id: "2", 
    name: "Linh", 
    specialties: ["Manicure", "Pedicure", "Basic Care"],
    assignedServices: ["2", "4"]
  },
  { 
    id: "3", 
    name: "Hương", 
    specialties: ["Extension", "Nail Art", "Design"],
    assignedServices: ["1", "3"]
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

export const useSalonStore = create<SalonState>()(
  persist(
    (set, get) => ({
      // Initial state
      services: [...initialServices],
      staff: [...initialStaff],
      customers: [...initialCustomers],
      appointments: [...initialAppointments],
      nextAppointmentId: 4,
      nextCustomerId: 4,

      // Service actions
      addService: (service) => set((state) => ({
        services: [...state.services, { ...service, id: Date.now().toString() }]
      })),

      updateService: (id, service) => set((state) => ({
        services: state.services.map(s => s.id === id ? { ...s, ...service } : s)
      })),

      deleteService: (id) => set((state) => ({
        services: state.services.filter(s => s.id !== id)
      })),

      // Staff actions
      addStaff: (staff) => set((state) => ({
        staff: [...state.staff, { ...staff, id: Date.now().toString() }]
      })),

      updateStaff: (id, staff) => set((state) => ({
        staff: state.staff.map(s => s.id === id ? { ...s, ...staff } : s)
      })),

      updateStaffServices: (staffId, assignedServices) => set((state) => ({
        staff: state.staff.map(member => 
          member.id === staffId 
            ? { ...member, assignedServices }
            : member
        )
      })),

      deleteStaff: (id) => set((state) => ({
        staff: state.staff.filter(s => s.id !== id)
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

      // Appointment actions
      addAppointment: (appointmentData) => {
        const state = get();
        const service = state.services.find(s => s.id === appointmentData.serviceId);
        const staff = state.staff.find(s => s.id === appointmentData.staffId);

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
          staff: staff?.name || "Unknown Staff",
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

      // Utility functions
      getAvailableStaffForService: (serviceId) => {
        return get().staff.filter(member => member.assignedServices.includes(serviceId));
      },

      // Initialize data
      initializeData: () => set({
        services: [...initialServices],
        staff: [...initialStaff],
        customers: [...initialCustomers],
        appointments: [...initialAppointments],
        nextAppointmentId: 4,
        nextCustomerId: 4,
      }),
    }),
    {
      name: 'salon-storage',
      partialize: (state) => ({
        services: state.services,
        staff: state.staff,
        customers: state.customers,
        appointments: state.appointments,
        nextAppointmentId: state.nextAppointmentId,
        nextCustomerId: state.nextCustomerId,
      }),
    }
  )
);
