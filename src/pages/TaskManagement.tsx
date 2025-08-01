import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Shuffle,
  User
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Import new components
import { TaskDashboardStats } from "@/components/task/TaskDashboardStats";
import { TaskFilters } from "@/components/task/TaskFilters";
import { TaskEmployeeCard } from "@/components/task/TaskEmployeeCard";
import { TaskTimelineView } from "@/components/task/TaskTimelineView";
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
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "timeline">("cards");
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
    
    // Service filter logic
    let matchesService = true;
    if (serviceFilter !== "all") {
      if (emp.currentTask) {
        const serviceName = emp.currentTask.serviceName.toLowerCase();
        matchesService = 
          (serviceFilter === "MANI" && serviceName.includes("mani")) ||
          (serviceFilter === "PEDI" && serviceName.includes("pedi")) ||
          (serviceFilter === "BGS" && serviceName.includes("gel")) ||
          (serviceFilter === "OTHER" && !serviceName.includes("mani") && !serviceName.includes("pedi") && !serviceName.includes("gel"));
      } else {
        matchesService = false; // If no current task, doesn't match any specific service
      }
    }
    
    return matchesSearch && matchesStatus && matchesService;
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

  // Filter helpers
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== "all") count++;
    if (serviceFilter !== "all") count++;
    return count;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setServiceFilter("all");
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

      {/* Enhanced Statistics Dashboard */}
      <TaskDashboardStats stats={stats} />

      {/* Enhanced Filters */}
      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        serviceFilter={serviceFilter}
        onServiceChange={setServiceFilter}
        onClearFilters={clearFilters}
        activeFiltersCount={getActiveFiltersCount()}
      />

      {/* View Mode Tabs */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Chế độ xem:</span>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "cards" | "list" | "timeline")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Thẻ</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Danh sách</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shuffle className="h-4 w-4" />
          Hiển thị {filteredEmployees.length} / {employeeStatuses.length} nhân viên
        </div>
      </div>

      {/* Dynamic View Content */}
      {viewMode === "cards" ? (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredEmployees.map((employee) => (
            <TaskEmployeeCard 
              key={employee.id} 
              employee={employee} 
              getTimeRemaining={getTimeRemaining}
            />
          ))}
        </div>
      ) : viewMode === "timeline" ? (
        <TaskTimelineView 
          employees={filteredEmployees} 
          currentTime={currentTime}
        />
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