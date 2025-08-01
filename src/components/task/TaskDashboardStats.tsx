import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  BarChart3,
  Clock,
  Zap
} from "lucide-react";

interface TaskDashboardStatsProps {
  stats: {
    total: number;
    available: number;
    busy: number;
    finished: number;
    totalRevenue: number;
    totalAppointments: number;
    averageServiceTime?: number;
    efficiency?: number;
  };
}

export const TaskDashboardStats = ({ stats }: TaskDashboardStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">Tổng nhân viên</CardTitle>
          <Users className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <p className="text-xs text-blue-700 mt-1">Đang hoạt động</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-900">Đang rảnh</CardTitle>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{stats.available}</div>
          <p className="text-xs text-green-700 mt-1">Sẵn sàng nhận khách</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-900">Đang bận</CardTitle>
          <AlertCircle className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">{stats.busy}</div>
          <p className="text-xs text-red-700 mt-1">Đang phục vụ khách</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-900">Hoàn thành</CardTitle>
          <CheckCircle className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{stats.finished}</div>
          <p className="text-xs text-purple-700 mt-1">Xong việc hôm nay</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-900">Lịch hẹn</CardTitle>
          <Calendar className="h-5 w-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{stats.totalAppointments}</div>
          <p className="text-xs text-orange-700 mt-1">Hôm nay</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900">Doanh thu</CardTitle>
          <BarChart3 className="h-5 w-5 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-emerald-900">
            {new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND',
              notation: 'compact'
            }).format(stats.totalRevenue)}
          </div>
          <p className="text-xs text-emerald-700 mt-1">Hôm nay</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-indigo-900">Hiệu suất</CardTitle>
          <Zap className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-900">
            {Math.round((stats.busy / Math.max(stats.total, 1)) * 100)}%
          </div>
          <p className="text-xs text-indigo-700 mt-1">Tỷ lệ bận rộn</p>
        </CardContent>
      </Card>
    </div>
  );
};