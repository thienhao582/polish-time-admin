import { useState, useEffect } from "react";
import { Campaign } from "@/stores/types/campaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSalonStore } from "@/stores/useSalonStore";

interface CampaignFormProps {
  campaign?: Campaign;
  onSave: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function CampaignForm({ campaign, onSave, onCancel }: CampaignFormProps) {
  const services = useSalonStore((state) => state.services);
  
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    startDate: campaign?.startDate ? campaign.startDate.split('T')[0] : '',
    endDate: campaign?.endDate ? campaign.endDate.split('T')[0] : '',
    discountType: campaign?.discountType || 'percentage' as 'percentage' | 'fixed',
    discountValue: campaign?.discountValue || 0,
    isActive: campaign?.isActive ?? true,
    applicableServices: campaign?.applicableServices || [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên campaign không được để trống';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    if (formData.discountValue <= 0) {
      newErrors.discountValue = 'Giá trị giảm phải lớn hơn 0';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Giảm giá phần trăm không được vượt quá 100%';
    }

    if (formData.applicableServices.length === 0) {
      newErrors.applicableServices = 'Phải chọn ít nhất 1 dịch vụ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        startDate: `${formData.startDate}T00:00:00.000Z`,
        endDate: `${formData.endDate}T23:59:59.999Z`,
      });
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableServices: prev.applicableServices.includes(serviceId)
        ? prev.applicableServices.filter((id) => id !== serviceId)
        : [...prev.applicableServices, serviceId],
    }));
  };

  const handleSelectAllServices = () => {
    if (formData.applicableServices.length === services.length) {
      setFormData((prev) => ({ ...prev, applicableServices: [] }));
    } else {
      setFormData((prev) => ({ ...prev, applicableServices: services.map((s) => s.id) }));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{campaign ? 'Chỉnh sửa Campaign' : 'Tạo Campaign mới'}</DialogTitle>
        <DialogDescription>
          {campaign ? 'Cập nhật thông tin campaign giảm giá' : 'Tạo campaign giảm giá tự động cho dịch vụ'}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Tên campaign */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên Campaign *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên campaign"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Ngày bắt đầu và kết thúc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày bắt đầu *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(new Date(formData.startDate + 'T00:00:00'), "dd/MM/yyyy", { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate + 'T00:00:00') : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFormData({ ...formData, startDate: `${year}-${month}-${day}` });
                      } else {
                        setFormData({ ...formData, startDate: '' });
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label>Ngày kết thúc *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(new Date(formData.endDate + 'T00:00:00'), "dd/MM/yyyy", { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate ? new Date(formData.endDate + 'T00:00:00') : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFormData({ ...formData, endDate: `${year}-${month}-${day}` });
                      } else {
                        setFormData({ ...formData, endDate: '' });
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Loại giảm giá và giá trị */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Loại giảm giá *</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: 'percentage' | 'fixed') =>
                  setFormData({ ...formData, discountType: value })
                }
              >
                <SelectTrigger id="discountType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                  <SelectItem value="fixed">Cố định (₫)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Giá trị giảm * {formData.discountType === 'percentage' ? '(%)' : '(₫)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                max={formData.discountType === 'percentage' ? 100 : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                placeholder="Nhập giá trị"
              />
              {errors.discountValue && (
                <p className="text-sm text-destructive">{errors.discountValue}</p>
              )}
            </div>
          </div>

          {/* Dịch vụ áp dụng */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Chọn dịch vụ áp dụng *</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleSelectAllServices}
                className="h-auto p-0"
              >
                {formData.applicableServices.length === services.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
            </div>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={formData.applicableServices.includes(service.id)}
                    onCheckedChange={() => handleServiceToggle(service.id)}
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {service.name} - {service.price.toLocaleString('vi-VN')}₫
                  </label>
                </div>
              ))}
            </div>
            {errors.applicableServices && (
              <p className="text-sm text-destructive">{errors.applicableServices}</p>
            )}
          </div>

          {/* Trạng thái */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="isActive">Trạng thái campaign</Label>
              <p className="text-sm text-muted-foreground">
                {formData.isActive ? 'Campaign đang hoạt động' : 'Campaign tạm dừng'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            {campaign ? 'Cập nhật' : 'Tạo Campaign'}
          </Button>
        </div>
      </form>
    </>
  );
}
