
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/AppointmentForm";
import { StaffServiceManager } from "@/components/StaffServiceManager";
import { useSalonStore } from "@/stores/useSalonStore";
import { AppointmentCalendarHeader } from "@/components/appointments/AppointmentCalendarHeader";
import { AppointmentSearchBar } from "@/components/appointments/AppointmentSearchBar";
import { AppointmentMonthView } from "@/components/appointments/AppointmentMonthView";
import { AppointmentWeekView } from "@/components/appointments/AppointmentWeekView";
import { AppointmentDayView } from "@/components/appointments/AppointmentDayView";
import { AppointmentDetailDialog } from "@/components/appointments/AppointmentDetailDialog";

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
      <AppointmentSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* View Controls */}
      <Card>
        <CardContent className="p-6">
          <AppointmentCalendarHeader
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedDate={selectedDate}
            handleDateNavigation={handleDateNavigation}
            setSelectedDate={setSelectedDate}
          />
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardContent className="p-6">
          {viewMode === "month" && (
            <AppointmentMonthView
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              filteredAppointments={filteredAppointments}
              handleAppointmentClick={handleAppointmentClick}
            />
          )}
          {viewMode === "week" && (
            <AppointmentWeekView
              selectedDate={selectedDate}
              filteredAppointments={filteredAppointments}
              handleAppointmentClick={handleAppointmentClick}
            />
          )}
          {viewMode === "day" && (
            <AppointmentDayView
              selectedDate={selectedDate}
              filteredAppointments={filteredAppointments}
              handleAppointmentClick={handleAppointmentClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <AppointmentDetailDialog
        isOpen={isAppointmentDetailOpen}
        onOpenChange={setIsAppointmentDetailOpen}
        appointment={selectedAppointment}
        onEdit={handleEditClick}
        onDelete={handleDeleteAppointment}
      />

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
