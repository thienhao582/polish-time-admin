import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";

const Settings = () => {
  const { pointsSettings, appointmentColors, updatePointsSettings, updateAppointmentColors, resetToDefaults } = useSettingsStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    pointsPerAmount: pointsSettings.pointsPerAmount,
    minimumAmount: pointsSettings.minimumAmount,
  });

  const [colorData, setColorData] = useState(appointmentColors);

  const handleSave = () => {
    updatePointsSettings(formData);
    updateAppointmentColors(colorData);
    toast({
      title: "Đã lưu cài đặt",
      description: "Cài đặt tỷ lệ quy đổi điểm và màu sắc đã được cập nhật thành công.",
    });
  };

  const handleReset = () => {
    resetToDefaults();
    setFormData({
      pointsPerAmount: 1,
      minimumAmount: 2.08, // 50000 VND = 2.08 USD
    });
    setColorData({
      anyone: 'bg-orange-100 border-orange-300 text-orange-800',
      preAssigned: 'bg-blue-100 border-blue-300 text-blue-800',
      reassigned: 'bg-sky-100 border-sky-300 text-sky-800',
    });
    toast({
      title: "Đã khôi phục mặc định",
      description: "Cài đặt đã được khôi phục về giá trị mặc định.",
    });
  };

  const colorOptions = [
    { value: 'bg-orange-100 border-orange-300 text-orange-800', label: 'Cam', preview: 'bg-orange-100 border-orange-300' },
    { value: 'bg-blue-100 border-blue-300 text-blue-800', label: 'Xanh dương', preview: 'bg-blue-100 border-blue-300' },
    { value: 'bg-sky-100 border-sky-300 text-sky-800', label: 'Xanh da trời', preview: 'bg-sky-100 border-sky-300' },
    { value: 'bg-green-100 border-green-300 text-green-800', label: 'Xanh lá', preview: 'bg-green-100 border-green-300' },
    { value: 'bg-purple-100 border-purple-300 text-purple-800', label: 'Tím', preview: 'bg-purple-100 border-purple-300' },
    { value: 'bg-pink-100 border-pink-300 text-pink-800', label: 'Hồng', preview: 'bg-pink-100 border-pink-300' },
    { value: 'bg-yellow-100 border-yellow-300 text-yellow-800', label: 'Vàng', preview: 'bg-yellow-100 border-yellow-300' },
    { value: 'bg-indigo-100 border-indigo-300 text-indigo-800', label: 'Chàm', preview: 'bg-indigo-100 border-indigo-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h1>
      </div>

      {/* Points Settings Card */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-lg text-gray-800 flex items-center space-x-2">
            <span>Cài đặt điểm tích lũy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pointsPerAmount" className="text-sm font-medium text-gray-700">
                  Điểm tích lũy trên $1 USD
                </Label>
                <Input
                  id="pointsPerAmount"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.pointsPerAmount}
                  onChange={(e) => setFormData({ ...formData, pointsPerAmount: parseFloat(e.target.value) || 0 })}
                  className="focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                />
                <p className="text-xs text-gray-500">
                  Khách hàng sẽ nhận được {formData.pointsPerAmount} điểm cho mỗi $1 USD chi tiêu
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumAmount" className="text-sm font-medium text-gray-700">
                  Số tiền tối thiểu (USD)
                </Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData({ ...formData, minimumAmount: parseFloat(e.target.value) || 0 })}
                  className="focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                />
                <p className="text-xs text-gray-500">
                  Hóa đơn phải đạt tối thiểu ${formData.minimumAmount.toFixed(2)} USD mới được tích điểm
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Ví dụ tính điểm:</h4>
              <p className="text-sm text-gray-600">
                Hóa đơn $20.83 USD sẽ được tích: {Math.floor(20.83 * formData.pointsPerAmount)} điểm
              </p>
              <p className="text-sm text-gray-600">
                Hóa đơn $50.00 USD sẽ được tích: {Math.floor(50 * formData.pointsPerAmount)} điểm
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Colors Settings Card */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-lg text-gray-800">Cài đặt màu sắc lịch hẹn</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="anyone-color" className="text-sm font-medium text-gray-700">Màu cho lịch hẹn "Anyone"</Label>
              <Select value={colorData.anyone} onValueChange={(value) => setColorData(prev => ({ ...prev, anyone: value }))}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border ${colorOptions.find(opt => opt.value === colorData.anyone)?.preview}`}></div>
                      {colorOptions.find(opt => opt.value === colorData.anyone)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${option.preview}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pre-assigned-color" className="text-sm font-medium text-gray-700">Màu cho lịch hẹn đã sắp xếp sẵn nhân viên</Label>
              <Select value={colorData.preAssigned} onValueChange={(value) => setColorData(prev => ({ ...prev, preAssigned: value }))}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border ${colorOptions.find(opt => opt.value === colorData.preAssigned)?.preview}`}></div>
                      {colorOptions.find(opt => opt.value === colorData.preAssigned)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${option.preview}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reassigned-color" className="text-sm font-medium text-gray-700">Màu cho lịch hẹn được assign sau khi từ anyone</Label>
              <Select value={colorData.reassigned} onValueChange={(value) => setColorData(prev => ({ ...prev, reassigned: value }))}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border ${colorOptions.find(opt => opt.value === colorData.reassigned)?.preview}`}></div>
                      {colorOptions.find(opt => opt.value === colorData.reassigned)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${option.preview}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Xem trước:</h4>
              <div className="space-y-2">
                <div className={`p-2 rounded-md border text-xs ${colorData.anyone}`}>
                  Lịch hẹn ở trạng thái "Anyone"
                </div>
                <div className={`p-2 rounded-md border text-xs ${colorData.preAssigned}`}>
                  Lịch hẹn đã sắp xếp sẵn nhân viên
                </div>
                <div className={`p-2 rounded-md border text-xs ${colorData.reassigned}`}>
                  Lịch hẹn được assign sau khi từ anyone
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button 
          onClick={handleSave}
          className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white"
        >
          <Save className="w-4 h-4" />
          <span>Lưu cài đặt</span>
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleReset}
          className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Khôi phục mặc định</span>
        </Button>
      </div>
    </div>
  );
};

export default Settings;