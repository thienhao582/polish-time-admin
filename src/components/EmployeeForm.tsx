
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalonStore, Employee } from "@/stores/useSalonStore";
import { toast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
}

export function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const { services, addEmployee, updateEmployee } = useSalonStore();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "thợ chính" as Employee['role'],
    status: "đang làm" as Employee['status'],
    assignedServices: [] as string[],
    specialties: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
  });

  const [customSpecialty, setCustomSpecialty] = useState("");

  const predefinedSpecialties = [
    "Gel Polish", "Nail Art", "Extension", "Manicure", "Pedicure", 
    "Basic Care", "Design", "Acrylic", "Dip Powder"
  ];

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        assignedServices: employee.assignedServices,
        specialties: employee.specialties,
        startDate: employee.startDate,
      });
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      });
      return;
    }

    if (employee) {
      updateEmployee(employee.id, formData);
      toast({
        title: "Thành công!",
        description: "Thông tin nhân viên đã được cập nhật.",
      });
    } else {
      addEmployee(formData);
      toast({
        title: "Thành công!",
        description: "Nhân viên mới đã được thêm vào hệ thống.",
      });
    }
    
    onClose();
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignedServices: checked
        ? [...prev.assignedServices, serviceId]
        : prev.assignedServices.filter(id => id !== serviceId)
    }));
  };

  const handleSpecialtyToggle = (specialty: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim() && !formData.specialties.includes(customSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, customSpecialty.trim()]
      }));
      setCustomSpecialty("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Tên nhân viên *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nhập tên nhân viên"
            className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Số điện thoại *
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Nhập số điện thoại"
            className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-gray-700">
            Vai trò
          </Label>
          <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as Employee['role'] }))}>
            <SelectTrigger className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="thợ chính">Thợ chính</SelectItem>
              <SelectItem value="phụ tá">Phụ tá</SelectItem>
              <SelectItem value="lễ tân">Lễ tân</SelectItem>
              <SelectItem value="quản lý">Quản lý</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium text-gray-700">
            Trạng thái
          </Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Employee['status'] }))}>
            <SelectTrigger className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="đang làm">Đang làm</SelectItem>
              <SelectItem value="đã nghỉ">Đã nghỉ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
            Ngày bắt đầu làm việc
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
          />
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800">Dịch vụ được phân công</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={`service-${service.id}`}
                  checked={formData.assignedServices.includes(service.id)}
                  onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                  className="data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                />
                <label htmlFor={`service-${service.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                  {service.name}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800">Chuyên môn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {predefinedSpecialties.map((specialty) => (
              <div key={specialty} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={`specialty-${specialty}`}
                  checked={formData.specialties.includes(specialty)}
                  onCheckedChange={(checked) => handleSpecialtyToggle(specialty, checked as boolean)}
                  className="data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                />
                <label htmlFor={`specialty-${specialty}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                  {specialty}
                </label>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 pt-2">
            <Input
              placeholder="Thêm chuyên môn khác..."
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSpecialty())}
              className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
            />
            <Button type="button" onClick={addCustomSpecialty} variant="outline" className="shrink-0 border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300">
              Thêm
            </Button>
          </div>
          
          {formData.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-pink-200 transition-colors"
                  onClick={() => handleSpecialtyToggle(specialty, false)}
                >
                  {specialty} 
                  <span className="ml-1 text-pink-500 hover:text-pink-700">✕</span>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose} className="px-6">
          Hủy
        </Button>
        <Button type="submit" className="bg-pink-600 hover:bg-pink-700 px-6">
          {employee ? "Cập nhật" : "Thêm nhân viên"}
        </Button>
      </div>
    </form>
  );
}
