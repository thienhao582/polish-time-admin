import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, Appointment } from '@/utils/dataStore';
import { SalonState } from './types';
import { 
  initialServices, 
  initialEmployees, 
  initialCustomers, 
  initialAppointments, 
  initialEnhancedCustomers 
} from './initialData';

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
        const newService = {
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

        // Handle multi-service appointments
        if (appointmentData.serviceStaffItems && appointmentData.serviceStaffItems.length > 0) {
          // Create a single appointment with multiple services
          const totalPrice = appointmentData.serviceStaffItems.reduce((sum: number, item: any) => sum + item.price, 0);
          const totalDuration = appointmentData.serviceStaffItems.reduce((sum: number, item: any) => sum + item.duration, 0);
          
          // Get all unique staff names
          const allStaffNames = Array.from(new Set(
            appointmentData.serviceStaffItems.flatMap((item: any) => item.staffNames)
          ));
          
          // Get all service names
          const allServiceNames = appointmentData.serviceStaffItems.map((item: any) => item.serviceName);

          // Prepare staff salary data
          const staffSalaryData = appointmentData.serviceStaffItems.flatMap((item: any) => 
            item.staffSalaryInfo?.map((staffInfo: any) => ({
              staffId: staffInfo.staffId,
              staffName: staffInfo.staffName,
              serviceId: item.serviceId,
              serviceName: item.serviceName,
              commissionRate: staffInfo.commissionRate || 0.3,
              fixedAmount: staffInfo.fixedAmount || 0,
              servicePrice: item.price
            })) || []
          );

          const newAppointment: Appointment = {
            id: state.nextAppointmentId,
            date: appointmentData.date.toISOString().split('T')[0],
            time: appointmentData.time,
            customer: appointmentData.customerName,
            phone: appointmentData.customerPhone,
            service: allServiceNames.join(" + "), // Combined service names
            duration: `${totalDuration} phút`,
            price: `${totalPrice.toLocaleString()}đ`,
            status: "confirmed",
            staff: allStaffNames.join(", "), // Combined staff names
            customerId,
            notes: appointmentData.notes,
            services: appointmentData.serviceStaffItems.map((item: any) => ({
              serviceId: item.serviceId,
              serviceName: item.serviceName,
              staffIds: item.staffIds,
              staffNames: item.staffNames,
              price: item.price,
              duration: item.duration
            })),
            staffSalaryData
          };

          set((state) => ({
            appointments: [...state.appointments, newAppointment],
            nextAppointmentId: state.nextAppointmentId + 1
          }));

          return newAppointment;
        } else {
          // Handle single service appointment (legacy support)
          const service = state.services.find(s => s.id === appointmentData.serviceId);
          const employee = state.employees.find(e => e.id === appointmentData.staffId);

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
            notes: appointmentData.notes,
            staffSalaryData: appointmentData.staffSalaryData
          };

          set((state) => ({
            appointments: [...state.appointments, newAppointment],
            nextAppointmentId: state.nextAppointmentId + 1
          }));

          return newAppointment;
        }
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
          const newRecord = {
            id: state.nextTimeRecordId.toString(),
            employeeId,
            employeeName: employee.name,
            date: today,
            checkIn: now,
            status: 'working' as const
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

      // Updated method for calculating staff salary from appointments
      calculateStaffSalary: (employeeId, startDate, endDate) => {
        const state = get();
        const employee = state.employees.find(e => e.id === employeeId);
        if (!employee) return { totalCommission: 0, totalFixedAmount: 0, totalSalary: 0, appointmentCount: 0, appointments: [] };

        const appointments = state.appointments.filter(apt => {
          return apt.date >= startDate && 
                 apt.date <= endDate &&
                 apt.status === 'completed' &&
                 (apt.staff.includes(employee.name) || 
                  apt.staffSalaryData?.some(salary => salary.staffId === employeeId));
        });

        let totalCommission = 0;
        let totalFixedAmount = 0;
        let appointmentCount = 0;

        appointments.forEach(apt => {
          if (apt.staffSalaryData && Array.isArray(apt.staffSalaryData)) {
            const employeeSalaryData = apt.staffSalaryData.filter(salary => salary.staffId === employeeId);
            employeeSalaryData.forEach(salaryData => {
              totalCommission += salaryData.servicePrice * (salaryData.commissionRate || 0.3);
              totalFixedAmount += salaryData.fixedAmount || 0;
            });
            if (employeeSalaryData.length > 0) {
              appointmentCount++;
            }
          }
        });

        return {
          totalCommission,
          totalFixedAmount,
          totalSalary: totalCommission + totalFixedAmount,
          appointmentCount,
          appointments
        };
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

// Export types for easier importing
export type { Service, Employee, TimeRecord, CustomerEnhanced } from './types';
