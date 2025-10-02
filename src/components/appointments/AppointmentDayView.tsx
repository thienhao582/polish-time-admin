import { format } from "date-fns";
import { useSalonStore } from "@/stores/useSalonStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { formatTimeRange } from "@/utils/timeUtils";
import { isEmployeeAvailableAtTime, getEmployeeScheduleStatus } from "@/utils/scheduleUtils";
import { cn } from "@/lib/utils";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useDragStore } from "@/stores/useDragStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCheck, ClipboardList, Clock, Ban, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckInSidebar } from "./CheckInSidebar";
import { EmployeeScheduleDialog } from "./EmployeeScheduleDialog";
import { QuickScheduleDialog } from "./QuickScheduleDialog";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  // Loading state for initial mount and calculations
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCalculatingAvailability, setIsCalculatingAvailability] = useState(false);
  
  // Calculated data states
  const [calculatedData, setCalculatedData] = useState<{
    workingEmployees: any[];
    filteredWorkingEmployees: any[];
    dayAppointments: any[];
    testAnyoneData: any[];
    allDayAppointments: any[];
    anyoneAppointments: any[];
    staffAppointments: any[];
    allTimeSlots: string[];
    hourSlots: string[];
    timeSlots: string[];
    employeeAvailability: Map<string, { available: boolean; reason?: string }>;
  } | null>(null);

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

  // Helper function to check if time slot is available for an employee (will use calculated data)
  const isTimeSlotAvailable = (employee: any, timeSlot: string): boolean => {
    if (!calculatedData) return true;
    const key = `${employee.id}-${timeSlot}`;
    return calculatedData.employeeAvailability.get(key)?.available ?? true;
  };

  // Helper function to get unavailability reason for a time slot (will use calculated data)
  const getUnavailabilityReason = (employee: any, timeSlot: string): string | undefined => {
    if (!calculatedData) return undefined;
    const key = `${employee.id}-${timeSlot}`;
    return calculatedData.employeeAvailability.get(key)?.reason;
  };

  // Helper function to check if an appointment starts at this time slot
  const appointmentStartsAtSlot = (apt: Appointment, timeSlot: string): boolean => {
    const aptStartMinutes = timeToMinutes(apt.time);
    const slotStartMinutes = timeToMinutes(timeSlot);
    return aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotStartMinutes + 15;
  };

  const handleTimeSlotClick = useCallback((dateString, timeSlot, employeeName) => {
    if (onTimeSlotClick) onTimeSlotClick(dateString, timeSlot, employeeName);
  }, [onTimeSlotClick]);

  // Get appointments for a specific employee and time slot
  const getEmployeeAppointmentsForTimeSlot = (employee: any, timeSlot: string) => {
    if (!calculatedData) return [];
    const slotStartMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotStartMinutes + 15;
    
    const appointments = calculatedData.staffAppointments.filter(apt => {
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
    if (!calculatedData) return [];
    const slotStartMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotStartMinutes + 15; // 15 minute slot
    
    // Show appointments that START within this 15-minute slot only to avoid duplicates
    const appointments = calculatedData.anyoneAppointments
      .filter(apt => {
        const aptStartMinutes = timeToMinutes(apt.time);
        return aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotEndMinutes;
      })
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    
    return appointments;
  };

  const availabilityCache = useRef(
    new Map<
      string, // `${emp.id}-${dateString}-${scheduleUpdateCounter}`
      Map<string, { available: boolean; reason?: string }>
    >()
  );

  // Effect to handle all heavy calculations after initial render
  useEffect(() => {
    const calculateData = async () => {
      // Show loading immediately for recalculations
      if (calculatedData) {
        setIsCalculatingAvailability(true);
      }

      // Delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50));

      // All time slots (7:00 to 23:45)
      const allTimeSlots = [];
      for (let hour = 7; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          if (hour === 23 && minute > 45) break; // Stop at 23:45
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          allTimeSlots.push(timeString);
        }
      }

      // Hour slots (same as allTimeSlots for this component)
      const hourSlots = [...allTimeSlots];

      // Day appointments
      const dayAppointments = filteredAppointments.filter(apt => apt.date === dateString);
      
      // Create test data for "Anyone" column if on Aug 6, 2025
      const testAnyoneData = dateString === "2025-08-06" ? [
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
      ] : [];
      
      // Appointment calculations
      const allDayAppointments = [...dayAppointments, ...testAnyoneData];
      
      const anyoneAppointments = allDayAppointments.filter(apt => 
        !apt.staff || apt.staff.trim() === '' || apt.staff.toLowerCase() === 'anyone' || apt.staff === 'Bất kì'
      );
      
      const staffAppointments = allDayAppointments.filter(apt => 
        apt.staff && apt.staff.trim() !== '' && apt.staff.toLowerCase() !== 'anyone' && apt.staff !== 'Bất kì'
      );

      // Working employees calculation
      const staffNamesInAppointments = [...new Set(staffAppointments.map(apt => apt.staff))];
      
      const employeesWithAppointments = staffNamesInAppointments.map((staffName, index) => ({
        id: `virtual-${index}`,
        name: staffName,
        role: "thợ",
        specialties: [],
        hasAppointments: true
      }));

      const allServiceEmployees = employees.filter(emp => 
        (emp.role === 'thợ chính' || emp.role === 'phụ tá' || emp.role === 'thợ') && 
        isEmployeeWorkingOnDate(emp, dateString)
      );

      const employeesWithoutAppointments = allServiceEmployees
        .filter(emp => !staffNamesInAppointments.includes(emp.name))
        .map(emp => ({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          specialties: emp.specialties || [],
          hasAppointments: false
        }));

      const allWorkingEmployees = [...employeesWithAppointments, ...employeesWithoutAppointments];
      
      const employeesWithData = allWorkingEmployees.map(employee => {
        const employeeAppointments = staffAppointments.filter(apt => 
          apt.staff === employee.name
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

      const workingEmployees = employeesWithData
        .sort((a, b) => {
          if (a.appointmentCount !== b.appointmentCount) {
            return b.appointmentCount - a.appointmentCount;
          }
          if (a.appointmentCount > 0) {
            return a.earliestTime - b.earliestTime;
          }
          return a.employee.name.localeCompare(b.employee.name);
        })
        .map(item => item.employee);

      // Filter working employees based on search query
      const filteredWorkingEmployees = searchQuery 
        ? workingEmployees.filter(emp => 
            emp.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : workingEmployees;

      // Employee availability calculation
      const employeeAvailability = new Map<string, { available: boolean; reason?: string }>();

      for (const emp of filteredWorkingEmployees) {
        const cacheKey = `${emp.id}-${dateString}-${scheduleUpdateCounter}`;
        let slotMap = availabilityCache.current.get(cacheKey);

        if (!slotMap) {
          slotMap = new Map<string, { available: boolean; reason?: string }>();
          for (const slot of allTimeSlots) {
            const value = isEmployeeAvailableAtTime(emp, selectedDate, slot);
            slotMap.set(slot, value);
            employeeAvailability.set(`${emp.id}-${slot}`, value);
          }
          availabilityCache.current.set(cacheKey, slotMap);
        } else {
          for (const [slot, value] of slotMap) {
            employeeAvailability.set(`${emp.id}-${slot}`, value);
          }
        }
      }

      // Filter time slots based on showFullView setting
      const timeSlots = showFullView 
        ? allTimeSlots 
        : allTimeSlots.filter(timeSlot => {
            const hasAppointment = allDayAppointments.some(apt => {
              const aptStartMinutes = timeToMinutes(apt.time);
              const slotStartMinutes = timeToMinutes(timeSlot);
              const slotEndMinutes = slotStartMinutes + 15;
              return aptStartMinutes < slotEndMinutes && aptStartMinutes + parseDuration(apt.duration, (apt as any).extraTime) > slotStartMinutes;
            });
            
            return hasAppointment;
          });

      // Set calculated data
      setCalculatedData({
        workingEmployees,
        filteredWorkingEmployees,
        dayAppointments,
        testAnyoneData,
        allDayAppointments,
        anyoneAppointments,
        staffAppointments,
        allTimeSlots,
        hourSlots,
        timeSlots,
        employeeAvailability
      });

      setIsInitialLoading(false);
      setIsCalculatingAvailability(false);
    };

    calculateData();
  }, [
    dateString, 
    filteredAppointments, 
    employees, 
    selectedDate, 
    scheduleUpdateCounter, 
    showFullView, 
    searchQuery
  ]);

  // Show initial loading screen
  if (isInitialLoading || !calculatedData) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-blue-200 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        {/* Loading Calendar */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">Đang tải lịch làm việc...</p>
              <p className="text-sm text-gray-500">Xin chờ trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Optimized drag and drop handlers (minimal DOM operations)
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appointment.id.toString());
    
    // Start drag via zustand (lightweight)
    startDrag(appointment.id);
  };

  const clearHighlight = () => {
    if (lastHighlightRef.current) {
      lastHighlightRef.current.classList.remove('bg-blue-100', 'border-blue-300');
      lastHighlightRef.current = null;
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    const target = e.currentTarget as HTMLElement;
    if (target !== lastHighlightRef.current) {
      clearHighlight();
      target.classList.add('bg-blue-100', 'border-blue-300');
      lastHighlightRef.current = target;
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      clearHighlight();
    }
  };

  const handleDrop = (e: React.DragEvent, targetTime: string, targetStaff?: string) => {
    e.preventDefault();
    clearHighlight();
    
    const appointmentId = parseInt(e.dataTransfer.getData('text/plain'));
    if (onAppointmentDrop && appointmentId) {
      onAppointmentDrop(appointmentId, targetTime, targetStaff);
    }
    
    endDrag();
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
              {calculatedData.dayAppointments.length} lịch hẹn • {calculatedData.anyoneAppointments.length} không chỉ định • {calculatedData.filteredWorkingEmployees.length} nhân viên ({calculatedData.workingEmployees.length} tổng)
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
      <div className="flex-1 flex flex-col min-h-0 max-h-[calc(100vh-200px)] w-full min-w-0 overflow-hidden">
        {/* Headers Row - Fixed Top */}
        <div className="flex border-b border-gray-200 bg-white z-40 flex-shrink-0">
          {/* Time column header - Fixed left-top corner */}
          <div className="w-20 bg-gray-100 border-r border-gray-200 flex items-center justify-center h-12 flex-shrink-0 z-50">
            <span className="text-xs font-semibold text-gray-700">Giờ</span>
          </div>
          
          {/* Scrollable headers area */}
          <div 
            id="header-scroll"
            className="flex-1 overflow-x-hidden"
            style={{ overflowY: 'hidden' }}
          >
            <div className="flex min-w-max">
              {/* Anyone column header */}
              <div className="w-36 flex-shrink-0 border-r border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 h-12 flex items-center justify-center">
                <div className="text-center w-full">
                  <div className="text-sm font-bold text-gray-800 truncate leading-tight">
                    Bất kì
                  </div>
                  <div className="text-xs text-gray-600 truncate leading-tight">
                    {calculatedData.anyoneAppointments.length} lịch hẹn
                  </div>
                </div>
              </div>

              {/* Employee headers */}
              {calculatedData.filteredWorkingEmployees.map((employee) => (
                <div key={`header-${employee.id}`} className="w-40 flex-shrink-0 border-r border-gray-200 bg-blue-50 h-12 flex flex-col items-center justify-center relative">
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-1 px-1">
                      <div className="text-sm font-bold text-gray-800 truncate leading-tight flex-1" title={employee.name}>
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
              className="h-full overflow-y-hidden" 
              style={{ maxHeight: 'calc(100vh - 250px)', overflowX: 'hidden' }}
            >
              {calculatedData.timeSlots.map((timeSlot) => (
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
            className="flex-1 overflow-auto relative"
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
            {/* Loading overlay */}
            {isCalculatingAvailability && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Đang tính toán lịch làm việc...</p>
                    <p className="text-xs text-gray-500">Xin chờ trong giây lát</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex min-w-max">
              {/* Anyone column */}
              <div className="flex-shrink-0 border-r border-gray-200 w-36">
                {/* Time slots for Anyone column */}
                {calculatedData.hourSlots.map((hourSlot) => {
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
                        // onDrop={isDragEnabled ? (e) => handleDrop(e, hourSlot, "anyone") : undefined}
                        onClick={() => handleTimeSlotClick(dateString, hourSlot, "Bất kì")}
                      >
                         {displayAppointment && (
                           <div
                             className={cn(
                               "absolute inset-1 border rounded-md p-1 cursor-pointer transition-colors text-xs overflow-hidden select-none",
                               (() => {
                                 const status = displayAppointment.status?.toLowerCase() || 'confirmed';
                                 switch (status) {
                                   case 'confirmed':
                                     return 'bg-[hsl(var(--status-confirmed-bg))] border-[hsl(var(--status-confirmed-border))] text-[hsl(var(--status-confirmed))]';
                                   case 'in-progress':
                                     return 'bg-[hsl(var(--status-in-progress-bg))] border-[hsl(var(--status-in-progress-border))] text-[hsl(var(--status-in-progress))]';
                                   case 'completed':
                                     return 'bg-[hsl(var(--status-completed-bg))] border-[hsl(var(--status-completed-border))] text-[hsl(var(--status-completed))]';
                                   case 'cancelled':
                                     return 'bg-[hsl(var(--status-cancelled-bg))] border-[hsl(var(--status-cancelled-border))] text-[hsl(var(--status-cancelled))]';
                                   case 'pending':
                                     return 'bg-[hsl(var(--status-pending-bg))] border-[hsl(var(--status-pending-border))] text-[hsl(var(--status-pending))]';
                                   default:
                                     return 'bg-[hsl(var(--status-confirmed-bg))] border-[hsl(var(--status-confirmed-border))] text-[hsl(var(--status-confirmed))]';
                                 }
                               })()
                             )}
                             onClick={(e) => {
                               e.stopPropagation();
                               handleAppointmentClick(displayAppointment, e);
                             }}
                           >
                            <div className="font-semibold leading-tight truncate">
                              {displayAppointment.customer}
                            </div>
                            <div className="text-xs leading-tight truncate">
                              {formatTimeRange(displayAppointment.time, displayAppointment.duration)}
                            </div>
                            <div className="text-xs leading-tight truncate">
                              {displayAppointment.service}
                            </div>
                          </div>
                        )}
                        
                        {remainingCount > 0 && (
                          <div 
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoreClick();
                            }}
                            title={`Còn ${remainingCount} lịch hẹn khác`}
                          >
                            +{remainingCount}
                          </div>
                        )}
                      </div>
                   );
                })}
              </div>

              {/* Employee columns */}
              {calculatedData.filteredWorkingEmployees.map((employee) => (
                <div key={`column-${employee.id}`} className="flex-shrink-0 border-r border-gray-200 w-40">
                  {calculatedData.timeSlots.map((timeSlot) => {
                    const employeeAppointments = getEmployeeAppointmentsForTimeSlot(employee, timeSlot);
                    
                    // Detect appointments that start at this exact time slot
                    const startingAppointments = employeeAppointments.filter(apt => 
                      appointmentStartsAtSlot(apt, timeSlot)
                    );

                    // Get pre-calculated availability
                    const key = `${employee.id}-${timeSlot}`;
                    const availability = calculatedData.employeeAvailability.get(key) || { available: true };

                      return (
                        <div 
                          key={`${employee.id}-${timeSlot}-${scheduleUpdateCounter}`}
                          className={cn(
                            "h-14 border-b border-gray-200 relative p-1 transition-colors duration-75 select-none",
                            !availability.available 
                              ? "bg-gray-200 cursor-not-allowed opacity-60" 
                              : startingAppointments.length === 0 
                                ? "bg-white hover:bg-blue-50 cursor-pointer" 
                                : "bg-white"
                          )}
                          onDragEnter={isDragEnabled && availability.available ? handleDragEnter : undefined}
                          onDragOver={isDragEnabled && availability.available ? handleDragOver : undefined}
                          onDragLeave={isDragEnabled && availability.available ? handleDragLeave : undefined}
                          onDrop={isDragEnabled && availability.available ? (e) => handleDrop(e, timeSlot, employee.name) : undefined}
                          onClick={availability.available ? () => handleTimeSlotClick(dateString, timeSlot, employee.name) : undefined}
                          title={!availability.available ? availability.reason : undefined}
                        >
                          {/* Show appointments that start at this time slot */}
                          {startingAppointments.map((apt, aptIndex) => {
                            const aptStartMinutes = timeToMinutes(apt.time);
                            const slotStartMinutes = timeToMinutes(timeSlot);
                            const relativeStart = aptStartMinutes - slotStartMinutes; // Minutes from slot start
                            const durationMinutes = parseDuration(apt.duration, (apt as any).extraTime);
                            
                            // Calculate height (1 slot = 14px height = 15 minutes)
                            const pixelsPerMinute = 14 / 15;
                            const height = Math.max(14, durationMinutes * pixelsPerMinute); // Minimum 1 slot height
                            const topOffset = relativeStart * pixelsPerMinute;

                            // Determine appointment color based on status
                            const getAppointmentColor = () => {
                              const status = apt.status?.toLowerCase() || 'confirmed';
                              
                              switch (status) {
                                case 'confirmed':
                                  return 'bg-[hsl(var(--status-confirmed-bg))] border-[hsl(var(--status-confirmed-border))] text-[hsl(var(--status-confirmed))]';
                                case 'in-progress':
                                  return 'bg-[hsl(var(--status-in-progress-bg))] border-[hsl(var(--status-in-progress-border))] text-[hsl(var(--status-in-progress))]';
                                case 'completed':
                                  return 'bg-[hsl(var(--status-completed-bg))] border-[hsl(var(--status-completed-border))] text-[hsl(var(--status-completed))]';
                                case 'cancelled':
                                  return 'bg-[hsl(var(--status-cancelled-bg))] border-[hsl(var(--status-cancelled-border))] text-[hsl(var(--status-cancelled))]';
                                case 'pending':
                                  return 'bg-[hsl(var(--status-pending-bg))] border-[hsl(var(--status-pending-border))] text-[hsl(var(--status-pending))]';
                                default:
                                  return 'bg-[hsl(var(--status-confirmed-bg))] border-[hsl(var(--status-confirmed-border))] text-[hsl(var(--status-confirmed))]';
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
                                      top: `${topOffset}px`,
                                      height: `${height}px`,
                                      left: '4px',
                                      right: '4px',
                                      zIndex: 10
                                    }}
                                    draggable={isDragEnabled}
                                    onDragStart={isDragEnabled ? (e) => handleDragStart(e, apt) : undefined}
                                    onDragEnd={isDragEnabled ? handleDragEnd : undefined}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAppointmentClick(apt, e);
                                    }}
                                >
                                  <div className="font-semibold leading-tight truncate text-xs">
                                    {apt.customer}
                                  </div>
                                  <div className="text-xs leading-tight truncate">
                                    {formatTimeRange(apt.time, getDisplayDuration(apt))}
                                  </div>
                                  <div className="text-xs leading-tight truncate">
                                    {apt.service}
                                  </div>
                                  {(apt as any).extraTime && (apt as any).extraTime > 0 && (
                                    <div className="text-xs leading-tight truncate font-medium text-red-600">
                                      +{(apt as any).extraTime} phút
                                    </div>
                                  )}
                                </div>
                              );
                          })}
                        </div>
                      );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Sidebar */}
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
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  handleAppointmentClick(apt, e);
                  setIsAnyonePopupOpen(false);
                }}
              >
                <div className="font-semibold text-sm">{apt.customer}</div>
                <div className="text-xs text-gray-600">{apt.phone}</div>
                <div className="text-xs text-gray-600">{apt.service}</div>
                <div className="text-xs text-gray-600">
                  {formatTimeRange(apt.time, apt.duration)} • {apt.price}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
