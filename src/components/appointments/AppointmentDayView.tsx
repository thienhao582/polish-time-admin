import { format } from "date-fns";
import { useSalonStore } from "@/stores/useSalonStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { formatTimeRange } from "@/utils/timeUtils";
import { isEmployeeAvailableAtTime, getEmployeeScheduleStatus } from "@/utils/scheduleUtils";
import { cn } from "@/lib/utils";
import { useState, useRef, useMemo, useCallback } from "react";
import { useDragStore } from "@/stores/useDragStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCheck, ClipboardList, Clock, Ban, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckInSidebar } from "./CheckInSidebar";
import { EmployeeScheduleDialog } from "./EmployeeScheduleDialog";
import { QuickScheduleDialog } from "./QuickScheduleDialog";

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
  extraTime?: number;
}

interface AppointmentDayViewProps {
  selectedDate: Date;
  filteredAppointments: Appointment[];
  handleAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
  displayMode: "customer" | "staff" | "both";
  showFullView: boolean;
  onTimeSlotClick?: (date: string, time: string, employeeName: string) => void;
  searchQuery?: string;
  onAppointmentCreated?: () => void;
  onScheduleUpdate?: () => void;
  onAppointmentDrop?: (appointmentId: number, newTime: string, newStaff?: string) => void;
}

