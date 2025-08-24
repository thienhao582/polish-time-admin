import { useCallback } from 'react';
import { indexedDBService } from '@/services/indexedDBService';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';

export const useDemoData = () => {
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();

  const handleDemoOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    if (!isDemoMode) return null;
    
    try {
      const result = await operation();
      if (successMessage) {
        toast({
          title: "Thành công",
          description: successMessage,
        });
      }
      return result;
    } catch (error) {
      console.error('Demo operation error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra trong demo mode",
        variant: "destructive",
      });
      throw error;
    }
  }, [isDemoMode, toast]);

  // Services
  const fetchDemoServices = useCallback(async () => {
    return handleDemoOperation(async () => {
      return await indexedDBService.getData('services');
    });
  }, [handleDemoOperation]);

  const createDemoService = useCallback(async (service: any) => {
    return handleDemoOperation(async () => {
      const newService = {
        ...service,
        id: `service-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return await indexedDBService.addData('services', newService);
    }, 'Thêm dịch vụ thành công');
  }, [handleDemoOperation]);

  const updateDemoService = useCallback(async (id: string, updates: any) => {
    return handleDemoOperation(async () => {
      await indexedDBService.updateData('services', id, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      return { id, ...updates };
    }, 'Cập nhật dịch vụ thành công');
  }, [handleDemoOperation]);

  const deleteDemoService = useCallback(async (id: string) => {
    return handleDemoOperation(async () => {
      await indexedDBService.deleteData('services', id);
    }, 'Xóa dịch vụ thành công');
  }, [handleDemoOperation]);

  // Customers
  const fetchDemoCustomers = useCallback(async () => {
    return handleDemoOperation(async () => {
      return await indexedDBService.getData('customers');
    });
  }, [handleDemoOperation]);

  const createDemoCustomer = useCallback(async (customer: any) => {
    return handleDemoOperation(async () => {
      const newCustomer = {
        ...customer,
        id: `customer-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return await indexedDBService.addData('customers', newCustomer);
    }, 'Thêm khách hàng thành công');
  }, [handleDemoOperation]);

  // Employees
  const fetchDemoEmployees = useCallback(async () => {
    return handleDemoOperation(async () => {
      return await indexedDBService.getData('employees');
    });
  }, [handleDemoOperation]);

  const createDemoEmployee = useCallback(async (employee: any) => {
    return handleDemoOperation(async () => {
      const newEmployee = {
        ...employee,
        id: `employee-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return await indexedDBService.addData('employees', newEmployee);
    }, 'Thêm nhân viên thành công');
  }, [handleDemoOperation]);

  // Appointments
  const fetchDemoAppointments = useCallback(async () => {
    return handleDemoOperation(async () => {
      return await indexedDBService.getData('appointments');
    });
  }, [handleDemoOperation]);

  const createDemoAppointment = useCallback(async (appointment: any) => {
    return handleDemoOperation(async () => {
      try {
        // Ensure IndexedDB is initialized
        await indexedDBService.init();
        
        const newAppointment = {
          ...appointment,
          id: `appointment-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const result = await indexedDBService.addData('appointments', newAppointment);
        console.log("Demo appointment created successfully:", result);
        return result;
      } catch (error) {
        console.error("Error creating demo appointment:", error);
        // Return the appointment data even if IndexedDB fails
        const fallbackAppointment = {
          ...appointment,
          id: `appointment-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log("Using fallback appointment:", fallbackAppointment);
        return fallbackAppointment;
      }
    }, 'Thêm lịch hẹn thành công');
  }, [handleDemoOperation]);

  const updateDemoAppointment = useCallback(async (id: string, updates: any) => {
    return handleDemoOperation(async () => {
      try {
        await indexedDBService.init();
        const updatedData = {
          ...updates,
          updated_at: new Date().toISOString()
        };
        await indexedDBService.updateData('appointments', id, updatedData);
        console.log("Demo appointment updated successfully:", { id, updates: updatedData });
        return { id, ...updatedData };
      } catch (error) {
        console.error("Error updating demo appointment:", error);
        // Return the update data even if IndexedDB fails
        const fallbackUpdate = {
          ...updates,
          updated_at: new Date().toISOString()
        };
        console.log("Using fallback update:", { id, updates: fallbackUpdate });
        return { id, ...fallbackUpdate };
      }
    }, 'Cập nhật lịch hẹn thành công');
  }, [handleDemoOperation]);

  // Check-ins
  const fetchDemoCheckIns = useCallback(async () => {
    return handleDemoOperation(async () => {
      return await indexedDBService.getData('checkins');
    });
  }, [handleDemoOperation]);

  const createDemoCheckIn = useCallback(async (checkIn: any) => {
    return handleDemoOperation(async () => {
      const newCheckIn = {
        ...checkIn,
        id: `checkin-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return await indexedDBService.addData('checkins', newCheckIn);
    }, 'Thêm check-in thành công');
  }, [handleDemoOperation]);

  const updateDemoCheckIn = useCallback(async (id: string, updates: any) => {
    return handleDemoOperation(async () => {
      await indexedDBService.updateData('checkins', id, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      return { id, ...updates };
    }, 'Cập nhật check-in thành công');
  }, [handleDemoOperation]);

  const deleteDemoCheckIn = useCallback(async (id: string) => {
    return handleDemoOperation(async () => {
      await indexedDBService.deleteData('checkins', id);
    }, 'Xóa check-in thành công');
  }, [handleDemoOperation]);

  return {
    isDemoMode,
    // Services
    fetchDemoServices,
    createDemoService,
    updateDemoService,
    deleteDemoService,
    // Customers
    fetchDemoCustomers,
    createDemoCustomer,
    // Employees
    fetchDemoEmployees,
    createDemoEmployee,
    // Appointments
    fetchDemoAppointments,
    createDemoAppointment,
    updateDemoAppointment,
    // Check-ins
    fetchDemoCheckIns,
    createDemoCheckIn,
    updateDemoCheckIn,
    deleteDemoCheckIn,
  };
};