import { CalendarIcon, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSalonStore } from "@/stores/useSalonStore";

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
}

export function AppointmentDetailDialog({
  isOpen,
  onOpenChange,
  appointment,
  onEdit,
  onDelete
}: AppointmentDetailDialogProps) {
  const { services, employees } = useSalonStore();

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
              <label className="text-sm font-medium text-gray-600">Giờ</label>
              <p className="text-sm">{appointment.time}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Khách hàng</label>
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
              <label className="text-sm font-medium text-gray-600">Tổng thời lượng</label>
              <p className="text-sm">{appointment.duration}</p>
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
      </DialogContent>
    </Dialog>
  );
}
