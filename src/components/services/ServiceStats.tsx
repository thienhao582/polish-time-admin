
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Power, DollarSign, Clock } from "lucide-react";
import { Service } from "@/stores/useSalonStore";

interface ServiceStatsProps {
  services: Service[];
}

export const ServiceStats = ({ services }: ServiceStatsProps) => {
  const activeServices = services.filter(s => s.status === 'active').length;
  const avgPrice = services.length > 0 ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(2) : '0.00';
  const avgDuration = services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng dịch vụ</p>
              <p className="text-2xl font-bold text-gray-800">{services.length}</p>
            </div>
            <Scissors className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{activeServices}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Power className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Giá trung bình</p>
              <p className="text-2xl font-bold text-green-600">${avgPrice}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Thời gian TB</p>
              <p className="text-2xl font-bold text-blue-600">{avgDuration}p</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