export function AppointmentDayView({
  selectedDate,
  filteredAppointments,
  handleAppointmentClick,
  displayMode,
  showFullView,
  onTimeSlotClick,
  searchQuery,
  onAppointmentCreated,
  onScheduleUpdate,
  onAppointmentDrop
}: AppointmentDayViewProps) {
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { employees, timeRecords } = useSalonStore();
  const { appointmentColors } = useSettingsStore();
  
  // State for anyone appointments popup
  const [isAnyonePopupOpen, setIsAnyonePopupOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedSlotAppointments, setSelectedSlotAppointments] = useState<any[]>([]);
  
  // State for check-in sidebar
  const [isCheckInSidebarOpen, setIsCheckInSidebarOpen] = useState(false);
  
  // State for employee schedule dialog
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // State for quick schedule dialog
  const [isQuickScheduleDialogOpen, setIsQuickScheduleDialogOpen] = useState(false);
  const [selectedQuickScheduleEmployee, setSelectedQuickScheduleEmployee] = useState<any>(null);
  
  // Force re-render when schedules change
  const [scheduleUpdateCounter, setScheduleUpdateCounter] = useState(0);
  
  const handleScheduleUpdate = useCallback(() => {
    setScheduleUpdateCounter(prev => prev + 1);
    onScheduleUpdate?.();
  }, [onScheduleUpdate]);
  
  // Drag highlight ref to avoid rerenders during dragover
  const lastHighlightRef = useRef<HTMLElement | null>(null);
  // Global drag state via zustand (no prop drilling, minimal re-renders)
  const draggedAppointmentId = useDragStore(s => s.draggedAppointmentId);
  const startDrag = useDragStore(s => s.startDrag);
  const endDrag = useDragStore(s => s.endDrag);
  const isDragEnabled = useDragStore(s => s.isDragEnabled);

  // Helper functions - defined early to avoid initialization errors
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    // Handle formats like "09:08 AM" or "9:08 pm"
    const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = parseInt(ampmMatch[2], 10);
      const period = ampmMatch[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    // Fallback to 24h format HH:mm
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt((parts[1] || '0').slice(0, 2), 10);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  };

  // Helper function to parse duration from string like "60 phút" to minutes
  const parseDuration = (durationStr: string, extraTime?: number): number => {
    const match = durationStr.match(/(\d+)/);
    const baseDuration = match ? parseInt(match[1]) : 30;
    return baseDuration + (extraTime || 0);
  };

  // Helper function to get display duration including extra time
  const getDisplayDuration = (apt: any): string => {
    const totalMinutes = parseDuration(apt.duration, apt.extraTime);
    return `${totalMinutes} phút`;
  };

  // Helper function to calculate end time from start time and duration
  const timeToEndTime = (startTime: string, durationMinutes: number): string => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Helper function to check if employee is working on this date
  const isEmployeeWorkingOnDate = (employee: any, date: string): boolean => {
    const scheduleStatus = getEmployeeScheduleStatus(employee, new Date(date));
    return scheduleStatus.status !== 'off';
  };

  // Helper function to check if time slot is available for an employee
  const isTimeSlotAvailable = (employee: any, timeSlot: string): boolean => {
    const availability = isEmployeeAvailableAtTime(employee, selectedDate, timeSlot);
    return availability.available;
  };

  // Helper function to get unavailability reason for a time slot
  const getUnavailabilityReason = (employee: any, timeSlot: string): string | undefined => {
    const availability = isEmployeeAvailableAtTime(employee, selectedDate, timeSlot);
    return availability.reason;
  };

  // Helper function to check if an appointment starts at this time slot
  const appointmentStartsAtSlot = (apt: Appointment, timeSlot: string): boolean => {
    const aptStartMinutes = timeToMinutes(apt.time);
    const slotStartMinutes = timeToMinutes(timeSlot);
    return aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotStartMinutes + 15;
  };

  // Memoize expensive calculations to prevent re-renders
  const dayAppointments = useMemo(() => 
    filteredAppointments.filter(apt => apt.date === dateString), 
    [filteredAppointments, dateString]
  );
  
  // Create test data for "Anyone" column if on Aug 6, 2025
  const testAnyoneData = useMemo(() => dateString === "2025-08-06" ? [
    {
      id: 9001, date: "2025-08-06", time: "09:22", customer: "Ngô Thị Linh", phone: "0912345678", 
      service: "Gel Polish + Nail Art", duration: "90 phút", price: "450,000đ", status: "confirmed", staff: "", 
      customerId: "1", serviceId: "1", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9002, date: "2025-08-06", time: "11:36", customer: "Lê Thị Xuân", phone: "0912345679", 
      service: "French Manicure", duration: "75 phút", price: "280,000đ", status: "confirmed", staff: "", 
      customerId: "2", serviceId: "5", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9003, date: "2025-08-06", time: "14:04", customer: "Võ Thị Hường", phone: "0912345680", 
      service: "Manicure + Pedicure", duration: "120 phút", price: "380,000đ", status: "confirmed", staff: "", 
      customerId: "3", serviceId: "2", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9004, date: "2025-08-06", time: "08:30", customer: "Trần Thị Nga", phone: "0912345681", 
      service: "Manicure + Pedicure", duration: "120 phút", price: "380,000đ", status: "confirmed", staff: "", 
      customerId: "4", serviceId: "4", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9005, date: "2025-08-06", time: "10:15", customer: "Phạm Thị Yến", phone: "0912345682", 
      service: "Nail Extension", duration: "150 phút", price: "650,000đ", status: "confirmed", staff: "", 
      customerId: "5", serviceId: "5", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9006, date: "2025-08-06", time: "12:45", customer: "Hoàng Thị Lan", phone: "0912345683", 
      service: "French Manicure", duration: "75 phút", price: "280,000đ", status: "confirmed", staff: "", 
      customerId: "6", serviceId: "6", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9007, date: "2025-08-06", time: "15:20", customer: "Đặng Thị Hoa", phone: "0912345684", 
      service: "Basic Manicure", duration: "60 phút", price: "200,000đ", status: "confirmed", staff: "", 
      customerId: "7", serviceId: "7", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9008, date: "2025-08-06", time: "16:30", customer: "Vũ Thị Minh", phone: "0912345685", 
      service: "Gel Polish + Nail Art", duration: "90 phút", price: "450,000đ", status: "confirmed", staff: "", 
      customerId: "8", serviceId: "8", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9009, date: "2025-08-06", time: "09:00", customer: "Lý Thị Thu", phone: "0912345686", 
      service: "Manicure + Pedicure", duration: "120 phút", price: "380,000đ", status: "confirmed", staff: "", 
      customerId: "9", serviceId: "9", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9010, date: "2025-08-06", time: "13:15", customer: "Bùi Thị Thanh", phone: "0912345687", 
      service: "Nail Extension", duration: "150 phút", price: "650,000đ", status: "confirmed", staff: "", 
      customerId: "10", serviceId: "10", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9011, date: "2025-08-06", time: "17:00", customer: "Đinh Thị Cúc", phone: "0912345688", 
      service: "French Manicure", duration: "75 phút", price: "280,000đ", status: "confirmed", staff: "", 
      customerId: "11", serviceId: "11", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    },
    {
      id: 9012, date: "2025-08-06", time: "07:30", customer: "Cao Thị Đào", phone: "0912345689", 
      service: "Basic Manicure", duration: "60 phút", price: "200,000đ", status: "confirmed", staff: "", 
      customerId: "12", serviceId: "12", staffId: "", notes: "Không yêu cầu nhân viên cụ thể"
    }
  ] : [], [dateString]);
  
  // Memoize appointment calculations
  const allDayAppointments = useMemo(() => 
    [...dayAppointments, ...testAnyoneData], 
    [dayAppointments, testAnyoneData]
  );
  
  const { anyoneAppointments, staffAppointments } = useMemo(() => ({
    anyoneAppointments: allDayAppointments.filter(apt => 
      !apt.staff || apt.staff.trim() === '' || apt.staff.toLowerCase() === 'anyone'
    ),
    staffAppointments: allDayAppointments.filter(apt => 
      apt.staff && apt.staff.trim() !== '' && apt.staff.toLowerCase() !== 'anyone'
    )
  }), [allDayAppointments]);

  // Get appointments for a specific employee and time slot
  const getEmployeeAppointmentsForTimeSlot = (employee: any, timeSlot: string) => {
    const slotStartMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotStartMinutes + 15;
    
    const appointments = staffAppointments.filter(apt => {
      // Only show appointments that are EXACTLY assigned to this specific employee
      // No merged columns - each appointment belongs to only one staff member
      const isExactStaffMatch = apt.staff === employee.name;
      
      if (!isExactStaffMatch) return false;
      
      const aptStartMinutes = timeToMinutes(apt.time);
      const aptDurationMinutes = parseDuration(apt.duration, (apt as any).extraTime);
      const aptEndMinutes = aptStartMinutes + aptDurationMinutes;
      
      // Check if appointment overlaps with this time slot
      return aptStartMinutes < slotEndMinutes && aptEndMinutes > slotStartMinutes;
    });
    
    return appointments;
  };

  // Get appointments for "Anyone" column for a specific time slot (15 minute slots)
  const getAnyoneAppointmentsForHourSlot = (timeSlot: string) => {
    const slotStartMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotStartMinutes + 15; // 15 minute slot
    
    // Show appointments that START within this 15-minute slot only to avoid duplicates
    const appointments = anyoneAppointments
      .filter(apt => {
        const aptStartMinutes = timeToMinutes(apt.time);
        return aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotEndMinutes;
      })
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    
    return appointments;
  };

  // Memoize working employees calculation
  const workingEmployees = useMemo(() => {
    // Get all unique staff names from appointments for this day (excluding empty staff)
    const staffNamesInAppointments = [...new Set(staffAppointments.map(apt => apt.staff))];
    
    // Get employees who have appointments today
    const employeesWithAppointments = staffNamesInAppointments.map((staffName, index) => ({
      id: `virtual-${index}`,
      name: staffName,
      role: "thợ",
      specialties: [],
      hasAppointments: true
    }));

    // Get all service employees who are working today (regardless of appointments)
    const allServiceEmployees = employees.filter(emp => 
      (emp.role === 'thợ chính' || emp.role === 'phụ tá' || emp.role === 'thợ') && 
      isEmployeeWorkingOnDate(emp, dateString)
    );

    // Separate employees who have appointments from those who don't
    const employeesWithoutAppointments = allServiceEmployees
      .filter(emp => !staffNamesInAppointments.includes(emp.name))
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        specialties: emp.specialties || [],
        hasAppointments: false
      }));

    // Combine both groups: employees with appointments first, then without
    const allWorkingEmployees = [...employeesWithAppointments, ...employeesWithoutAppointments];
    
    // Sort employees: those with appointments first, then by name
    const employeesWithData = allWorkingEmployees.map(employee => {
      const employeeAppointments = staffAppointments.filter(apt => 
        apt.staff === employee.name // Use exact matching only
      );
      
      const earliestAppointmentTime = employeeAppointments.length > 0 
        ? Math.min(...employeeAppointments.map(apt => timeToMinutes(apt.time)))
        : Infinity;
      
      return {
        employee,
        appointmentCount: employeeAppointments.length,
        earliestTime: earliestAppointmentTime
      };
    });

    // Sort by: 1) Has appointments (descending), 2) Earliest appointment time (ascending), 3) Name (ascending)
    return employeesWithData
      .sort((a, b) => {
        if (a.appointmentCount !== b.appointmentCount) {
          return b.appointmentCount - a.appointmentCount; // More appointments first
        }
        if (a.appointmentCount > 0) {
          return a.earliestTime - b.earliestTime; // Earlier appointments first
        }
        return a.employee.name.localeCompare(b.employee.name); // Alphabetical for employees without appointments
      })
      .map(item => item.employee);
  }, [employees, staffAppointments, dateString, scheduleUpdateCounter]);

  // Memoize time slots creation (7:00 to 23:45)
  const allTimeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 7; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 23 && minute > 45) break; // Stop at 23:45
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  }, []);

  // Memoize hour slots (7:00 to 23:45)
  const hourSlots = useMemo(() => {
    const slots = [];
    for (let hour = 7; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 23 && minute > 45) break; // Stop at 23:45
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  // Filter working employees based on search query
  const filteredWorkingEmployees = useMemo(() => 
    searchQuery 
      ? workingEmployees.filter(emp => 
          emp.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : workingEmployees,
    [workingEmployees, searchQuery]
  );

  // Filter time slots based on showFullView setting
  const timeSlots = useMemo(() => 
    showFullView 
      ? allTimeSlots 
      : allTimeSlots.filter(timeSlot => {
          const hasAppointment = allDayAppointments.some(apt => {
            const aptStartMinutes = timeToMinutes(apt.time);
            const slotStartMinutes = timeToMinutes(timeSlot);
            const slotEndMinutes = slotStartMinutes + 15;
            return aptStartMinutes < slotEndMinutes && aptStartMinutes + parseDuration(apt.duration, (apt as any).extraTime) > slotStartMinutes;
          });
          
          return hasAppointment;
        }),
    [showFullView, allTimeSlots, allDayAppointments]
  );

  // Optimized drag and drop handlers (minimal DOM operations)
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appointment.id.toString());
    
    // Start drag via zustand (lightweight)
    startDrag(appointment.id);
  };

  const highlightTarget = (el: HTMLElement | null) => {
    if (lastHighlightRef.current && lastHighlightRef.current !== el) {
      lastHighlightRef.current.classList.remove('dnd-target');
    }
    if (el) {
      el.classList.add('dnd-target');
      lastHighlightRef.current = el;
    }
  };

  const clearHighlight = () => {
    if (lastHighlightRef.current) {
      lastHighlightRef.current.classList.remove('dnd-target');
      lastHighlightRef.current = null;
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    highlightTarget(e.currentTarget as HTMLElement);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // If leaving the element entirely, clear highlight
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      (e.currentTarget as HTMLElement).classList.remove('dnd-target');
      if (lastHighlightRef.current === e.currentTarget) lastHighlightRef.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent, targetTime: string, targetStaff?: string) => {
    e.preventDefault();
    // Use global store id to avoid heavy state updates during drag
    if (!draggedAppointmentId || !onAppointmentDrop) {
      clearHighlight();
      return;
    }

    const newStaff = targetStaff === 'Anyone' ? '' : targetStaff;
    onAppointmentDrop(draggedAppointmentId, targetTime, newStaff);

    // Clean up state and visuals
    endDrag();
    clearHighlight();
  };

  const handleDragEnd = (e?: React.DragEvent) => {
    // Clean up visuals
    clearHighlight();
    endDrag();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-blue-200 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base text-gray-800">
              {format(selectedDate, "EEEE, dd/MM/yyyy")}
            </h3>
            <p className="text-sm text-gray-600">
              {dayAppointments.length} lịch hẹn • {anyoneAppointments.length} không chỉ định • {filteredWorkingEmployees.length} nhân viên ({workingEmployees.length} tổng)
            </p>
          </div>
          
          {/* Check-in Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCheckInSidebarOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
          >
            <ClipboardList className="h-4 w-4" />
            Danh sách Check-in
          </Button>
        </div>
      </div>

      {/* Calendar Container with constrained height for internal scrolling */}
      <div className="flex-1 flex flex-col min-h-0 max-h-[calc(100vh-200px)] overflow-hidden">
        {/* Headers Row - Fixed Top */}
        <div className="flex border-b border-gray-200 bg-white z-40 flex-shrink-0">
          {/* Time column header - Fixed left-top corner */}
          <div className="w-20 bg-gray-100 border-r border-gray-200 flex items-center justify-center h-12 flex-shrink-0 z-50">
            <span className="text-xs font-semibold text-gray-700">Giờ</span>
          </div>
          
          {/* Scrollable headers area */}
          <div 
            id="header-scroll"
            className="flex-1 overflow-x-auto scrollbar-hide"
            onScroll={(e) => {
              // Sync horizontal scroll with content
              const contentScrollArea = document.getElementById('content-scroll');
              if (contentScrollArea) {
                contentScrollArea.scrollLeft = e.currentTarget.scrollLeft;
              }
            }}
          >
            <div className="flex min-w-max">
              {/* Anyone column header */}
              <div className="w-36 flex-shrink-0 border-r border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 h-12 flex items-center justify-center">
                <div className="text-center w-full">
                  <div className="text-sm font-bold text-gray-800 truncate leading-tight">
                    Anyone
                  </div>
                  <div className="text-xs text-orange-600 truncate font-medium">
                    {anyoneAppointments.length} lịch hẹn
                  </div>
                </div>
              </div>

              {/* Employee headers */}
              {filteredWorkingEmployees.map((employee) => (
                <div key={employee.id} className="min-w-[144px] max-w-[144px] flex-shrink-0 border-r border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 h-12 flex items-center justify-center">
                  <div className="text-center w-full min-w-0">
                    <div className="flex items-center justify-center gap-1">
                      <div className="text-sm font-bold text-gray-800 truncate leading-tight" title={employee.name}>
                        {employee.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        onClick={() => {
                          setSelectedQuickScheduleEmployee(employee);
                          setIsQuickScheduleDialogOpen(true);
                        }}
                        title="Thiết lập lịch làm việc"
                      >
                        <Settings className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                      </Button>
                    </div>
                    <div className={cn(
                      "text-xs truncate font-medium flex items-center justify-center gap-1",
                      employee.hasAppointments ? "text-blue-600" : "text-gray-500"
                    )} title={`${employee.role} ${!employee.hasAppointments ? "(trống)" : ""}`}>
                      {employee.role} {!employee.hasAppointments && "(trống)"}
                      {(() => {
                        const scheduleStatus = getEmployeeScheduleStatus(employee, selectedDate);
                        if (scheduleStatus.status === 'off') {
                          return <span title="Nghỉ"><Ban className="w-3 h-3 text-red-500" /></span>;
                        } else if (scheduleStatus.status === 'partial') {
                          return <span title={scheduleStatus.details}><Clock className="w-3 h-3 text-orange-500" /></span>;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area with Synchronized Scroll */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Time column - Fixed left with vertical scroll */}
          <div className="w-20 bg-gray-50 border-r border-gray-200 flex-shrink-0 z-30 shadow-sm">
            <div 
              id="time-scroll"
              className="h-full overflow-y-auto scrollbar-hide" 
              style={{ maxHeight: 'calc(100vh - 250px)' }}
              onScroll={(e) => {
                // Sync vertical scroll with content
                const contentScrollArea = document.getElementById('content-scroll');
                if (contentScrollArea) {
                  contentScrollArea.scrollTop = e.currentTarget.scrollTop;
                }
              }}
            >
              {timeSlots.map((timeSlot) => (
                <div 
                  key={timeSlot} 
                  className="h-14 p-2 border-b border-gray-200 text-xs text-gray-700 font-semibold flex items-center justify-center bg-gray-50"
                >
                  {timeSlot}
                </div>
              ))}
            </div>
          </div>

          {/* Main scrollable content area - Both horizontal and vertical scroll */}
          <div 
            id="content-scroll"
            className="flex-1 overflow-auto"
            style={{ 
              maxHeight: 'calc(100vh - 250px)'
            }}
            onScroll={(e) => {
              // Sync horizontal scroll with header
              const headerScrollArea = document.getElementById('header-scroll');
              if (headerScrollArea) {
                headerScrollArea.scrollLeft = e.currentTarget.scrollLeft;
              }
              
              // Sync vertical scroll with time column
              const timeScrollArea = document.getElementById('time-scroll');
              if (timeScrollArea) {
                timeScrollArea.scrollTop = e.currentTarget.scrollTop;
              }
            }}
          >
            <div className="flex min-w-max">
              {/* Anyone column */}
              <div className="flex-shrink-0 border-r border-gray-200 w-36">
                {/* Time slots for Anyone column */}
                {hourSlots.map((hourSlot) => {
                  const slotAppointments = getAnyoneAppointmentsForHourSlot(hourSlot);
                  const displayAppointment = slotAppointments[0];
                  const remainingCount = slotAppointments.length - 1;

                  const handleMoreClick = () => {
                    setSelectedTimeSlot(hourSlot);
                    setSelectedSlotAppointments(slotAppointments);
                    setIsAnyonePopupOpen(true);
                  };

                   return (
                     <div 
                       key={`anyone-hour-${hourSlot}`} 
                       className={cn(
                         "h-14 border-b border-gray-200 bg-white relative p-1 transition-colors duration-75 select-none hover:bg-orange-50"
                        )}
                        // TEMPORARILY DISABLED - Drag and drop
                        // onDragEnter={isDragEnabled ? handleDragEnter : undefined}
                        // onDragOver={isDragEnabled ? handleDragOver : undefined}
                        // onDragLeave={isDragEnabled ? handleDragLeave : undefined}
                        // onDrop={isDragEnabled ? (e) => handleDrop(e, hourSlot, 'Anyone') : undefined}
                     >
                      {displayAppointment ? (
                        <div className="space-y-1">
                          {/* First appointment */}
                             <div
                               className={cn(
                                 "rounded-md p-1 cursor-pointer hover:shadow-md transition-colors text-xs relative border",
                                 appointmentColors.anyone,
                                 // TEMPORARILY DISABLED - Drag visual feedback
                                 // draggedAppointmentId === displayAppointment.id && "opacity-60 transform scale-95"
                               )}
                               // TEMPORARILY DISABLED - Draggable behavior
                               // draggable={isDragEnabled}
                               // onDragStart={isDragEnabled ? (e) => handleDragStart(e, displayAppointment) : undefined}
                               // onDragEnd={isDragEnabled ? handleDragEnd : undefined}
                             onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               handleAppointmentClick(displayAppointment, e);
                             }}
                           >
                            <div className="font-semibold text-orange-800 text-xs">
                              {displayAppointment.time}
                            </div>
                            <div className="font-bold text-gray-800 truncate">
                              {displayAppointment.customer}
                            </div>
                            <div className="text-orange-700 truncate text-xs">
                              {displayAppointment.service}
                            </div>
                          </div>

                          {/* Show more button if there are additional appointments */}
                          {remainingCount > 0 && (
                            <button
                              onClick={handleMoreClick}
                              className="w-full bg-orange-50 border border-orange-200 rounded-md p-1 text-xs text-orange-600 hover:bg-orange-100 transition-colors"
                            >
                              +{remainingCount} lịch hẹn khác
                            </button>
                          )}
                        </div>
                       ) : (
                         <div className="text-center text-orange-400 text-xs py-4">
                           Trống
                         </div>
                       )}
                     </div>
                  );
                })}
              </div>

              {/* Employee columns */}
              {filteredWorkingEmployees.length === 0 && anyoneAppointments.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-8 text-gray-500">
                  {searchQuery ? "Không tìm thấy nhân viên nào" : "Không có nhân viên nào làm việc hôm nay"}
                </div>
              ) : (
                filteredWorkingEmployees.map((employee) => (
                  <div key={employee.id} className="min-w-[144px] max-w-[144px] flex-shrink-0 border-r border-gray-200">
                     {/* Time slots for this employee */}
                    {timeSlots.map((timeSlot) => {
                      const employeeAppointments = getEmployeeAppointmentsForTimeSlot(employee, timeSlot);
                      const startingAppointments = employeeAppointments.filter(apt => 
                        appointmentStartsAtSlot(apt, timeSlot)
                      );

                      // Check if employee is available at this time
                      const availability = isEmployeeAvailableAtTime(employee, selectedDate, timeSlot);

                      const handleTimeSlotClick = () => {
                        if (onTimeSlotClick && startingAppointments.length === 0 && availability.available) {
                          onTimeSlotClick(dateString, timeSlot, employee.name);
                        }
                      };
                      
                        return (
                          <div 
                            key={`${employee.id}-${timeSlot}-${scheduleUpdateCounter}`}
                            className={cn(
                              "h-14 border-b border-gray-200 relative p-1 transition-colors duration-75 select-none",
                              !availability.available 
                                ? "bg-gray-200 cursor-not-allowed opacity-60" 
                                : startingAppointments.length === 0 
                                  ? "bg-white hover:bg-blue-50 cursor-pointer" 
                                  : "bg-white hover:bg-gray-50"
                            )}
                            onClick={handleTimeSlotClick}
                            // TEMPORARILY DISABLED - Drag and drop
                            // onDragEnter={isDragEnabled ? handleDragEnter : undefined}
                            // onDragOver={isDragEnabled ? handleDragOver : undefined}
                            // onDragLeave={isDragEnabled ? handleDragLeave : undefined}
                            // onDrop={isDragEnabled ? (e) => handleDrop(e, timeSlot, employee.name) : undefined}
                           title={!availability.available ? availability.reason : ""}
                         >
                          {/* Show blocked time indicator if not available */}
                          {!availability.available && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-300/90 rounded border-2 border-red-200">
                              <div className="flex flex-col items-center gap-1">
                                <Ban className="w-5 h-5 text-red-600" />
                                <span className="text-xs text-red-700 font-semibold text-center px-1">
                                  BLOCK
                                </span>
                                <span className="text-xs text-red-600 text-center px-1">
                                  {availability.reason}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {startingAppointments.map((apt, aptIndex) => {
                             const durationMinutes = parseDuration(apt.duration, (apt as any).extraTime);
                             const slotsSpanned = Math.ceil(durationMinutes / 15);
                             const heightInPixels = slotsSpanned * 56 - 4; // 56px per 15-min slot (h-14) minus border
                            
                             // Use dynamic color based on assignment type from settings
                             const getAppointmentColor = () => {
                               if (apt.status === 'cancelled') return 'bg-red-100 border-red-300 text-red-800';
                               if (apt.status === 'completed') return 'bg-green-100 border-green-300 text-green-800';
                               
                               // For confirmed appointments, use color based on assignment type from settings
                               const assignmentType = (apt as any).assignmentType;
                               if (assignmentType === 'anyone' || apt.staff === 'Bất kì') {
                                 return appointmentColors.anyone;
                               } else if (assignmentType === 'reassigned-from-anyone') {
                                 return appointmentColors.reassigned;
                               } else {
                                 return appointmentColors.preAssigned;
                               }
                             };
                            
                             return (
                                <div
                                  key={`${apt.id}-${aptIndex}`}
                                    className={cn(
                                      "absolute border rounded-md p-1 cursor-pointer transition-colors text-xs overflow-hidden select-none",
                                      getAppointmentColor(),
                                      // TEMPORARILY DISABLED - Drag visual feedback
                                      // draggedAppointmentId === apt.id && "opacity-90 transform scale-105 shadow-2xl"
                                    )}
                                  style={{
                                    top: '2px',
                                    left: `${aptIndex * 50}%`,
                                    width: startingAppointments.length > 1 ? '48%' : '96%',
                                    height: `${heightInPixels}px`,
                                    minHeight: '50px',
                                    zIndex: draggedAppointmentId === apt.id ? 50 : 10
                                  }}
                                   draggable={isDragEnabled}
                                   onDragStart={isDragEnabled ? (e) => handleDragStart(e, apt) : undefined}
                                   onDragEnd={isDragEnabled ? handleDragEnd : undefined}
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleAppointmentClick(apt, e);
                                   }}
                                 >
                                   {/* Staff icon in top right if staff is assigned */}
                                   {apt.staff && apt.staff !== "Bất kì" && apt.staff !== "" && apt.staff !== "undefined" && (
                                     <div className="absolute top-0.5 right-0.5 bg-blue-600 rounded-full p-1 shadow-sm z-10">
                                       <UserCheck className="w-2.5 h-2.5 text-white" />
                                     </div>
                                   )}
                                  <div className="font-bold truncate">
                                    {apt.customer}
                                  </div>
                                  <div className="truncate text-xs opacity-90">
                                    {apt.service}
                                  </div>
                                  <div className="text-xs opacity-80">
                                    {apt.time}
                                  </div>
                                  {durationMinutes >= 60 && (
                                    <div className="text-xs opacity-75">
                                      {getDisplayDuration(apt)}
                                    </div>
                                  )}
                                </div>
                             );
                          })}
                         </div>
                       );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CheckIn Sidebar */}
      <CheckInSidebar
        isOpen={isCheckInSidebarOpen}
        onClose={() => setIsCheckInSidebarOpen(false)}
        selectedDate={selectedDate}
        onAppointmentCreated={onAppointmentCreated}
      />

      {/* Employee Schedule Dialog */}
      {selectedEmployee && (
        <EmployeeScheduleDialog
          isOpen={isScheduleDialogOpen}
          onClose={() => {
            setIsScheduleDialogOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          selectedDate={selectedDate}
          onScheduleUpdate={handleScheduleUpdate}
        />
      )}

      {/* Quick Schedule Dialog */}
      {selectedQuickScheduleEmployee && (
        <QuickScheduleDialog
          isOpen={isQuickScheduleDialogOpen}
          onClose={() => {
            setIsQuickScheduleDialogOpen(false);
            setSelectedQuickScheduleEmployee(null);
          }}
          employee={selectedQuickScheduleEmployee}
          selectedDate={selectedDate}
          onScheduleUpdate={handleScheduleUpdate}
        />
      )}

      {/* Anyone Appointments Popup */}
      <Dialog open={isAnyonePopupOpen} onOpenChange={setIsAnyonePopupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Lịch hẹn tại {selectedTimeSlot}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedSlotAppointments.map((apt) => (
              <div
                key={apt.id}
                className={cn(
                  "p-3 border rounded-md cursor-pointer hover:shadow-md transition-colors",
                  appointmentColors.anyone
                )}
                onClick={(e) => handleAppointmentClick(apt, e)}
              >
                <div className="font-semibold">{apt.time} - {apt.customer}</div>
                <div className="text-sm text-gray-600">{apt.service}</div>
                <div className="text-xs text-gray-500">{apt.phone}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}