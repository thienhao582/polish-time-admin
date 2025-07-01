
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Edit, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AppointmentForm } from "@/components/AppointmentForm";
import { StaffServiceManager } from "@/components/StaffServiceManager";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, eachWeekOfInterval, getWeeksInMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { useSalonStore } from "@/stores/useSalonStore";

interface Appointment {
  id: number;
  date: string;
  time: string;
  customer: string;
  phone: string;
  service: string;
  duration: string;
  price: string;
  status: string;
  staff: string;
}

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStaffManagerOpen, setIsStaffManagerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailOpen, setIsAppointmentDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get appointments from Zustand store
  const { appointments, deleteAppointment } = useSalonStore();

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(apt => 
    apt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.staff.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppointmentCreate = (appointmentData: any) => {
    setIsFormOpen(false);
  };

  const handleAppointmentEdit = (appointmentData: any) => {
    setIsEditMode(false);
    setIsAppointmentDetailOpen(false);
  };

  const handleAppointmentClick = (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedAppointment(appointment);
    setIsAppointmentDetailOpen(true);
  };

  const handleEditClick = () => {
    setIsAppointmentDetailOpen(false);
    setIsEditMode(true);
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    deleteAppointment(appointmentId);
    setIsAppointmentDetailOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Xác nhận", variant: "default" as const },
      pending: { label: "Chờ xác nhận", variant: "secondary" as const },
      completed: { label: "Hoàn thành", variant: "default" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={
        status === "confirmed" ? "bg-green-100 text-green-700 hover:bg-green-100" :
        status === "completed" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""
      }>
        {config.label}
      </Badge>
    );
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return filteredAppointments.filter(apt => apt.date === dateString);
  };

  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    const appointments = getAppointmentsForDate(date);
    return appointments.filter(apt => {
      const [appointmentHour] = apt.time.split(':').map(Number);
      return appointmentHour === hour;
    });
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weeksInMonth = getWeeksInMonth(selectedDate, { weekStartsOn: 1 });

    return (
      <div className="w-full">
        {/* Header with day names */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-600 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-l border-t">
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[160px] border-r border-b last:border-r-0 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${isSelected ? 'border-4 border-pink-500' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                {/* Date number */}
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' :
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(day, "d")}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                {/* Appointments list */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 4).map((apt) => (
                    <div
                      key={apt.id}
                      className="text-xs p-2 bg-pink-50 border-l-2 border-pink-400 rounded text-gray-700 truncate cursor-pointer hover:bg-pink-100 transition-colors"
                      title={`${apt.time} - ${apt.customer} (${apt.service})`}
                      onClick={(e) => handleAppointmentClick(apt, e)}
                    >
                      <div className="font-medium">{apt.time}</div>
                      <div className="truncate">{apt.customer}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 4 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 4} khác
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, index) => (
          <div key={day} className="p-2 text-center font-medium text-gray-600 border-b">
            {day}
          </div>
        ))}
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          return (
            <div key={day.toISOString()} className="min-h-[200px] p-2 border-r border-b">
              <div className={`text-sm font-medium mb-2 ${isSameDay(day, new Date()) ? 'text-pink-600' : 'text-gray-700'}`}>
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayAppointments.map((apt) => (
                  <div 
                    key={apt.id} 
                    className="text-xs p-1 bg-pink-50 border-l-2 border-pink-400 rounded cursor-pointer hover:bg-pink-100"
                    onClick={(e) => handleAppointmentClick(apt, e)}
                  >
                    <div className="font-medium">{apt.time}</div>
                    <div className="text-gray-600">{apt.customer}</div>
                    <div className="text-gray-500">{apt.staff}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
    
    return (
      <div className="flex h-[600px]">
        {/* Time column */}
        <div className="w-20 border-r">
          <div className="h-12 border-b"></div> {/* Header spacer */}
          {hours.map((hour) => (
            <div key={hour} className="h-12 border-b flex items-center justify-center text-sm text-gray-600">
              {hour}:00
            </div>
          ))}
        </div>

        {/* Day content */}
        <div className="flex-1">
          {/* Header */}
          <div className="h-12 border-b flex items-center justify-center bg-gray-50 font-medium">
            {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}
          </div>
          
          {/* Timeline */}
          <div className="relative">
            {hours.map((hour) => {
              const appointments = getAppointmentsForTimeSlot(selectedDate, hour);
              return (
                <div key={hour} className="h-12 border-b relative hover:bg-gray-50">
                  {appointments.map((apt, index) => (
                    <div
                      key={apt.id}
                      className="absolute left-2 right-2 bg-pink-100 border-l-4 border-pink-500 rounded p-1 cursor-pointer hover:bg-pink-200 z-10"
                      style={{
                        top: `${index * 25}px`,
                        height: '22px'
                      }}
                      onClick={(e) => handleAppointmentClick(apt, e)}
                    >
                      <div className="text-xs font-medium truncate">
                        {apt.customer} - {apt.service}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleDateNavigation = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Lịch Hẹn</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả lịch hẹn</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isStaffManagerOpen} onOpenChange={setIsStaffManagerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
                Quản lý nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Quản lý nhân viên & dịch vụ</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <StaffServiceManager />
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 hover:bg-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm lịch hẹn
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Tạo lịch hẹn mới</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <AppointmentForm onClose={() => setIsFormOpen(false)} onSubmit={handleAppointmentCreate} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên khách hàng hoặc nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                onClick={() => setViewMode("month")}
                className={viewMode === "month" ? "bg-pink-600 hover:bg-pink-700" : ""}
              >
                Tháng
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                onClick={() => setViewMode("week")}
                className={viewMode === "week" ? "bg-pink-600 hover:bg-pink-700" : ""}
              >
                Tuần
              </Button>
              <Button
                variant={viewMode === "day" ? "default" : "outline"}
                onClick={() => setViewMode("day")}
                className={viewMode === "day" ? "bg-pink-600 hover:bg-pink-700" : ""}
              >
                Ngày
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleDateNavigation("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-medium min-w-[200px] text-center">
                  {viewMode === "month" && format(selectedDate, "MMMM yyyy", { locale: vi })}
                  {viewMode === "week" && `Tuần ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "dd/MM")} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "dd/MM/yyyy")}`}
                  {viewMode === "day" && format(selectedDate, "dd MMMM yyyy", { locale: vi })}
                </span>
                <Button variant="outline" size="sm" onClick={() => handleDateNavigation("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                Hôm nay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardContent className="p-6">
          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={isAppointmentDetailOpen} onOpenChange={setIsAppointmentDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Chi tiết lịch hẹn
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày</label>
                  <p className="text-sm">{format(new Date(selectedAppointment.date), "dd/MM/yyyy", { locale: vi })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Giờ</label>
                  <p className="text-sm">{selectedAppointment.time}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Khách hàng</label>
                  <p className="text-sm font-medium">{selectedAppointment.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                  <p className="text-sm">{selectedAppointment.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Dịch vụ</label>
                  <p className="text-sm">{selectedAppointment.service}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nhân viên</label>
                  <p className="text-sm">{selectedAppointment.staff}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Thời lượng</label>
                  <p className="text-sm">{selectedAppointment.duration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Giá</label>
                  <p className="text-sm font-medium text-green-600">{selectedAppointment.price}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                <div className="mt-1">
                  {getStatusBadge(selectedAppointment.status)}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa lịch hẹn</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa lịch hẹn này? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button 
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={handleEditClick}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {selectedAppointment && (
              <AppointmentForm 
                onClose={() => setIsEditMode(false)} 
                onSubmit={handleAppointmentEdit}
                editData={selectedAppointment}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
