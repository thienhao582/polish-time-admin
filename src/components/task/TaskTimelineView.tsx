import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  User,
  Calendar,
  Timer,
  CheckCircle,
  AlertCircle,
  Coffee
} from "lucide-react";
import { format, addHours } from "date-fns";

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

interface TaskTimelineViewProps {
  employees: EmployeeStatus[];
  currentTime: Date;
}

export const TaskTimelineView = ({ employees, currentTime }: TaskTimelineViewProps) => {
  // Generate timeline hours (8 AM to 8 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(format(addHours(new Date().setHours(hour, 0, 0, 0), 0), 'HH:mm'));
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const currentHour = format(currentTime, 'HH:mm');

  const getStatusColor = (status: EmployeeStatus['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'break': return 'bg-yellow-500';
      case 'finished': return 'bg-blue-500';
      default: return 'bg-gray-500';
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

  const isTimeSlotActive = (time: string, employee: EmployeeStatus) => {
    if (employee.currentTask) {
      return time >= employee.currentTask.startTime && time <= employee.currentTask.endTime;
    }
    return false;
  };

  const getTimeSlotStatus = (time: string, employee: EmployeeStatus) => {
    if (employee.currentTask && isTimeSlotActive(time, employee)) {
      return 'busy';
    }
    if (employee.nextAppointment && time >= employee.nextAppointment.startTime && time <= employee.nextAppointment.endTime) {
      return 'scheduled';
    }
    return 'available';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Timeline View - Lịch làm việc theo giờ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Time header */}
            <div className="grid grid-cols-[200px_1fr] gap-4 mb-4">
              <div className="font-semibold text-center py-2">Nhân viên</div>
              <div className="grid grid-cols-13 gap-1">
                {timeSlots.map((time) => (
                  <div 
                    key={time} 
                    className={`text-xs text-center py-2 font-medium ${
                      time === currentHour ? 'bg-blue-100 text-blue-800 rounded' : ''
                    }`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>

            {/* Employee rows */}
            <div className="space-y-2">
              {employees.map((employee) => {
                const StatusIcon = getStatusIcon(employee.status);
                
                return (
                  <div key={employee.id} className="grid grid-cols-[200px_1fr] gap-4 items-center">
                    {/* Employee info */}
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {employee.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white ${getStatusColor(employee.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{employee.role}</p>
                      </div>
                    </div>

                    {/* Timeline slots */}
                    <div className="grid grid-cols-13 gap-1">
                      {timeSlots.map((time) => {
                        const slotStatus = getTimeSlotStatus(time, employee);
                        const isActive = isTimeSlotActive(time, employee);
                        
                        return (
                          <div 
                            key={time}
                            className={`h-12 rounded border-2 transition-all duration-200 relative group ${
                              slotStatus === 'busy' ? 'bg-red-100 border-red-300' :
                              slotStatus === 'scheduled' ? 'bg-blue-100 border-blue-300' :
                              'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isActive && employee.currentTask && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              </div>
                            )}
                            
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                              {isActive && employee.currentTask ? 
                                `${employee.currentTask.customerName} - ${employee.currentTask.serviceName}` :
                                slotStatus === 'scheduled' && employee.nextAppointment ?
                                `Đã đặt: ${employee.nextAppointment.customerName}` :
                                'Trống'
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
                <span>Đang bận</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded" />
                <span>Đã đặt lịch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded" />
                <span>Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Đang phục vụ</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};