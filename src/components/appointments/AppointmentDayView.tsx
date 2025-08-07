import { format } from "date-fns";
import { useSalonStore } from "@/stores/useSalonStore";
import { formatTimeRange } from "@/utils/timeUtils";

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

interface AppointmentDayViewProps {
  selectedDate: Date;
  filteredAppointments: Appointment[];
  handleAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
  displayMode: "customer" | "staff" | "both";
  showFullView: boolean;
}

export function AppointmentDayView({
  selectedDate,
  filteredAppointments,
  handleAppointmentClick,
  displayMode,
  showFullView
}: AppointmentDayViewProps) {
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { employees, timeRecords } = useSalonStore();
  
  // Filter appointments for the selected day
  const dayAppointments = filteredAppointments.filter(apt => apt.date === dateString);
  
  console.log("AppointmentDayView Debug:", {
    dateString,
    totalFiltered: filteredAppointments.length,
    dayAppointments: dayAppointments.length,
    firstFewAppointments: dayAppointments.slice(0, 5),
    allStaffNames: dayAppointments.map(apt => apt.staff),
    uniqueStaffNames: [...new Set(dayAppointments.map(apt => apt.staff))]
  });

  // Get working employees for this date (only service staff, not managers/reception)
  const getWorkingEmployees = () => {
    // Get all unique staff names from appointments for this day
    const staffNamesInAppointments = [...new Set(dayAppointments.map(apt => apt.staff))];
    
    console.log("Staff names in appointments:", staffNamesInAppointments);
    console.log("Available employees:", employees.slice(0, 10).map(e => ({ id: e.id, name: e.name, role: e.role })));
    
    // Instead of trying to match with existing employees, just create virtual employees from appointment staff names
    // This ensures all staff with appointments are displayed
    const finalEmployees = staffNamesInAppointments.map((staffName, index) => ({
      id: `virtual-${index}`,
      name: staffName,
      role: "thợ",
      specialties: []
    }));

    console.log("Final employees for day view:", finalEmployees.map(e => e.name));
    
    // Sort employees by priority: those with more appointments first
    const employeesWithData = finalEmployees.map(employee => {
      const employeeAppointments = dayAppointments.filter(apt => 
        apt.staff.includes(employee.name) || employee.name.includes(apt.staff)
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
      dayAppointments: dayAppointments.length,
      staffNamesInAppointments: staffNamesInAppointments.length,
      finalEmployees: finalEmployees.length,
      employeeNames: finalEmployees.map(e => e.name)
    });

    // Sort by: 1) Has appointments (descending), 2) Earliest appointment time (ascending)
    return employeesWithData
      .sort((a, b) => {
        if (a.appointmentCount !== b.appointmentCount) {
          return b.appointmentCount - a.appointmentCount; // More appointments first
        }
        return a.earliestTime - b.earliestTime;
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
  const parseDuration = (durationStr: string): number => {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 30;
  };

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Get appointments for a specific employee and time slot
  const getEmployeeAppointmentsForTimeSlot = (employee: any, timeSlot: string) => {
    const slotStartMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotStartMinutes + 30;
    
    const appointments = dayAppointments.filter(apt => {
      // Check if employee name matches staff field (more flexible matching)
      const isStaffMatch = apt.staff === employee.name || 
                          apt.staff.includes(employee.name) || 
                          employee.name.includes(apt.staff);
      
      if (!isStaffMatch) return false;
      
      const aptStartMinutes = timeToMinutes(apt.time);
      const aptDurationMinutes = parseDuration(apt.duration);
      const aptEndMinutes = aptStartMinutes + aptDurationMinutes;
      
      // Check if appointment overlaps with this time slot
      return aptStartMinutes < slotEndMinutes && aptEndMinutes > slotStartMinutes;
    });
    
    return appointments;
  };

  // Check if an appointment starts at this time slot
  const appointmentStartsAtSlot = (apt: Appointment, timeSlot: string): boolean => {
    const aptStartMinutes = timeToMinutes(apt.time);
    const slotStartMinutes = timeToMinutes(timeSlot);
    return aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotStartMinutes + 30;
  };

  const workingEmployees = getWorkingEmployees();

  // Filter time slots based on showFullView setting
  const timeSlots = showFullView 
    ? allTimeSlots 
    : allTimeSlots.filter(timeSlot => {
        return dayAppointments.some(apt => {
          const aptStartMinutes = timeToMinutes(apt.time);
          const slotStartMinutes = timeToMinutes(timeSlot);
          const slotEndMinutes = slotStartMinutes + 30;
          return aptStartMinutes < slotEndMinutes && aptStartMinutes + parseDuration(apt.duration) > slotStartMinutes;
        });
      });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-blue-200 flex-shrink-0">
        <h3 className="font-semibold text-base text-gray-800">
          {format(selectedDate, "EEEE, dd/MM/yyyy")}
        </h3>
        <p className="text-sm text-gray-600">
          {dayAppointments.length} lịch hẹn • {workingEmployees.length} nhân viên ({employees.length} tổng)
        </p>
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

            {/* Employee columns */}
            {workingEmployees.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-8 text-gray-500">
                Không có nhân viên nào đang làm việc hôm nay
              </div>
            ) : (
              workingEmployees.map((employee) => (
                <div key={employee.id} className="flex-shrink-0 border-r border-gray-200 w-36">
                  {/* Employee header - Fixed and more prominent */}
                  <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 flex items-center justify-center sticky top-0 z-20">
                    <div className="text-center w-full">
                      <div className="text-sm font-bold text-gray-800 truncate leading-tight">
                        {employee.name}
                      </div>
                      <div className="text-xs text-blue-600 truncate font-medium">
                        {employee.role}
                      </div>
                    </div>
                  </div>

                  {/* Time slots for this employee */}
                  {timeSlots.map((timeSlot) => {
                    const employeeAppointments = getEmployeeAppointmentsForTimeSlot(employee, timeSlot);
                    const startingAppointments = employeeAppointments.filter(apt => 
                      appointmentStartsAtSlot(apt, timeSlot)
                    );
                    
                    return (
                      <div 
                        key={`${employee.id}-${timeSlot}`} 
                        className="h-14 border-b border-gray-200 bg-white hover:bg-gray-50 relative p-1"
                      >
                        {startingAppointments.length > 0 && (
                          <div className="text-xs text-blue-600 absolute top-0 left-0">
                            {startingAppointments.length} apt
                          </div>
                        )}
                        {startingAppointments.map((apt, aptIndex) => {
                          const durationMinutes = parseDuration(apt.duration);
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
                                  {apt.duration}
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
  );
}