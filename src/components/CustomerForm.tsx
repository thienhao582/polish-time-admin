
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalonStore, CustomerEnhanced } from "@/stores/useSalonStore";
import { useToast } from "@/hooks/use-toast";

interface CustomerFormProps {
  onBack: () => void;
  onSave: () => void;
  customer?: CustomerEnhanced;
}

export const CustomerForm = ({ onBack, onSave, customer }: CustomerFormProps) => {
  const { addEnhancedCustomer, updateEnhancedCustomer } = useSalonStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthday: ""
  });

  // Populate form when editing
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        birthday: customer.birthday || ""
      });
    }
  }, [customer]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ tên và số điện thoại",
        variant: "destructive"
      });
      return;
    }

    try {
      if (customer) {
        // Edit mode
        updateEnhancedCustomer(customer.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          birthday: formData.birthday || undefined
        });

        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin khách hàng",
        });
      } else {
        // Add mode
        addEnhancedCustomer({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          birthday: formData.birthday || undefined
        });

        toast({
          title: "Thành công",
          description: "Đã thêm khách hàng mới",
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: customer ? "Không thể cập nhật khách hàng" : "Không thể thêm khách hàng",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {customer ? "Chỉnh sửa Khách Hàng" : "Thêm Khách Hàng"}
          </h1>
          <p className="text-gray-600 mt-1">
            {customer ? "Cập nhật thông tin khách hàng" : "Nhập thông tin khách hàng mới"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="focus:ring-0 focus:border-black outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="focus:ring-0 focus:border-black outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Nhập email"
                  className="focus:ring-0 focus:border-black outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Ngày sinh</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  className="focus:ring-0 focus:border-black outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Hủy
              </Button>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                <Save className="w-4 h-4 mr-2" />
                {customer ? "Cập nhật khách hàng" : "Lưu khách hàng"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
