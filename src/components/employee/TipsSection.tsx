import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

interface TipsSectionProps {
  tipsPercentage: number;
  onTipsPercentageChange: (percentage: number) => void;
}

export function TipsSection({ tipsPercentage, onTipsPercentageChange }: TipsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <span>Thiết lập tiền Tips</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tips-percentage">Phần trăm tiền Tips (%)</Label>
          <div className="relative">
            <Input
              id="tips-percentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={tipsPercentage}
              onChange={(e) => onTipsPercentageChange(parseFloat(e.target.value) || 0)}
              placeholder="Nhập % tiền tips (ví dụ: 10)"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-sm text-gray-600">
            Phần trăm tiền tips mà nhân viên này sẽ nhận từ mỗi dịch vụ
          </p>
        </div>
      </CardContent>
    </Card>
  );
}