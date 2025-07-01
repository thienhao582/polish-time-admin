// Temporary data store for appointments and staff management
export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface Staff {
  id: string;
  name: string;
  specialties: string[];
  assignedServices: string[]; // Service IDs they can perform
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  customer: string;
  phone: string;
  service: string;
  duration: string;
  price: string;
  status: string;
  staff: string;
  customerId?: string;
  serviceId?: string;
  staffId?: string;
  notes?: string;
  // New fields for multi-service appointments
  services?: Array<{
    serviceId: string;
    serviceName: string;
    staffIds: string[];
    staffNames: string[];
    price: number;
    duration: number;
  }>;
  staffSalaryData?: Array<{
    staffId: string;
    staffName: string;
    serviceId: string;
    serviceName: string;
    commissionRate?: number;
    fixedAmount?: number;
    servicePrice: number;
  }>;
}

// Initial data
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
    assignedServices: ["1", "3"] // Can do Gel Polish + Nail Art and Nail Extension
  },
  { 
    id: "2", 
    name: "Linh", 
    specialties: ["Manicure", "Pedicure", "Basic Care"],
    assignedServices: ["2", "4"] // Can do Manicure + Pedicure and Basic Manicure
  },
  { 
    id: "3", 
    name: "Hương", 
    specialties: ["Extension", "Nail Art", "Design"],
    assignedServices: ["1", "3"] // Can do Gel Polish + Nail Art and Nail Extension
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

// Data store class
class DataStore {
  private services: Service[] = [...initialServices];
  private staff: Staff[] = [...initialStaff];
  private customers: Customer[] = [...initialCustomers];
  private appointments: Appointment[] = [...initialAppointments];
  private nextAppointmentId = 4;
  private nextCustomerId = 4;

  // Services
  getServices(): Service[] {
    return [...this.services];
  }

  // Staff
  getStaff(): Staff[] {
    return [...this.staff];
  }

  getAvailableStaffForService(serviceId: string): Staff[] {
    return this.staff.filter(member => member.assignedServices.includes(serviceId));
  }

  updateStaffServices(staffId: string, assignedServices: string[]): void {
    const staffIndex = this.staff.findIndex(member => member.id === staffId);
    if (staffIndex !== -1) {
      this.staff[staffIndex] = {
        ...this.staff[staffIndex],
        assignedServices
      };
    }
  }

  // Customers
  getCustomers(): Customer[] {
    return [...this.customers];
  }

  addCustomer(customer: Omit<Customer, 'id'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: this.nextCustomerId.toString()
    };
    this.customers.push(newCustomer);
    this.nextCustomerId++;
    return newCustomer;
  }

  // Appointments
  getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  addAppointment(appointmentData: any): Appointment {
    const service = this.services.find(s => s.id === appointmentData.serviceId);
    const staff = this.staff.find(s => s.id === appointmentData.staffId);

    // Add customer if it's a new customer
    let customerId = appointmentData.customerId;
    if (!customerId && appointmentData.customerName) {
      const newCustomer = this.addCustomer({
        name: appointmentData.customerName,
        phone: appointmentData.customerPhone,
        email: appointmentData.customerEmail || undefined
      });
      customerId = newCustomer.id;
    }

    const newAppointment: Appointment = {
      id: this.nextAppointmentId,
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

    this.appointments.push(newAppointment);
    this.nextAppointmentId++;
    
    console.log("Appointment saved to data store:", newAppointment);
    return newAppointment;
  }

  // Save to localStorage (for persistence)
  saveToStorage(): void {
    const data = {
      services: this.services,
      staff: this.staff,
      customers: this.customers,
      appointments: this.appointments,
      nextAppointmentId: this.nextAppointmentId,
      nextCustomerId: this.nextCustomerId
    };
    localStorage.setItem('nailSalonData', JSON.stringify(data));
  }

  // Load from localStorage
  loadFromStorage(): void {
    const data = localStorage.getItem('nailSalonData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.services = parsed.services || [...initialServices];
        this.staff = parsed.staff || [...initialStaff];
        this.customers = parsed.customers || [...initialCustomers];
        this.appointments = parsed.appointments || [...initialAppointments];
        this.nextAppointmentId = parsed.nextAppointmentId || 4;
        this.nextCustomerId = parsed.nextCustomerId || 4;
      } catch (error) {
        console.error("Error loading data from storage:", error);
      }
    }
  }
}

// Export singleton instance
export const dataStore = new DataStore();

// Load data on initialization
dataStore.loadFromStorage();
