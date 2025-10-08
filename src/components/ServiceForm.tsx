
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Service, useSalonStore } from "@/stores/useSalonStore";
import { useToast } from "@/hooks/use-toast";

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
}

const categories = [
  "Manicure",
  "Pedicure", 
  "Sơn gel",
  "Nail Art",
  "Nối móng",
  "Spa",
  "Massage",
  "Tóc"
];

export const ServiceForm = ({ open, onOpenChange, service }: ServiceFormProps) => {
  const { addService, updateService } = useSalonStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    duration: "",
    status: "active" as "active" | "inactive"
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price.toString(),
        duration: service.duration.toString(),
        status: service.status
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        duration: "",
        status: "active"
      });
    }
  }, [service, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price || !formData.duration) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      });
      return;
    }

    const serviceData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: parseInt(formData.price),
      duration: parseInt(formData.duration),
      status: formData.status
    };

    if (service) {
      updateService(service.id, serviceData);
      toast({
        title: "Thành công",
        description: "Cập nhật dịch vụ thành công"
      });
    } else {
      addService(serviceData);
      toast({
        title: "Thành công", 
        description: "Thêm dịch vụ mới thành công"
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {service ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
          </DialogTitle>
          <DialogDescription>
            {service ? "Cập nhật thông tin dịch vụ" : "Nhập thông tin dịch vụ mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên dịch vụ *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nhập tên dịch vụ"
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Mô tả chi tiết về dịch vụ"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Phân loại *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({...formData, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phân loại" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Giá tiền (USD) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="duration">Thời gian (phút) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: "active" | "inactive") => setFormData({...formData, status: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Đang áp dụng</SelectItem>
                <SelectItem value="inactive">Ngừng áp dụng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
              {service ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
