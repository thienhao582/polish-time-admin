
import { useState, useEffect } from "react";
import { useSalonStore, Employee } from "@/stores/useSalonStore";
import { toast } from "@/hooks/use-toast";
import { BasicInfoSection } from "./employee/BasicInfoSection";
import { ServiceAssignmentSection } from "./employee/ServiceAssignmentSection";
import { SpecialtiesSection } from "./employee/SpecialtiesSection";
import { EmployeeFormActions } from "./employee/EmployeeFormActions";

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

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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

  const handleAddCustomSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, specialty]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection
        formData={formData}
        onFormDataChange={handleFormDataChange}
      />

      <ServiceAssignmentSection
        services={services}
        assignedServices={formData.assignedServices}
        onServiceToggle={handleServiceToggle}
      />

      <SpecialtiesSection
        specialties={formData.specialties}
        onSpecialtyToggle={handleSpecialtyToggle}
        onAddCustomSpecialty={handleAddCustomSpecialty}
      />

      <EmployeeFormActions
        employee={employee}
        onClose={onClose}
      />
    </form>
  );
}
