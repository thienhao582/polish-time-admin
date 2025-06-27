import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/AppointmentForm";
import { StaffServiceManager } from "@/components/StaffServiceManager";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
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

  // Get appointments from Zustand store
  const { appointments } = useSalonStore();

  const handleAppointmentCreate = (appointmentData: any) => {
    setIsFormOpen(false);
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
    return appointments.filter(apt => apt.date === dateString);
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
                  <div key={apt.id} className="text-xs p-1 bg-pink-50 border-l-2 border-pink-400 rounded">
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
    const dayAppointments = getAppointmentsForDate(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <h3 className="text-lg font-semibold">
            {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}
          </h3>
        </div>
        <div className="space-y-2">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có lịch hẹn nào trong ngày này
            </div>
          ) : (
            dayAppointments.map((apt) => (
              <Card key={apt.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-lg">{apt.time}</span>
                      {getStatusBadge(apt.status)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{apt.customer}</p>
                      <p className="text-gray-600">{apt.service}</p>
                      <p className="text-sm text-gray-500">Nhân viên: {apt.staff}</p>
                      <p className="text-sm text-gray-500">Thời lượng: {apt.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{apt.price}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
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
          {viewMode === "month" && (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
              locale={vi}
              components={{
                DayContent: ({ date }) => {
                  const dayAppointments = getAppointmentsForDate(date);
                  return (
                    <div className="relative w-full h-full">
                      <div>{format(date, "d")}</div>
                      {dayAppointments.length > 0 && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                          <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          )}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
