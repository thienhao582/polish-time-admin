import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Timer, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock,
  CreditCard,
  User,
  Coffee,
  Scissors,
  Palette,
  Sparkles
} from "lucide-react";

interface EmployeeStatus {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'break' | 'finished';
  currentTask?: {
    id: string;
    customerName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
    progress: number;
  };
  nextAppointment?: {
    id: string;
    customerName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
  };
  todayAppointments: number;
  revenue: number;
}

interface TaskEmployeeCardProps {
  employee: EmployeeStatus;
  getTimeRemaining: (endTime: string) => string;
}

export const TaskEmployeeCard = ({ employee, getTimeRemaining }: TaskEmployeeCardProps) => {
  const getStatusColor = (status: EmployeeStatus['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'break': return 'bg-yellow-500';
      case 'finished': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: EmployeeStatus['status']) => {
    switch (status) {
      case 'available': return 'Rảnh';
      case 'busy': return 'Đang bận';
      case 'break': return 'Nghỉ giải lao';
      case 'finished': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status: EmployeeStatus['status']) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'busy': return AlertCircle;
      case 'break': return Coffee;
      case 'finished': return CheckCircle;
      default: return User;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('mani')) return Scissors;
    if (serviceName.toLowerCase().includes('pedi')) return Sparkles;
    if (serviceName.toLowerCase().includes('gel')) return Palette;
    return Scissors;
  };

  const StatusIcon = getStatusIcon(employee.status);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      employee.status === 'busy' ? 'ring-2 ring-red-200 bg-red-50/30' :
      employee.status === 'available' ? 'ring-2 ring-green-200 bg-green-50/30' :
      employee.status === 'finished' ? 'ring-2 ring-blue-200 bg-blue-50/30' :
      'ring-2 ring-yellow-200 bg-yellow-50/30'
    }`}>
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusColor(employee.status)}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarFallback className="text-sm font-semibold">
                  {employee.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${getStatusColor(employee.status)} flex items-center justify-center`}>
                <StatusIcon className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{employee.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {employee.role}
              </p>
            </div>
          </div>
          <Badge 
            variant={employee.status === 'available' ? 'default' : 'secondary'}
            className={`${
              employee.status === 'available' ? 'bg-green-100 text-green-800 border-green-300' :
              employee.status === 'busy' ? 'bg-red-100 text-red-800 border-red-300' :
              employee.status === 'finished' ? 'bg-blue-100 text-blue-800 border-blue-300' :
              'bg-yellow-100 text-yellow-800 border-yellow-300'
            }`}
          >
            {getStatusText(employee.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Task */}
        {employee.currentTask && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Timer className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-800">Đang phục vụ</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{employee.currentTask.customerName}</p>
                <div className="flex items-center gap-1 text-red-600">
                  {React.createElement(getServiceIcon(employee.currentTask.serviceName), { className: "h-4 w-4" })}
                  <span className="text-sm font-medium">{employee.currentTask.serviceName}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {employee.currentTask.startTime} - {employee.currentTask.endTime}
                </span>
                <span className="font-semibold text-red-600">
                  Còn {getTimeRemaining(employee.currentTask.endTime)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiến độ</span>
                  <span className="font-medium">{employee.currentTask.progress}%</span>
                </div>
                <Progress 
                  value={employee.currentTask.progress} 
                  className="h-3"
                />
              </div>
            </div>
          </div>
        )}

        {/* Next Appointment */}
        {employee.nextAppointment && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Lịch hẹn tiếp theo</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{employee.nextAppointment.customerName}</p>
                <div className="flex items-center gap-1 text-blue-600">
                  {React.createElement(getServiceIcon(employee.nextAppointment.serviceName), { className: "h-4 w-4" })}
                  <span className="text-sm font-medium">{employee.nextAppointment.serviceName}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-blue-600">
                <Clock className="h-3 w-3" />
                <span className="text-sm font-medium">
                  {employee.nextAppointment.startTime} - {employee.nextAppointment.endTime}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Available Status */}
        {employee.status === 'available' && !employee.currentTask && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-800">Sẵn sàng nhận khách</p>
            <p className="text-sm text-green-600 mt-1">Có thể đặt lịch ngay</p>
          </div>
        )}

        {/* Finished Status */}
        {employee.status === 'finished' && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-blue-800">Hoàn thành công việc hôm nay</p>
            <p className="text-sm text-blue-600 mt-1">Đã xong tất cả lịch hẹn</p>
          </div>
        )}

        {/* Daily Stats */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{employee.todayAppointments}</div>
              <div className="text-xs text-muted-foreground">Lịch hẹn</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(employee.revenue)}đ
              </div>
              <div className="text-xs text-muted-foreground">Doanh thu</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <CreditCard className="h-4 w-4 mr-1" />
            PAY
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <User className="h-4 w-4 mr-1" />
            Chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};