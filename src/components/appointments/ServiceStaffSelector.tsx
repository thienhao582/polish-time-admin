
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useSalonStore } from "@/stores/useSalonStore";

interface ServiceStaffItem {
  id: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  price: number;
  duration: number;
}

interface ServiceStaffSelectorProps {
  selectedItems: ServiceStaffItem[];
  onItemsChange: (items: ServiceStaffItem[]) => void;
}

export function ServiceStaffSelector({ selectedItems, onItemsChange }: ServiceStaffSelectorProps) {
  const { services, employees } = useSalonStore();
  const [currentServiceId, setCurrentServiceId] = useState("");
  const [currentStaffId, setCurrentStaffId] = useState("");

  const addServiceStaffItem = () => {
    if (!currentServiceId || !currentStaffId) return;

    const service = services.find(s => s.id === currentServiceId);
    const staff = employees.find(e => e.id === currentStaffId);
    
    if (!service || !staff) return;

    const newItem: ServiceStaffItem = {
      id: `${currentServiceId}-${currentStaffId}-${Date.now()}`,
      serviceId: currentServiceId,
      serviceName: service.name,
      staffId: currentStaffId,
      staffName: staff.name,
      price: service.price,
      duration: service.duration
    };

    onItemsChange([...selectedItems, newItem]);
    setCurrentServiceId("");
    setCurrentStaffId("");
  };

  const removeItem = (itemId: string) => {
    onItemsChange(selectedItems.filter(item => item.id !== itemId));
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = selectedItems.reduce((sum, item) => sum + item.duration, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Dịch vụ</label>
          <Select value={currentServiceId} onValueChange={setCurrentServiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - {service.price.toLocaleString('vi-VN')}đ
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nhân viên</label>
          <Select value={currentStaffId} onValueChange={setCurrentStaffId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn nhân viên" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            type="button" 
            onClick={addServiceStaffItem}
            disabled={!currentServiceId || !currentStaffId}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm
          </Button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Dịch vụ đã chọn:</h4>
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.serviceName}</div>
                    <div className="text-sm text-gray-600">
                      Nhân viên: {item.staffName} • {item.duration} phút • {item.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center font-medium">
                <span>Tổng thời gian: {totalDuration} phút</span>
                <span className="text-lg text-blue-600">
                  Tổng tiền: {totalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
