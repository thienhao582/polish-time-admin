
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Interfaces cho Supabase data
interface SupabaseService {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  category?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface SupabaseCustomer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  birthday?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseEmployee {
  id: string;
  name: string;
  phone?: string;
  role: string;
  status: string;
  assigned_services: string[];
  specialties: string[];
  start_date: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  service_id?: string;
  service_name: string;
  employee_id?: string;
  employee_name?: string;
  duration_minutes?: number;
  price?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Hook chính để quản lý data
export const useSupabaseData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Services
  const fetchServices = async (): Promise<SupabaseService[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dịch vụ",
        variant: "destructive"
      });
      return [];
    }
  };

  const createService = async (service: Omit<SupabaseService, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã thêm dịch vụ mới"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm dịch vụ",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id: string, updates: Partial<SupabaseService>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật dịch vụ"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật dịch vụ",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã xóa dịch vụ"
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa dịch vụ",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Customers
  const fetchCustomers = async (): Promise<SupabaseCustomer[]> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khách hàng",
        variant: "destructive"
      });
      return [];
    }
  };

  const createCustomer = async (customer: Omit<SupabaseCustomer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã thêm khách hàng mới"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm khách hàng",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Employees
  const fetchEmployees = async (): Promise<SupabaseEmployee[]> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhân viên",
        variant: "destructive"
      });
      return [];
    }
  };

  const createEmployee = async (employeeData: Omit<SupabaseEmployee, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      setLoading(true);
      
      // Tạo user account trước
      const userAccount = await createUserAccount(employeeData.name, `${employeeData.name.toLowerCase().replace(/\s+/g, '')}@nailsalon.com`);
      
      // Tạo employee với user_id
      const { data, error } = await supabase
        .from('employees')
        .insert([{
          ...employeeData,
          user_id: userAccount.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: `Đã thêm nhân viên ${employeeData.name} và tạo tài khoản đăng nhập`
      });
      
      return data;
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm nhân viên",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Tạo user account cho nhân viên
  const createUserAccount = async (fullName: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: email,
          full_name: fullName,
          pin_code: '1234',
          role: 'employee',
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  };

  // Appointments
  const fetchAppointments = async (): Promise<SupabaseAppointment[]> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lịch hẹn",
        variant: "destructive"
      });
      return [];
    }
  };

  const createAppointment = async (appointment: Omit<SupabaseAppointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã tạo lịch hẹn mới"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo lịch hẹn",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    // Services
    fetchServices,
    createService,
    updateService,
    deleteService,
    // Customers
    fetchCustomers,
    createCustomer,
    // Employees
    fetchEmployees,
    createEmployee,
    // Appointments
    fetchAppointments,
    createAppointment,
  };
};

export type { SupabaseService, SupabaseCustomer, SupabaseEmployee, SupabaseAppointment };
