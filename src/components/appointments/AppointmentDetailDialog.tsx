import { CalendarIcon, Edit, Trash2, Clock, History } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSalonStore } from "@/stores/useSalonStore";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { formatTimeRange } from "@/utils/timeUtils";
import { toast } from "sonner";
import { CustomerHistoryPopup } from "./CustomerHistoryPopup";

interface Appointment {
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
  serviceId?: string;
  staffId?: string;
  notes?: string;
  extraTime?: number; // Extra time in minutes
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

interface AppointmentDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onEdit: () => void;
  onDelete: (id: number) => void;
  onDurationUpdate?: (appointmentId: number, newDuration?: number) => void;
}

export function AppointmentDetailDialog({
  isOpen,
  onOpenChange,
  appointment,
  onEdit,
  onDelete,
  onDurationUpdate
}: AppointmentDetailDialogProps) {
  const { services, employees, updateAppointment } = useSalonStore();
  const { isDemoMode } = useDemoMode();
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [customDuration, setCustomDuration] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Xác nhận", variant: "default" as const },
      pending: { label: "Chờ xác nhận", variant: "secondary" as const },
      completed: { label: "Hoàn thành", variant: "default" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={
        status === "confirmed" ? "bg-green-100 text-green-700 hover:bg-green-100" :
        status === "completed" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""
      }>
        {config.label}
      </Badge>
    );
  };

  const handleDurationEdit = () => {
    setCustomDuration(appointment?.duration?.replace(' phút', '') || '');
    setIsEditingDuration(true);
  };

  const handleDurationSave = () => {
    if (!appointment || !customDuration) return;
    
    const newDurationMinutes = parseInt(customDuration);
    if (isNaN(newDurationMinutes) || newDurationMinutes <= 0) return;
    
    const newDurationText = `${newDurationMinutes} phút`;
    
    if (isDemoMode) {
      updateAppointment(appointment.id, {
        ...appointment,
        duration: newDurationText
      });
      toast.success("Đã cập nhật thời gian thực hiện");
    }
    
    if (onDurationUpdate) {
      onDurationUpdate(appointment.id, newDurationMinutes);
    }
    
    setIsEditingDuration(false);
  };

  const handleDurationCancel = () => {
    setIsEditingDuration(false);
    setCustomDuration("");
  };

  if (!appointment) return null;

  // Check if this is a multi-service appointment
  const isMultiServiceAppointment = appointment.services && appointment.services.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Chi tiết lịch hẹn
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Ngày</label>
              <p className="text-sm">{format(new Date(appointment.date), "dd/MM/yyyy", { locale: vi })}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Thời gian</label>
              <p className="text-sm">{formatTimeRange(appointment.time, appointment.duration, appointment.extraTime)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-medium text-gray-600">Khách hàng</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsHistoryOpen(true)}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <History className="w-3 h-3 mr-1" />
                  Xem lịch sử
                </Button>
              </div>
              <p className="text-sm font-medium">{appointment.customer}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
              <p className="text-sm">{appointment.phone}</p>
            </div>
          </div>

          {isMultiServiceAppointment ? (
            // Multi-service appointment display
            <div>
              <label className="text-sm font-medium text-gray-600 mb-3 block">Dịch vụ đã chọn</label>
              <div className="space-y-3">
                {appointment.services?.map((service, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{service.serviceName}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Nhân viên: {service.staffNames.join(", ")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {service.duration} phút • {service.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Single service appointment display (legacy)
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Dịch vụ</label>
                <p className="text-sm">{appointment.service}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Nhân viên</label>
                <p className="text-sm">{appointment.staff}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Thời gian dự kiến</label>
              {isEditingDuration ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Phút"
                    className="w-20 h-8 text-sm"
                    min="1"
                  />
                  <span className="text-sm text-gray-500">phút</span>
                  <Button
                    size="sm"
                    onClick={handleDurationSave}
                    className="h-8 px-2 bg-green-600 hover:bg-green-700"
                  >
                    Lưu
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDurationCancel}
                    className="h-8 px-2"
                  >
                    Hủy
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm">{appointment.duration}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDurationEdit}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <Clock className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Thời gian cộng thêm</label>
              <p className="text-sm text-gray-600">{appointment.extraTime ? `${appointment.extraTime} phút` : "0 phút"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tổng thời gian</label>
              <p className="text-sm font-semibold text-blue-600">
                {(() => {
                  const baseDuration = parseInt(appointment.duration?.match(/(\d+)/)?.[1] || "0");
                  const extraTime = appointment.extraTime || 0;
                  return `${baseDuration + extraTime} phút`;
                })()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tổng giá</label>
              <p className="text-sm font-medium text-green-600">{appointment.price}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Trạng thái</label>
            <div className="mt-1">
              {getStatusBadge(appointment.status)}
            </div>
          </div>

          {appointment.notes && (
            <div>
              <label className="text-sm font-medium text-gray-600">Ghi chú</label>
              <p className="text-sm bg-gray-50 p-3 rounded-md">{appointment.notes}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa lịch hẹn</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa lịch hẹn này? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(appointment.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              className="bg-pink-600 hover:bg-pink-700"
              onClick={onEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Customer History Popup */}
        <CustomerHistoryPopup
          isOpen={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          customerName={appointment.customer}
          customerPhone={appointment.phone}
        />
      </DialogContent>
    </Dialog>
  );
}
