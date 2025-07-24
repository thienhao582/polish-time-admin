import { useCallback } from 'react';
import { indexedDBService } from '@/services/indexedDBService';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';

export const useDemoData = () => {
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();

  const handleDemoOperation = useCallback(async <T>(
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
      const newAppointment = {
        ...appointment,
        id: `appointment-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return await indexedDBService.addData('appointments', newAppointment);
    }, 'Thêm lịch hẹn thành công');
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
  };
};