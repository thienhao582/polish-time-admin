
import { useState, useEffect } from "react";
import { User, Scissors } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useSalonStore } from "@/stores/useSalonStore";

export function StaffServiceManager() {
  const { staff, services, updateStaffServices } = useSalonStore();
  const [localStaff, setLocalStaff] = useState(staff);

  useEffect(() => {
    setLocalStaff(staff);
  }, [staff]);

  const handleServiceToggle = (staffId: string, serviceId: string, checked: boolean) => {
    const updatedStaff = localStaff.map(member => {
      if (member.id === staffId) {
        const updatedServices = checked
          ? [...member.assignedServices, serviceId]
          : member.assignedServices.filter(id => id !== serviceId);
        
        return {
          ...member,
          assignedServices: updatedServices
        };
      }
      return member;
    });

    setLocalStaff(updatedStaff);
  };

  const handleSave = () => {
    localStaff.forEach(member => {
      updateStaffServices(member.id, member.assignedServices);
    });
    
    toast({
      title: "Đã cập nhật!",
      description: "Phân công dịch vụ cho nhân viên đã được lưu.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên & Dịch vụ</h2>
          <p className="text-gray-600 mt-1">Phân công dịch vụ cho từng nhân viên</p>
        </div>
        <Button onClick={handleSave} className="bg-pink-600 hover:bg-pink-700">
          Lưu thay đổi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localStaff.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {member.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Dịch vụ được phân công
                </h4>
                <div className="space-y-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${member.id}-${service.id}`}
                        checked={member.assignedServices.includes(service.id)}
                        onCheckedChange={(checked) => 
                          handleServiceToggle(member.id, service.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`${member.id}-${service.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Chuyên môn</h5>
                <div className="flex flex-wrap gap-1">
                  {member.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-block bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
