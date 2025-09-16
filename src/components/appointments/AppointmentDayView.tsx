import { format } from "date-fns";
import { useSalonStore } from "@/stores/useSalonStore";
import { formatTimeRange } from "@/utils/timeUtils";
import { isEmployeeAvailableAtTime, getEmployeeScheduleStatus } from "@/utils/scheduleUtils";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCheck, ClipboardList, Clock, Ban, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckInSidebar } from "./CheckInSidebar";
import { EmployeeScheduleDialog } from "./EmployeeScheduleDialog";

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
  onScheduleUpdate
}: AppointmentDayViewProps) {
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { employees, timeRecords } = useSalonStore();
  
  // State for anyone appointments popup
  const [isAnyonePopupOpen, setIsAnyonePopupOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedSlotAppointments, setSelectedSlotAppointments] = useState<any[]>([]);
  
  // State for check-in sidebar
  const [isCheckInSidebarOpen, setIsCheckInSidebarOpen] = useState(false);
  
  // State for employee schedule dialog
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // Filter appointments for the selected day
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
  
  // Combine real appointments with test data
  const allDayAppointments = [...dayAppointments, ...testAnyoneData];
  
  // Separate appointments with and without specific staff
  const anyoneAppointments = allDayAppointments.filter(apt => 
    !apt.staff || apt.staff.trim() === '' || apt.staff.toLowerCase() === 'anyone'
  );
  const staffAppointments = allDayAppointments.filter(apt => 
    apt.staff && apt.staff.trim() !== '' && apt.staff.toLowerCase() !== 'anyone'
  );
  
  console.log("AppointmentDayView Debug:", {
    dateString,
    totalFiltered: filteredAppointments.length,
    dayAppointments: dayAppointments.length,
    testAnyoneData: testAnyoneData.length,
    allDayAppointments: allDayAppointments.length,
    anyoneAppointments: anyoneAppointments.length,
    staffAppointments: staffAppointments.length,
    sampleAnyoneAppt: anyoneAppointments[0],
    allStaffNames: allDayAppointments.map(apt => `"${apt.staff}"`),
    uniqueStaffNames: [...new Set(allDayAppointments.map(apt => apt.staff))]
  });

  // Helper function to check if employee is working on this date
  const isEmployeeWorkingOnDate = (employee: any, date: string): boolean => {
    const dayOfWeek = format(new Date(date), 'EEEE').toLowerCase();
    
    // Check time records for this employee on this date
    const employeeTimeRecords = timeRecords.filter(record => 
      record.employeeId === employee.id && record.date === date
    );
    
    // If there are time records, employee is working
    if (employeeTimeRecords.length > 0) {
      return true;
    }
    
    // Fallback: assume service staff (thợ) are working by default
    // You can enhance this logic based on your work schedule system
    return employee.role === 'thợ' || employee.role === 'thợ chính' || employee.role === 'phụ tá' || employee.role === 'service';
  };

  // Get working employees for this date (including those without appointments)
  const getWorkingEmployees = () => {
    // Get all unique staff names from appointments for this day (excluding empty staff)
    const staffNamesInAppointments = [...new Set(staffAppointments.map(apt => apt.staff))];
    
    console.log("Staff names in appointments:", staffNamesInAppointments);
    console.log("Available employees:", employees.slice(0, 10).map(e => ({ id: e.id, name: e.name, role: e.role, workSchedule: e.workSchedule ? 'HAS_SCHEDULE' : 'NO_SCHEDULE' })));
    console.log("Anyone appointments count:", anyoneAppointments.length);
    
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

    console.log("Final employees for day view:", allWorkingEmployees.map(e => ({ name: e.name, hasAppointments: e.hasAppointments })));
    
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

    console.log("Working employees debug:", {
      totalEmployees: employees.length,
      allServiceEmployees: allServiceEmployees.length,
      dayAppointments: dayAppointments.length,
      staffNamesInAppointments: staffNamesInAppointments.length,
      employeesWithAppointments: employeesWithAppointments.length,
      employeesWithoutAppointments: employeesWithoutAppointments.length,
      totalWorkingEmployees: allWorkingEmployees.length,
      employeeNames: allWorkingEmployees.map(e => e.name)
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
  };

  // Create time slots from 8 AM to 9 PM
  const allTimeSlots = [];
  for (let hour = 8; hour <= 21; hour++) {
    allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

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

  // Helper function to convert time string to minutes since midnight
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
  // Helper function to calculate end time from start time and duration
  const timeToEndTime = (startTime: string, durationMinutes: number): string => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Get appointments for a specific employee and time slot
  const getEmployeeAppointmentsForTimeSlot = (employee: any, timeSlot: string) => {
    const slotStartMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotStartMinutes + 30;
    
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

  // Get appointments for "Anyone" column for a specific time slot (1 hour slots)
  const getAnyoneAppointmentsForHourSlot = (timeSlot: string) => {
    const slotStartMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotStartMinutes + 60; // 1 hour slot
    
    // Show appointments that START within this hour only to avoid duplicates across hours
    const appointments = anyoneAppointments
      .filter(apt => {
        const aptStartMinutes = timeToMinutes(apt.time);
        return aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotEndMinutes;
      })
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    
    return appointments;
  };

  // Check if an appointment starts at this time slot
  const appointmentStartsAtSlot = (apt: Appointment, timeSlot: string): boolean => {
    const aptStartMinutes = timeToMinutes(apt.time);
    const slotStartMinutes = timeToMinutes(timeSlot);
    return aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotStartMinutes + 30;
  };

  // Create hour-based time slots for Anyone column (8 AM to 9 PM)
  const hourSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    hourSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const workingEmployees = getWorkingEmployees();

  // Filter working employees based on search query
  const filteredWorkingEmployees = searchQuery 
    ? workingEmployees.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workingEmployees;

  // Filter time slots based on showFullView setting
  const timeSlots = showFullView 
    ? allTimeSlots 
    : allTimeSlots.filter(timeSlot => {
        const hasAppointment = allDayAppointments.some(apt => {
          const aptStartMinutes = timeToMinutes(apt.time);
          const slotStartMinutes = timeToMinutes(timeSlot);
          const slotEndMinutes = slotStartMinutes + 30;
          return aptStartMinutes < slotEndMinutes && aptStartMinutes + parseDuration(apt.duration, (apt as any).extraTime) > slotStartMinutes;
        });
        
        if (hasAppointment && timeSlot === "08:00") {
          console.log("Time slot 08:00 has appointments:", allDayAppointments.filter(apt => 
            timeToMinutes(apt.time) >= timeToMinutes(timeSlot) && 
            timeToMinutes(apt.time) < timeToMinutes(timeSlot) + 30
          ).map(apt => ({ customer: apt.customer, staff: `"${apt.staff}"`, time: apt.time })));
        }
        
        return hasAppointment;
      });

  return (
    <div className="h-full flex flex-col">
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

      {/* Grid Container with Full Width and Internal Scrolling */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="flex max-w-lg">
            {/* Calculate actual needed width based on employees */}
            {/* Time column - sticky left */}
            <div className="w-20 bg-gray-50 border-r border-gray-200 sticky left-0 z-30 shadow-sm flex-shrink-0">
              <div className="h-12 border-b border-gray-200 bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700">Giờ</span>
              </div>
              {timeSlots.map((timeSlot) => (
                <div 
                  key={timeSlot} 
                  className="h-14 p-2 border-b border-gray-200 text-xs text-gray-700 font-semibold flex items-center justify-center bg-gray-50"
                >
                  {timeSlot}
                </div>
              ))}
            </div>

            {/* Anyone column */}
            <div className="flex-shrink-0 border-r border-gray-200 w-36">
              {/* Anyone header */}
              <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 p-2 flex items-center justify-center sticky top-0 z-20">
                <div className="text-center w-full">
                  <div className="text-sm font-bold text-gray-800 truncate leading-tight">
                    Anyone
                  </div>
                  <div className="text-xs text-orange-600 truncate font-medium">
                    {anyoneAppointments.length} lịch hẹn
                  </div>
                </div>
              </div>

              {/* Time slots for Anyone column - Hour-based slots */}
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
                    className="h-28 border-b border-gray-200 bg-white relative p-1 transition-colors hover:bg-orange-50"
                  >
                    {displayAppointment ? (
                      <div className="space-y-1">
                        {/* First appointment */}
                        <div
                          className="bg-orange-100 border border-orange-300 rounded-md p-1 cursor-pointer hover:shadow-md transition-all text-xs"
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
                  {/* Employee header - Fixed width and truncated */}
                  <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 flex items-center justify-center sticky top-0 z-20">
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
                            setSelectedEmployee(employee);
                            setIsScheduleDialogOpen(true);
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

                   {/* Time slots for this employee */}
                  {timeSlots.map((timeSlot) => {
                    const employeeAppointments = getEmployeeAppointmentsForTimeSlot(employee, timeSlot);
                    const startingAppointments = employeeAppointments.filter(apt => 
                      appointmentStartsAtSlot(apt, timeSlot)
                    );

                    // Check if employee is available at this time
                    const availability = isEmployeeAvailableAtTime(employee, selectedDate, timeSlot);
                    const scheduleStatus = getEmployeeScheduleStatus(employee, selectedDate);

                    console.log(`Time slot ${timeSlot} for ${employee.name}:`, {
                      available: availability.available,
                      reason: availability.reason,
                      hasAppointments: startingAppointments.length > 0
                    });

                    const handleTimeSlotClick = () => {
                      if (onTimeSlotClick && startingAppointments.length === 0 && availability.available) {
                        onTimeSlotClick(dateString, timeSlot, employee.name);
                      }
                    };
                    
                    return (
                      <div 
                        key={`${employee.id}-${timeSlot}`} 
                        className={cn(
                          "h-14 border-b border-gray-200 relative p-1 transition-colors",
                          !availability.available 
                            ? "bg-gray-200 cursor-not-allowed opacity-60" 
                            : startingAppointments.length === 0 
                              ? "bg-white hover:bg-blue-50 cursor-pointer" 
                              : "bg-white hover:bg-gray-50"
                        )}
                        onClick={handleTimeSlotClick}
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
                        
                        {startingAppointments.length > 0 && (
                          <div className="text-xs text-blue-600 absolute top-0 left-0">
                            {startingAppointments.length} apt
                          </div>
                        )}
                        {startingAppointments.map((apt, aptIndex) => {
                          const durationMinutes = parseDuration(apt.duration, (apt as any).extraTime);
                          const slotsSpanned = Math.ceil(durationMinutes / 30);
                          const heightInPixels = slotsSpanned * 56 - 4; // 56px per slot (h-14) minus border
                          
                          // Use consistent color for all appointments
                          const getAppointmentColor = () => {
                            if (apt.status === 'cancelled') return 'bg-red-100 border-red-300 text-red-800';
                            if (apt.status === 'completed') return 'bg-green-100 border-green-300 text-green-800';
                            return 'bg-blue-100 border-blue-300 text-blue-800'; // Default blue for all confirmed appointments
                          };
                          
                          return (
                            <div
                              key={`${apt.id}-${aptIndex}`}
                              className={`absolute ${getAppointmentColor()} border rounded-md p-1 cursor-pointer hover:shadow-md transition-all text-xs overflow-hidden`}
                              style={{
                                top: '2px',
                                left: `${aptIndex * 50}%`,
                                width: startingAppointments.length > 1 ? '48%' : '96%',
                                height: `${heightInPixels}px`,
                                minHeight: '50px',
                                zIndex: 10
                              }}
                              onClick={(e) => {
                                e.preventDefault();
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

      {/* Anyone Appointments Popup */}
      <Dialog open={isAnyonePopupOpen} onOpenChange={setIsAnyonePopupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Lịch hẹn khung giờ {selectedTimeSlot} - {timeToEndTime(selectedTimeSlot, 60)}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {selectedSlotAppointments.map((apt, index) => (
              <div
                key={`popup-${apt.id}`}
                className="bg-orange-50 border border-orange-200 rounded-md p-3 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={(e) => {
                  handleAppointmentClick(apt, e);
                  setIsAnyonePopupOpen(false);
                }}
               >
                 {/* Staff icon in top right if staff is assigned */}
                 {apt.staff && apt.staff !== "Bất kì" && apt.staff !== "" && apt.staff !== "undefined" && (
                   <div className="absolute top-0.5 right-0.5 bg-blue-600 rounded-full p-1 shadow-sm z-10">
                     <UserCheck className="w-2.5 h-2.5 text-white" />
                   </div>
                 )}
                 <div className="flex justify-between items-start mb-2">
                   <div className="font-bold text-gray-800">
                     {apt.customer}
                   </div>
                   <div className="text-xs text-orange-600 font-medium">
                     {apt.time}
                   </div>
                 </div>
                 <div className="text-sm text-gray-600">
                   {apt.service}
                 </div>
                 <div className="text-xs text-gray-500 mt-1">
                   {getDisplayDuration(apt)} • {apt.price}
                 </div>
               </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-in Sidebar */}
      <CheckInSidebar 
        isOpen={isCheckInSidebarOpen}
        onClose={() => setIsCheckInSidebarOpen(false)}
        selectedDate={selectedDate}
        onAppointmentCreated={onAppointmentCreated}
      />

      {/* Employee Schedule Dialog */}
      <EmployeeScheduleDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => {
          setIsScheduleDialogOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        selectedDate={selectedDate}
        onScheduleUpdate={() => {
          // No need to do anything here, the state will update automatically
          console.log('Schedule updated, UI should re-render automatically');
        }}
      />
    </div>
  );
}
