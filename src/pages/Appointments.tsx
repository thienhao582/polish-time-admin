import { useState, useEffect } from "react";
import { Plus, Maximize2 } from "lucide-react";
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
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useDemoData } from "@/hooks/useDemoData";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { AvailableStaffSidebar } from "@/components/appointments/AvailableStaffSidebar";
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
  email?: string;
  notes?: string;
  services?: Array<{
    serviceId: string;
    serviceName: string;
    staffIds: string[];
    staffNames: string[];
    price: number;
    duration: number;
  }>;
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
  const [showAvailableStaffSidebar, setShowAvailableStaffSidebar] = useState(false); // Will be set based on viewMode
  const [appointments, setAppointments] = useState<LegacyAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentStatus, setAppointmentStatus] = useState("confirmed");
  const [initialFormData, setInitialFormData] = useState<any>(null);

  // Get employees from Zustand store and fetch appointments from Supabase
  const { employees, initializeData, appointments: demoAppointments } = useSalonStore();
  const { fetchAppointments } = useSupabaseData();
  const { fetchDemoAppointments } = useDemoData();
  const { isDemoMode, setDemoMode } = useDemoMode();

  // Load appointments on component mount and when demo mode changes
  useEffect(() => {
    loadAppointments();
  }, [isDemoMode]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Use demo data from IndexedDB
        const demoAppointmentsData = await fetchDemoAppointments();
        console.log("Demo appointments from IndexedDB:", demoAppointmentsData);
        
        if (demoAppointmentsData && demoAppointmentsData.length > 0) {
          // Transform demo appointments to legacy format
          const transformedAppointments: LegacyAppointment[] = demoAppointmentsData.map((apt: any, index) => ({
            id: parseInt(apt.id?.replace('appointment-', '')) || index + 1,
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
        } else {
          // Fallback to store data if IndexedDB is empty
          const transformedAppointments: LegacyAppointment[] = demoAppointments.map((apt) => ({
            id: apt.id,
            date: apt.date,
            time: apt.time,
            customer: apt.customer,
            phone: apt.phone,
            service: apt.service,
            duration: apt.duration,
            price: apt.price,
            status: apt.status,
            staff: apt.staff
          }));
          setAppointments(transformedAppointments);
        }
      } else {
        // Use Supabase data
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
      }
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

    // Apply status filter
    if (appointmentStatus !== "all") {
      filtered = filtered.filter(apt => apt.status === appointmentStatus);
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
    setInitialFormData(null);
    // Refresh appointments after creating
    await loadAppointments();
    toast.success("Lịch hẹn đã được tạo thành công!");
  };

  const handleTimeSlotClick = (date: string, time: string, employeeName: string) => {
    setInitialFormData({
      date,
      time,
      employeeName
    });
    setIsFormOpen(true);
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
    // Set up edit data with full appointment info including services
    setInitialFormData({
      ...selectedAppointment,
      date: selectedAppointment?.date,
      time: selectedAppointment?.time,
      customer: selectedAppointment?.customer,
      phone: selectedAppointment?.phone,
      email: selectedAppointment?.email || "",
      notes: selectedAppointment?.notes || "",
      service: selectedAppointment?.service,
      staff: selectedAppointment?.staff,
      services: selectedAppointment?.services || [],
    });
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

  // Auto open sidebar when switching to day view
  useEffect(() => {
    if (viewMode === "day") {
      setShowAvailableStaffSidebar(true);
    } else {
      setShowAvailableStaffSidebar(false);
    }
  }, [viewMode]);

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
    <div className={`h-screen flex flex-col overflow-hidden ${isMaximized ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Fixed Header with Action Buttons - Hide when maximized */}
      {!isMaximized && (
        <>
          <div className="sticky top-0 z-40 bg-white pb-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{t('appointments.title')}</h1>
                <p className="text-gray-600 mt-1">{t('appointments.subtitle')}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => {
              // Clear localStorage to force refresh
              localStorage.removeItem('salon-store');
              window.location.reload();
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
                <AppointmentForm 
                  onClose={() => {
                    setIsFormOpen(false);
                    setInitialFormData(null);
                  }} 
                  onSubmit={handleAppointmentCreate}
                  editData={initialFormData}
                />
              </div>
            </DialogContent>
          </Dialog>
          </div>
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
         viewMode={viewMode}
         selectedDate={selectedDate}
         filteredAppointments={filteredAppointments}
             showAvailableStaffSidebar={showAvailableStaffSidebar}
             setShowAvailableStaffSidebar={setShowAvailableStaffSidebar}
             isMaximized={isMaximized}
             appointmentStatus={appointmentStatus}
             setAppointmentStatus={setAppointmentStatus}
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
        </>
      )}

      {/* Maximize Mode - Show only minimize button */}
      {isMaximized && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMaximize}
            className="gap-2 bg-white shadow-lg"
          >
            <Maximize2 className="w-4 h-4" />
            Thu nhỏ
          </Button>
        </div>
      )}

      {/* Main Content with Sidebar - Full Height Container */}
      <div className={`flex-1 flex gap-4 min-h-0 overflow-hidden w-full ${isMaximized ? 'h-full' : ''}`}>
        {/* Calendar View - Calculate max width based on available space */}
        <div className={`transition-all duration-300 min-w-0 overflow-hidden flex-1`}>
          <Card className="h-full overflow-hidden">
            <CardContent className="p-0 h-full overflow-hidden">
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
                  onTimeSlotClick={handleTimeSlotClick}
                  searchQuery={searchQuery}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Staff Sidebar */}
        {viewMode === "day" && showAvailableStaffSidebar && (
          <div className="w-64 flex-shrink-0 overflow-hidden">
            <Card className="h-full overflow-hidden">
              <CardContent className="p-3 h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Nhân viên sẵn sàng</h3>
                  <button
                    onClick={() => setShowAvailableStaffSidebar(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <AvailableStaffSidebar 
                  selectedDate={selectedDate}
                  filteredAppointments={filteredAppointments}
                  isContentOnly={true}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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
                editData={initialFormData}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;