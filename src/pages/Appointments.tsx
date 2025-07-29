import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/AppointmentForm";
import { StaffServiceManager } from "@/components/StaffServiceManager";
import { useSalonStore } from "@/stores/useSalonStore";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { AppointmentCalendarHeader } from "@/components/appointments/AppointmentCalendarHeader";
import { AppointmentSearchBar } from "@/components/appointments/AppointmentSearchBar";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { AppointmentMonthView } from "@/components/appointments/AppointmentMonthView";
import { AppointmentWeekView } from "@/components/appointments/AppointmentWeekView";
import { AppointmentDayView } from "@/components/appointments/AppointmentDayView";
import { AppointmentDetailDialog } from "@/components/appointments/AppointmentDetailDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

// Interface for components that expect the old format
interface LegacyAppointment {
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
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStaffManagerOpen, setIsStaffManagerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<LegacyAppointment | null>(null);
  const [isAppointmentDetailOpen, setIsAppointmentDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayMode, setDisplayMode] = useState<"customer" | "staff" | "both">("both");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showFullView, setShowFullView] = useState(true);
  const [appointments, setAppointments] = useState<LegacyAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Get employees from Zustand store and fetch appointments from Supabase
  const { employees, initializeData } = useSalonStore();
  const { fetchAppointments } = useSupabaseData();

  // Load appointments from Supabase on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const supabaseAppointments = await fetchAppointments();
      
      // Transform Supabase appointments to legacy format for components
      const transformedAppointments: LegacyAppointment[] = supabaseAppointments.map((apt, index) => ({
        id: parseInt(apt.id) || index + 1, // Convert string id to number
        date: apt.appointment_date,
        time: apt.appointment_time,
        customer: apt.customer_name,
        phone: apt.customer_phone || "",
        service: apt.service_name,
        duration: apt.duration_minutes ? `${apt.duration_minutes} phút` : "",
        price: apt.price ? `${apt.price.toLocaleString()}đ` : "",
        status: apt.status,
        staff: apt.employee_name || ""
      }));
      
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };
  
  console.log("Appointments page - Total appointments:", appointments.length);
  console.log("Appointments page - All appointments:", appointments);

  // Check if any filters are actually applied
  const hasActiveFilters = searchQuery.trim() !== "" || selectedStaffIds.length > 0;

  // Filter appointments based on search query, staff filter, and date range
  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.staff.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply staff filter
    if (selectedStaffIds.length > 0) {
      filtered = filtered.filter(apt => 
        selectedStaffIds.some(staffId => {
          const staff = employees.find(e => e.id === staffId);
          return staff && apt.staff.includes(staff.name);
        })
      );
    }

    // Apply date range filter based on view mode
    const currentDate = selectedDate;
    let startDate: Date;
    let endDate: Date;

    if (viewMode === "month") {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    } else if (viewMode === "week") {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
      // day view
      startDate = currentDate;
      endDate = currentDate;
    }

    const startDateString = format(startDate, "yyyy-MM-dd");
    const endDateString = format(endDate, "yyyy-MM-dd");

    filtered = filtered.filter(apt => {
      return apt.date >= startDateString && apt.date <= endDateString;
    });

    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();

  const handleAppointmentCreate = async (appointmentData: any) => {
    setIsFormOpen(false);
    // Refresh appointments after creating
    await loadAppointments();
    toast.success("Lịch hẹn đã được tạo thành công!");
  };

  const handleAppointmentEdit = async (appointmentData: any) => {
    setIsEditMode(false);
    setIsAppointmentDetailOpen(false);
    // Refresh appointments after editing
    await loadAppointments();
    toast.success("Lịch hẹn đã được cập nhật!");
  };

  const handleAppointmentClick = (appointment: LegacyAppointment, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedAppointment(appointment);
    setIsAppointmentDetailOpen(true);
  };

  const handleEditClick = () => {
    setIsAppointmentDetailOpen(false);
    setIsEditMode(true);
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      // Note: We need to add delete functionality to useSupabaseData hook
      console.log("Delete appointment:", appointmentId);
      // For now, just close the dialog
      setIsAppointmentDetailOpen(false);
      toast.info("Chức năng xóa sẽ được thêm sau");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Có lỗi xảy ra khi xóa lịch hẹn");
    }
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

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('appointments.title')}</h1>
            <p className="text-gray-600 mt-1">{t('appointments.subtitle')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isMaximized ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('appointments.title')}</h1>
          <p className="text-gray-600 mt-1">{t('appointments.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              initializeData();
              loadAppointments();
              toast.success("Đã reset dữ liệu demo với 300 lịch hẹn!");
            }}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Reset Demo Data
          </Button>
          
          <Dialog open={isStaffManagerOpen} onOpenChange={setIsStaffManagerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
                {t('appointments.manage_staff')}
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
                {t('appointments.add')}
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

      {/* Filters */}
      <AppointmentFilters
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        selectedStaffIds={selectedStaffIds}
        setSelectedStaffIds={setSelectedStaffIds}
        filteredAppointmentsCount={filteredAppointments.length}
        onMaximize={handleMaximize}
        showFullView={showFullView}
        setShowFullView={setShowFullView}
      />

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
              displayMode={displayMode}
              showFullView={showFullView || !hasActiveFilters}
            />
          )}
          {viewMode === "week" && (
            <AppointmentWeekView
              selectedDate={selectedDate}
              filteredAppointments={filteredAppointments}
              handleAppointmentClick={handleAppointmentClick}
              displayMode={displayMode}
              showFullView={showFullView || !hasActiveFilters}
            />
          )}
          {viewMode === "day" && (
            <AppointmentDayView
              selectedDate={selectedDate}
              filteredAppointments={filteredAppointments}
              handleAppointmentClick={handleAppointmentClick}
              displayMode={displayMode}
              showFullView={showFullView || !hasActiveFilters}
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
                editData={{
                  date: selectedAppointment.date,
                  time: selectedAppointment.time,
                  customer: selectedAppointment.customer,
                  phone: selectedAppointment.phone,
                  service: selectedAppointment.service,
                  notes: ""
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;