
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceStaffSelector } from "@/components/appointments/ServiceStaffSelector";
import { useToast } from "@/hooks/use-toast";
import { useSalonStore } from "@/stores/useSalonStore";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useDemoData } from "@/hooks/useDemoData";
import { CheckInItem } from "@/hooks/useSupabaseCheckIns";

interface CheckInEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checkInItem: CheckInItem | null;
  onUpdate: (updatedItem: CheckInItem) => void;
  onAppointmentCreated?: () => void;
}

export const CheckInEditDialog = ({ isOpen, onClose, checkInItem, onUpdate, onAppointmentCreated }: CheckInEditDialogProps) => {
  const { toast } = useToast();
  const { enhancedCustomers, addAppointment, appointments } = useSalonStore();
  const { createAppointment, createCustomer } = useSupabaseData();
  const { isDemoMode } = useDemoMode();
  const { createDemoAppointment, createDemoCustomer } = useDemoData();
  const [serviceStaffItems, setServiceStaffItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (checkInItem && isOpen) {
      setNotes(checkInItem.notes || "");
      
      // Initialize services from check-in item
      if (checkInItem.services && checkInItem.services.length > 0) {
        const { services } = useSalonStore.getState();
        const initialServiceItems = checkInItem.services.map((serviceName, index) => {
          const service = services.find(s => s.name === serviceName);
          if (service) {
            return {
              id: `${service.id}-anyone-${Date.now()}-${index}`,
              serviceId: service.id,
              serviceName: service.name,
              staffIds: ["anyone"],
              staffNames: ["Bất kì"],
              price: service.price,
              duration: service.duration,
              staffSalaryInfo: []
            };
          }
          return null;
        }).filter(Boolean);
        
        setServiceStaffItems(initialServiceItems);
      } else {
        setServiceStaffItems([]);
      }
    }
  }, [checkInItem, isOpen]);

  const handleConvertToAppointment = async () => {
    if (!checkInItem) {
      return;
    }

    setIsLoading(true);
    try {
      // Find or create customer - search by phone instead of customerNumber
      let customerId: string | undefined;
      const existingCustomer = enhancedCustomers.find(c => 
        c.phone === checkInItem.customerNumber || c.name === checkInItem.customerName
      );
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        if (isDemoMode) {
          const newCustomer = await createDemoCustomer({
            name: checkInItem.customerName,
            phone: checkInItem.customerNumber,
            email: null
          });
          customerId = newCustomer?.id;
        } else {
          const newCustomer = await createCustomer({
            name: checkInItem.customerName,
            phone: checkInItem.customerNumber,
            email: null
          });
          customerId = newCustomer?.id;
        }
      }

      // Use check-in time for appointment
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      // Normalize the check-in time to 24h format HH:mm
      const to24h = (t: string) => {
        const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (m) {
          let h = parseInt(m[1], 10);
          const min = m[2];
          const period = m[3].toUpperCase();
          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          return `${String(h).padStart(2,'0')}:${min}`;
        }
        return t;
      };
      const appointmentTime = to24h(checkInItem.checkInTime);
      // Create appointment with proper service selection
      const selectedServiceNames = serviceStaffItems.map(item => item.serviceName);
      const appointmentData: any = {
        appointment_date: formattedDate,
        appointment_time: appointmentTime,
        customer_name: checkInItem.customerName,
        customer_phone: checkInItem.customerNumber,
        service_name: selectedServiceNames.length > 0 ? selectedServiceNames.join(", ") : "",
        employee_name: serviceStaffItems.length > 0 ? serviceStaffItems[0].staffNames[0] : "Bất kì",
        duration_minutes: serviceStaffItems.length > 0 ? serviceStaffItems[0].duration : 60,
        price: serviceStaffItems.reduce((total, item) => total + (item.price || 0), 0),
        status: "confirmed",
        notes: notes || `Converted from check-in #${checkInItem.customerNumber}`,
        assignmentType: "anyone"
      };

      // Add customer ID if available
      if (customerId && customerId.length > 10) {
        appointmentData.customer_id = customerId;
      }

      if (isDemoMode) {
        await createDemoAppointment(appointmentData);

        // Prevent duplicates: only add to store if identical one doesn't exist
        const exists = appointments.some(a =>
          a.date === formattedDate &&
          a.time === appointmentTime &&
          a.phone === checkInItem.customerNumber &&
          a.customer === checkInItem.customerName &&
          (a.staff === "Anyone" || a.staff === "Bất kì")
        );

        if (!exists) {
          // Update Zustand store with selected services and staff
          const newAppointmentData = {
            date: formattedDate,
            time: appointmentTime,
            customerName: checkInItem.customerName,
            customerPhone: checkInItem.customerNumber,
            serviceName: selectedServiceNames.length > 0 ? selectedServiceNames.join(", ") : "",
            staffName: serviceStaffItems.length > 0 ? serviceStaffItems[0].staffNames[0] : "Bất kì",
            duration: serviceStaffItems.length > 0 ? serviceStaffItems[0].duration : 60,
            price: serviceStaffItems.reduce((total, item) => total + (item.price || 0), 0),
            status: "confirmed",
            notes: appointmentData.notes,
            assignmentType: "anyone"
          };
          const createdAppointment = addAppointment(newAppointmentData);
          
          // Store appointment ID for linking
          appointmentData.appointmentId = createdAppointment?.id;
        } else {
          console.log("[CheckInEditDialog] Skipped adding duplicate 'Anyone' appointment to store.");
        }
      } else {
        await createAppointment(appointmentData);
      }

      // Update check-in item status to booked with selected services
      const updatedItem: CheckInItem = {
        ...checkInItem,
        status: "booked",
        services: serviceStaffItems.length > 0 ? serviceStaffItems.map(item => item.serviceName) : [],
        notes,
        appointmentId: appointmentData.appointmentId // Link to created appointment
      };

      onUpdate(updatedItem);
      
      // Call the appointment created callback to refresh the appointment list
      onAppointmentCreated?.();
      toast({
        title: "Thành công",
        description: `Đã chuyển thành lịch hẹn lúc ${appointmentTime}`
      });
      onClose();
    } catch (error) {
      console.error("Error converting check-in to appointment:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi chuyển đổi check-in",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCheckIn = () => {
    if (!checkInItem) return;

    const updatedItem: CheckInItem = {
      ...checkInItem,
      services: serviceStaffItems.map(item => item.serviceName),
      notes
    };

    onUpdate(updatedItem);
    toast({
      title: "Thành công",
      description: "Đã cập nhật thông tin check-in"
    });
    onClose();
  };

  if (!checkInItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Check-in - {checkInItem.customerName}</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Customer Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tên:</span> {checkInItem.customerName}
              </div>
              <div>
                <span className="font-medium">Số điện thoại:</span> {checkInItem.customerNumber}
              </div>
              <div>
                <span className="font-medium">Trạng thái:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  checkInItem.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  checkInItem.status === 'in_service' ? 'bg-blue-100 text-blue-800' :
                  checkInItem.status === 'booked' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {checkInItem.status === 'waiting' ? 'Đang chờ' :
                   checkInItem.status === 'in_service' ? 'Đang phục vụ' :
                   checkInItem.status === 'booked' ? 'Đã đặt lịch' :
                   'Hoàn thành'}
                </span>
              </div>
              <div>
                <span className="font-medium">Thời gian check-in:</span> {checkInItem.checkInTime}
              </div>
            </div>
          </div>

          {/* Service & Staff Selection */}
          <div>
            <h3 className="font-semibold mb-3">Chọn dịch vụ và nhân viên</h3>
            <ServiceStaffSelector
              selectedItems={serviceStaffItems}
              onItemsChange={setServiceStaffItems}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Ghi chú
            </Label>
            <Textarea 
              id="notes" 
              placeholder="Nhập ghi chú" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleUpdateCheckIn}
              disabled={isLoading}
            >
              Cập nhật check-in
            </Button>
            <Button 
              onClick={handleConvertToAppointment}
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isLoading ? "Đang xử lý..." : "Chuyển thành lịch hẹn"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
