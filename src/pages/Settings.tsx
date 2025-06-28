
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";

const Settings = () => {
  const { pointsSettings, updatePointsSettings, resetToDefaults } = useSettingsStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    pointsPerAmount: pointsSettings.pointsPerAmount,
    minimumAmount: pointsSettings.minimumAmount,
  });

  const handleSave = () => {
    updatePointsSettings(formData);
    toast({
      title: "Đã lưu cài đặt",
      description: "Cài đặt tỷ lệ quy đổi điểm đã được cập nhật thành công.",
    });
  };

  const handleReset = () => {
    resetToDefaults();
    setFormData({
      pointsPerAmount: 1,
      minimumAmount: 50000,
    });
    toast({
      title: "Đã khôi phục mặc định",
      description: "Cài đặt đã được khôi phục về giá trị mặc định.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h1>
      </div>

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
                  Điểm tích lũy trên 1.000 VND
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
                  Khách hàng sẽ nhận được {formData.pointsPerAmount} điểm cho mỗi 1.000 VND chi tiêu
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumAmount" className="text-sm font-medium text-gray-700">
                  Số tiền tối thiểu (VND)
                </Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData({ ...formData, minimumAmount: parseInt(e.target.value) || 0 })}
                  className="focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                />
                <p className="text-xs text-gray-500">
                  Hóa đơn phải đạt tối thiểu {formData.minimumAmount.toLocaleString()} VND mới được tích điểm
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Ví dụ tính điểm:</h4>
              <p className="text-sm text-gray-600">
                Hóa đơn 500.000 VND sẽ được tích: {Math.floor((500000 / 1000) * formData.pointsPerAmount)} điểm
              </p>
              <p className="text-sm text-gray-600">
                Hóa đơn 1.200.000 VND sẽ được tích: {Math.floor((1200000 / 1000) * formData.pointsPerAmount)} điểm
              </p>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
