
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/stores/useSalonStore";

interface BasicInfoSectionProps {
  formData: {
    name: string;
    phone: string;
    role: Employee['role'];
    status: Employee['status'];
    startDate: string;
  };
  onFormDataChange: (updates: Partial<BasicInfoSectionProps['formData']>) => void;
}

export function BasicInfoSection({ formData, onFormDataChange }: BasicInfoSectionProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-800">Thông tin cơ bản</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Tên nhân viên *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              placeholder="Nhập tên nhân viên"
              className="focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
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
              onChange={(e) => onFormDataChange({ phone: e.target.value })}
              placeholder="Nhập số điện thoại"
              className="focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              Vai trò
            </Label>
            <Select value={formData.role} onValueChange={(value) => onFormDataChange({ role: value as Employee['role'] })}>
              <SelectTrigger className="focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200">
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
            <Select value={formData.status} onValueChange={(value) => onFormDataChange({ status: value as Employee['status'] })}>
              <SelectTrigger className="focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200">
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
              onChange={(e) => onFormDataChange({ startDate: e.target.value })}
              className="focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
