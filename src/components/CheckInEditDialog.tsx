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

interface CheckInItem {
  id: string;
  customerName: string;
  customerNumber: string;
  status: string;
  tags: string[];
  services?: string[];
  notes?: string;
  checkInTime: string;
}

interface CheckInEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checkInItem: CheckInItem | null;
  onUpdate: (updatedItem: CheckInItem) => void;
}

export const CheckInEditDialog = ({ isOpen, onClose, checkInItem, onUpdate }: CheckInEditDialogProps) => {
  const { toast } = useToast();
  const { enhancedCustomers } = useSalonStore();
  const { createAppointment, createCustomer } = useSupabaseData();
  const { isDemoMode } = useDemoMode();
  const { createDemoAppointment, createDemoCustomer } = useDemoData();
  const [serviceStaffItems, setServiceStaffItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (checkInItem && isOpen) {
      setNotes(checkInItem.notes || "");
      setServiceStaffItems([]);
    }
  }, [checkInItem, isOpen]);

  const handleConvertToAppointment = async () => {
    if (!checkInItem) {
      return;
    }

    setIsLoading(true);
    try {
      // Find or create customer
      let customerId: string | undefined;
      const existingCustomer = enhancedCustomers.find(c => c.phone === checkInItem.customerNumber);
      
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

      // Create appointment with closest available time slot
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      // Find the closest time slot (round up to next 15-minute interval)
      const currentMinutes = currentDate.getMinutes();
      const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;
      const adjustedTime = new Date(currentDate);
      adjustedTime.setMinutes(roundedMinutes, 0, 0);
      
      // If rounded time exceeds 59 minutes, move to next hour
      if (adjustedTime.getMinutes() >= 60) {
        adjustedTime.setHours(adjustedTime.getHours() + 1, 0, 0, 0);
      }
      
      const appointmentTime = `${String(adjustedTime.getHours()).padStart(2, '0')}:${String(adjustedTime.getMinutes()).padStart(2, '0')}`;

      // Create a basic appointment slot (anyone - no specific service selected)
      const appointmentData: any = {
        appointment_date: formattedDate,
        appointment_time: appointmentTime,
        customer_name: checkInItem.customerName,
        customer_phone: checkInItem.customerNumber,
        service_name: "Anyone", // Default to "Anyone" slot
        employee_name: "Anyone", // No specific staff assigned
        duration_minutes: 60, // Default 1 hour slot
        price: 0,
        status: "confirmed",
        notes: notes || `Converted from check-in #${checkInItem.customerNumber}`
      };

      // Add customer ID if available
      if (customerId && customerId.length > 10) {
        appointmentData.customer_id = customerId;
      }

      if (isDemoMode) {
        await createDemoAppointment(appointmentData);
      } else {
        await createAppointment(appointmentData);
      }

      // Update check-in item
      const updatedItem: CheckInItem = {
        ...checkInItem,
        status: "booked",
        services: serviceStaffItems.length > 0 ? serviceStaffItems.map(item => item.serviceName) : ["Anyone"],
        notes
      };

      onUpdate(updatedItem);
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
                  'bg-green-100 text-green-800'
                }`}>
                  {checkInItem.status === 'waiting' ? 'Đang chờ' :
                   checkInItem.status === 'in_service' ? 'Đang phục vụ' :
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