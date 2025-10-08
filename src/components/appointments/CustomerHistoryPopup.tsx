import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Star, Scissors } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useSalonStore } from "@/stores/useSalonStore";
import { useDemoMode } from "@/contexts/DemoModeContext";

interface CustomerHistoryPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerPhone?: string;
}

interface HistoryAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  employee_name: string;
  status: string;
  duration_minutes: number;
  price: number;
  notes?: string;
}

export function CustomerHistoryPopup({
  isOpen,
  onOpenChange,
  customerName,
  customerPhone
}: CustomerHistoryPopupProps) {
  const [historyAppointments, setHistoryAppointments] = useState<HistoryAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { appointments: demoAppointments } = useSalonStore();
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    if (isOpen && customerName) {
      loadCustomerHistory();
    }
  }, [isOpen, customerName, customerPhone, isDemoMode]);

  const loadCustomerHistory = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // Filter demo appointments for this customer
        const customerHistory = demoAppointments
          .filter(apt => 
            apt.customer.toLowerCase() === customerName.toLowerCase() ||
            (customerPhone && apt.phone === customerPhone)
          )
          .map(apt => ({
            id: apt.id.toString(),
            appointment_date: apt.date,
            appointment_time: apt.time,
            service_name: apt.service,
            employee_name: apt.staff || "Chưa phân công",
            status: apt.status,
            duration_minutes: parseInt(apt.duration.match(/(\d+)/)?.[1] || "60"),
            price: parseFloat(apt.price.replace(/[^\d]/g, '')) || 0,
            notes: apt.notes
          }))
          .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
        
        setHistoryAppointments(customerHistory);
      } else {
        // Load from Supabase
        let query = supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: false })
          .order('appointment_time', { ascending: false });

        if (customerPhone) {
          query = query.or(`customer_name.ilike.%${customerName}%,customer_phone.eq.${customerPhone}`);
        } else {
          query = query.ilike('customer_name', `%${customerName}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error loading customer history:', error);
          return;
        }

        setHistoryAppointments(data || []);
      }
    } catch (error) {
      console.error('Error loading customer history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Xác nhận", className: "bg-green-100 text-green-700" },
      pending: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-700" },
      completed: { label: "Hoàn thành", className: "bg-blue-100 text-blue-700" },
      cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, className: "bg-gray-100 text-gray-700" };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const calculateTotalVisits = () => historyAppointments.length;
  const calculateTotalSpent = () => {
    return historyAppointments
      .filter(apt => apt.status === 'completed')
      .reduce((total, apt) => total + (apt.price || 0), 0);
  };

  const getFrequentServices = () => {
    const serviceCount = historyAppointments.reduce((acc, apt) => {
      acc[apt.service_name] = (acc[apt.service_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Lịch sử làm nail - {customerName}
            {customerPhone && <span className="text-sm text-gray-500">({customerPhone})</span>}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Đang tải lịch sử...</div>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{calculateTotalVisits()}</div>
                <div className="text-sm text-gray-600">Tổng lượt đến</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${calculateTotalSpent().toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Tổng chi tiêu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {historyAppointments.filter(apt => apt.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Lần hoàn thành</div>
              </div>
            </div>

            {/* Frequent Services */}
            {getFrequentServices().length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Dịch vụ thường sử dụng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getFrequentServices().map(([service, count]) => (
                    <Badge key={service} variant="outline" className="bg-blue-50">
                      {service} ({count} lần)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* History List */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Lịch sử chi tiết ({historyAppointments.length} lịch hẹn)
              </h3>
              
              {historyAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Scissors className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Chưa có lịch sử làm nail</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyAppointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{appointment.service_name}</span>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            {appointment.price > 0 ? `${appointment.price.toLocaleString('vi-VN')}đ` : 'Chưa có giá'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: vi })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appointment.appointment_time} ({appointment.duration_minutes} phút)
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Thợ: {appointment.employee_name}
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}