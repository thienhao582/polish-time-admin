
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSalonStore } from "@/stores/useSalonStore";

interface ServiceStaffItem {
  id: string;
  serviceId: string;
  serviceName: string;
  staffIds: string[]; // Changed to array for multiple staff
  staffNames: string[]; // Changed to array for multiple staff names
  price: number;
  duration: number;
  staffSalaryInfo?: Array<{
    staffId: string;
    staffName: string;
    commissionRate?: number; // For future salary calculation
    fixedAmount?: number; // For future salary calculation
  }>;
}

interface ServiceStaffSelectorProps {
  selectedItems: ServiceStaffItem[];
  onItemsChange: (items: ServiceStaffItem[]) => void;
  preSelectedEmployeeName?: string;
}

export function ServiceStaffSelector({ selectedItems, onItemsChange, preSelectedEmployeeName }: ServiceStaffSelectorProps) {
  const { services, employees } = useSalonStore();
  const [currentServiceId, setCurrentServiceId] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // Pre-select employee if provided
  useEffect(() => {
    if (preSelectedEmployeeName && selectedItems.length === 0) {
      const employee = employees.find(e => e.name === preSelectedEmployeeName);
      if (employee) {
        setSelectedStaffIds([employee.id]);
      }
    }
  }, [preSelectedEmployeeName, employees, selectedItems.length]);

  const addServiceStaffItem = () => {
    if (!currentServiceId || selectedStaffIds.length === 0) return;

    const service = services.find(s => s.id === currentServiceId);
    if (!service) return;

    const selectedStaff = employees.filter(e => selectedStaffIds.includes(e.id));
    const staffNames = selectedStaffIds.includes("anyone") 
      ? ["Bất kì"] 
      : selectedStaff.map(s => s.name);

    // Prepare salary calculation data structure
    const staffSalaryInfo = selectedStaff.map(staff => ({
      staffId: staff.id,
      staffName: staff.name,
      commissionRate: 0.3, // Default 30% commission - can be customized later
      fixedAmount: 0 // For future fixed salary amounts
    }));

    const newItem: ServiceStaffItem = {
      id: `${currentServiceId}-${selectedStaffIds.join('-')}-${Date.now()}`,
      serviceId: currentServiceId,
      serviceName: service.name,
      staffIds: selectedStaffIds,
      staffNames,
      price: service.price,
      duration: service.duration,
      staffSalaryInfo
    };

    onItemsChange([...selectedItems, newItem]);
    setCurrentServiceId("");
    setSelectedStaffIds([]);
  };

  const removeItem = (itemId: string) => {
    onItemsChange(selectedItems.filter(item => item.id !== itemId));
  };

  const handleStaffSelection = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaffIds([...selectedStaffIds, staffId]);
    } else {
      setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffId));
    }
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = selectedItems.reduce((sum, item) => sum + item.duration, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Chỉnh sửa dịch vụ đã sử dụng</label>
          <Select value={currentServiceId} onValueChange={setCurrentServiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Thêm hoặc chỉnh sửa dịch vụ" />
            </SelectTrigger>
            <SelectContent className="bg-background z-[9999] max-h-[300px]">
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - {service.price.toLocaleString('vi-VN')}đ
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentServiceId && (
          <div>
            <label className="block text-sm font-medium mb-2">Nhân viên (chọn nhiều)</label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-muted max-h-32 overflow-y-auto">
              {/* Anyone option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="staff-anyone"
                  checked={selectedStaffIds.includes("anyone")}
                  onCheckedChange={(checked) => handleStaffSelection("anyone", checked as boolean)}
                />
                <label
                  htmlFor="staff-anyone"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Bất kì
                </label>
              </div>
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`staff-${employee.id}`}
                    checked={selectedStaffIds.includes(employee.id)}
                    onCheckedChange={(checked) => handleStaffSelection(employee.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`staff-${employee.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {employee.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
            <Button 
            type="button" 
            onClick={addServiceStaffItem}
            disabled={!currentServiceId || selectedStaffIds.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm
          </Button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Dịch vụ đã sử dụng:</h4>
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.serviceName}</div>
                    <div className="text-sm text-muted-foreground">
                      Nhân viên: {item.staffNames.join(", ")} • {item.duration} phút • {item.price.toLocaleString('vi-VN')}đ
                    </div>
                    {item.staffSalaryInfo && item.staffSalaryInfo.length > 1 && (
                      <div className="text-xs text-primary mt-1">
                        Chia cho {item.staffSalaryInfo.length} nhân viên (mỗi người: {Math.round(item.price * 0.3 / item.staffSalaryInfo.length).toLocaleString('vi-VN')}đ)
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t bg-primary/5 p-3 rounded-lg">
              <div className="flex justify-between items-center font-medium">
                <span>Tổng thời gian: {totalDuration} phút</span>
                <span className="text-lg text-primary">
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
