import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  User, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  Timer,
  Users,
  BarChart3
} from "lucide-react";
import { useSalonStore } from "@/stores/useSalonStore";
import { format, addMinutes, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { formatTimeRange } from "@/utils/timeUtils";

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
    progress: number; // 0-100
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

const TaskManagement = () => {
  const { employees, appointments, services } = useSalonStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate employee statuses
  const getEmployeeStatuses = (): EmployeeStatus[] => {
    const today = format(currentTime, 'yyyy-MM-dd');
    
    return employees
      .filter(emp => emp.status === 'đang làm')
      .map(employee => {
        // Get today's appointments for this employee
        const todayAppointments = appointments.filter(apt => 
          apt.staff === employee.name && apt.date === today
        );

        // Find current task (ongoing appointment)
        const currentTask = todayAppointments.find(apt => {
          const startTime = new Date(`${apt.date} ${apt.time}`);
          const endTime = addMinutes(startTime, Number(apt.duration) || 60);
          return isAfter(currentTime, startTime) && isBefore(currentTime, endTime);
        });

        // Find next appointment
        const futureAppointments = todayAppointments
          .filter(apt => {
            const startTime = new Date(`${apt.date} ${apt.time}`);
            return isAfter(startTime, currentTime);
          })
          .sort((a, b) => {
            const timeA = new Date(`${a.date} ${a.time}`);
            const timeB = new Date(`${b.date} ${b.time}`);
            return timeA.getTime() - timeB.getTime();
          });

        const nextAppointment = futureAppointments[0];

        // Calculate status
        let status: EmployeeStatus['status'] = 'available';
        if (currentTask) {
          status = 'busy';
        } else if (todayAppointments.length === 0) {
          status = 'available';
        } else {
          // Check if employee finished all appointments for today
          const lastAppointment = todayAppointments
            .sort((a, b) => {
              const timeA = new Date(`${a.date} ${a.time}`);
              const timeB = new Date(`${b.date} ${b.time}`);
              return timeB.getTime() - timeA.getTime();
            })[0];
          
          if (lastAppointment) {
            const lastEndTime = addMinutes(
              new Date(`${lastAppointment.date} ${lastAppointment.time}`), 
              Number(lastAppointment.duration) || 60
            );
            if (isBefore(lastEndTime, currentTime)) {
              status = 'finished';
            }
          }
        }

        // Calculate progress for current task
        let progress = 0;
        if (currentTask) {
          const startTime = new Date(`${currentTask.date} ${currentTask.time}`);
          const endTime = addMinutes(startTime, Number(currentTask.duration) || 60);
          const totalDuration = endTime.getTime() - startTime.getTime();
          const elapsed = currentTime.getTime() - startTime.getTime();
          progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        }

        // Calculate today's revenue
        const revenue = todayAppointments.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0);

        return {
          id: employee.id,
          name: employee.name,
          role: employee.role,
          status,
          currentTask: currentTask ? {
            id: currentTask.id.toString(),
            customerName: currentTask.customer,
            serviceName: currentTask.service,
            startTime: currentTask.time,
            endTime: format(
              addMinutes(new Date(`${currentTask.date} ${currentTask.time}`), Number(currentTask.duration) || 60),
              'HH:mm'
            ),
            progress: Math.round(progress)
          } : undefined,
          nextAppointment: nextAppointment ? {
            id: nextAppointment.id.toString(),
            customerName: nextAppointment.customer,
            serviceName: nextAppointment.service,
            startTime: nextAppointment.time,
            endTime: format(
              addMinutes(new Date(`${nextAppointment.date} ${nextAppointment.time}`), Number(nextAppointment.duration) || 60),
              'HH:mm'
            ),
          } : undefined,
          todayAppointments: todayAppointments.length,
          revenue
        };
      });
  };

  const employeeStatuses = getEmployeeStatuses();

  // Filter employees
  const filteredEmployees = employeeStatuses.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: employeeStatuses.length,
    available: employeeStatuses.filter(e => e.status === 'available').length,
    busy: employeeStatuses.filter(e => e.status === 'busy').length,
    finished: employeeStatuses.filter(e => e.status === 'finished').length,
    totalRevenue: employeeStatuses.reduce((sum, emp) => sum + emp.revenue, 0),
    totalAppointments: employeeStatuses.reduce((sum, emp) => sum + emp.todayAppointments, 0)
  };

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

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(`${format(currentTime, 'yyyy-MM-dd')} ${endTime}`);
    const diff = end.getTime() - currentTime.getTime();
    if (diff <= 0) return "Đã xong";
    
    const minutes = Math.ceil(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} phút`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}p`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý công việc</h1>
          <p className="text-muted-foreground">
            Theo dõi real-time trạng thái và công việc của từng nhân viên
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Cập nhật: {format(currentTime, 'HH:mm:ss - dd/MM/yyyy', { locale: vi })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang rảnh</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang bận</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.busy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.finished}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch hẹn hôm nay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="available">Rảnh</SelectItem>
              <SelectItem value="busy">Đang bận</SelectItem>
              <SelectItem value="finished">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid">Lưới</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Employee Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {employee.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(employee.status)}`} />
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  <Badge variant={employee.status === 'available' ? 'default' : 'secondary'}>
                    {getStatusText(employee.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Current Task */}
                {employee.currentTask && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Đang làm</span>
                    </div>
                    <p className="text-sm font-medium">{employee.currentTask.customerName}</p>
                    <p className="text-sm text-muted-foreground">{employee.currentTask.serviceName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        {employee.currentTask.startTime} - {employee.currentTask.endTime}
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        Còn {getTimeRemaining(employee.currentTask.endTime)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tiến độ</span>
                        <span>{employee.currentTask.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${employee.currentTask.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Appointment */}
                {employee.nextAppointment && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Lịch hẹn tiếp theo</span>
                    </div>
                    <p className="text-sm font-medium">{employee.nextAppointment.customerName}</p>
                    <p className="text-sm text-muted-foreground">{employee.nextAppointment.serviceName}</p>
                    <span className="text-sm text-blue-600">
                      {employee.nextAppointment.startTime} - {employee.nextAppointment.endTime}
                    </span>
                  </div>
                )}

                {/* Available Status */}
                {employee.status === 'available' && !employee.currentTask && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800">Sẵn sàng nhận khách</p>
                  </div>
                )}

                {/* Daily Stats */}
                <div className="flex justify-between text-sm">
                  <span>Hôm nay: {employee.todayAppointments} lịch hẹn</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(employee.revenue)}đ</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {employee.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(employee.status)}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{employee.name}</h3>
                          <Badge variant={employee.status === 'available' ? 'default' : 'secondary'}>
                            {getStatusText(employee.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                        
                        <div className="flex gap-6 mt-2">
                          {employee.currentTask && (
                            <div className="text-sm">
                              <span className="text-red-600 font-medium">Đang làm: </span>
                              <span>{employee.currentTask.customerName} - {employee.currentTask.serviceName}</span>
                              <span className="text-muted-foreground"> (còn {getTimeRemaining(employee.currentTask.endTime)})</span>
                            </div>
                          )}
                          
                          {employee.nextAppointment && (
                            <div className="text-sm">
                              <span className="text-blue-600 font-medium">Tiếp theo: </span>
                              <span>{employee.nextAppointment.customerName} - {employee.nextAppointment.startTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">{employee.todayAppointments} lịch hẹn</div>
                        <div className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat('vi-VN').format(employee.revenue)}đ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Không tìm thấy nhân viên</h3>
            <p className="text-muted-foreground">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskManagement;