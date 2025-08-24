import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Unified interface that matches the existing CheckInItem structure
export interface CheckInItem {
  id: string;
  customerNumber: string;
  customerName: string;
  phone?: string;
  status: string;
  checkInTime: string;
  date: string;
  tags: string[];
  services: string[];
  waitTime?: number;
  notes?: string;
  appointmentId?: string; // Link to appointment when converted
  created_at?: string;
  updated_at?: string;
}

export const useSupabaseCheckIns = () => {
  const [checkIns, setCheckIns] = useState<CheckInItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch check-ins for a specific date
  const fetchCheckInsByDate = async (date: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('check_in_date', date)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        customerNumber: item.customer_number,
        customerName: item.customer_name,
        phone: item.customer_phone,
        status: item.status,
        checkInTime: item.check_in_time,
        date: item.check_in_date,
        tags: item.tags || [],
        services: item.services || [],
        waitTime: item.wait_time,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      setCheckIns(formattedData);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách check-in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new check-in
  const addCheckIn = async (checkInData: Omit<CheckInItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .insert({
          customer_number: checkInData.customerNumber,
          customer_name: checkInData.customerName,
          customer_phone: checkInData.phone,
          status: checkInData.status,
          check_in_time: checkInData.checkInTime,
          check_in_date: checkInData.date,
          tags: checkInData.tags,
          services: checkInData.services,
          wait_time: checkInData.waitTime,
          notes: checkInData.notes
        })
        .select()
        .single();

      if (error) throw error;

      const formattedItem = {
        id: data.id,
        customerNumber: data.customer_number,
        customerName: data.customer_name,
        phone: data.customer_phone,
        status: data.status,
        checkInTime: data.check_in_time,
        date: data.check_in_date,
        tags: data.tags || [],
        services: data.services || [],
        waitTime: data.wait_time,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setCheckIns(prev => [formattedItem, ...prev]);
      return formattedItem;
    } catch (error) {
      console.error('Error adding check-in:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm check-in",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update check-in
  const updateCheckIn = async (id: string, updates: Partial<CheckInItem>) => {
    try {
      const updateData: any = {};
      
      if (updates.customerNumber) updateData.customer_number = updates.customerNumber;
      if (updates.customerName) updateData.customer_name = updates.customerName;
      if (updates.phone !== undefined) updateData.customer_phone = updates.phone;
      if (updates.status) updateData.status = updates.status;
      if (updates.checkInTime) updateData.check_in_time = updates.checkInTime;
      if (updates.date) updateData.check_in_date = updates.date;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.services) updateData.services = updates.services;
      if (updates.waitTime !== undefined) updateData.wait_time = updates.waitTime;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('checkins')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const formattedItem = {
        id: data.id,
        customerNumber: data.customer_number,
        customerName: data.customer_name,
        phone: data.customer_phone,
        status: data.status,
        checkInTime: data.check_in_time,
        date: data.check_in_date,
        tags: data.tags || [],
        services: data.services || [],
        waitTime: data.wait_time,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setCheckIns(prev => prev.map(item => item.id === id ? formattedItem : item));
      return formattedItem;
    } catch (error) {
      console.error('Error updating check-in:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật check-in",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete check-in
  const deleteCheckIn = async (id: string) => {
    try {
      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCheckIns(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting check-in:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa check-in",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Get filtered check-ins
  const getFilteredCheckIns = (date: string, statusFilter: string, searchTerm: string) => {
    return checkIns
      .filter(checkIn => checkIn.date === date)
      .filter(checkIn => {
        const matchesSearch = !searchTerm || 
          checkIn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.customerNumber.includes(searchTerm) ||
          (checkIn.phone && checkIn.phone.includes(searchTerm));
        const matchesStatus = statusFilter === "all" || checkIn.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Sort by status priority first (waiting > booked > completed), then by time
        const statusPriority = { waiting: 3, booked: 2, completed: 1 };
        const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
        const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // If same priority, sort by check-in time (most recent first)
        return b.checkInTime.localeCompare(a.checkInTime);
      });
  };

  return {
    checkIns,
    loading,
    fetchCheckInsByDate,
    addCheckIn,
    updateCheckIn,
    deleteCheckIn,
    getFilteredCheckIns
  };
};