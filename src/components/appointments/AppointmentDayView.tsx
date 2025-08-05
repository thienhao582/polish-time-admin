
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
    firstFewAppointments: dayAppointments.slice(0, 3)
  });

  // Get working employees for this date
  const getWorkingEmployees = () => {
    // If no time records for this date, show all employees
    const workingEmployees = employees.filter(employee => {
      // Check if employee has time record for this date (is working)
      const timeRecord = timeRecords.find(tr => 
        tr.employeeId === employee.id && 
        format(new Date(tr.date), "yyyy-MM-dd") === dateString
      );
      
      // If no time records exist, show all employees
      // Otherwise only show employees with working status
      return timeRecords.length === 0 || (timeRecord && timeRecord.status !== 'absent');
    });

    // If no employees have time records, show all employees
    const employeesToShow = workingEmployees.length > 0 ? workingEmployees : employees;

    // Sort employees by priority: those with appointments first, then by appointment time
    const employeesWithAppointments = employeesToShow.map(employee => {
      const employeeAppointments = dayAppointments.filter(apt => 
        apt.staff.includes(employee.name)
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

    // Sort by: 1) Has appointments (ascending), 2) Earliest appointment time (ascending)
    return employeesWithAppointments
      .sort((a, b) => {
        if (a.appointmentCount === 0 && b.appointmentCount === 0) return 0;
        if (a.appointmentCount === 0) return 1;
        if (b.appointmentCount === 0) return -1;
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
    
    return dayAppointments.filter(apt => {
      if (!apt.staff.includes(employee.name)) return false;
      
      const aptStartMinutes = timeToMinutes(apt.time);
      const aptDurationMinutes = parseDuration(apt.duration);
      const aptEndMinutes = aptStartMinutes + aptDurationMinutes;
      
      // Check if appointment overlaps with this time slot
      return aptStartMinutes < slotEndMinutes && aptEndMinutes > slotStartMinutes;
    });
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
    <div className="w-full overflow-x-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
        <h3 className="font-semibold text-lg text-gray-800">
          {format(selectedDate, "EEEE, dd/MM/yyyy")}
        </h3>
        <p className="text-sm text-gray-600">
          {dayAppointments.length} lịch hẹn • {workingEmployees.length} nhân viên ({employees.length} tổng)
        </p>
        <p className="text-xs text-gray-500">
          Debug: timeRecords={timeRecords.length}, selectedDate={dateString}
        </p>
      </div>

      {/* Grid Layout */}
      <div className="flex min-w-max">
        {/* Time column */}
        <div className="w-20 bg-gray-50 border-r border-gray-200">
          <div className="h-12 border-b border-gray-200 bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">Giờ</span>
          </div>
          {timeSlots.map((timeSlot) => (
            <div 
              key={timeSlot} 
              className="h-14 p-1 border-b border-gray-200 text-xs text-gray-700 font-medium flex items-center justify-center bg-gray-50"
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
            <div key={employee.id} className="flex-shrink-0 border-r border-gray-200" style={{ width: '200px' }}>
              {/* Employee header */}
              <div className="h-12 border-b border-gray-200 bg-white p-2 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {employee.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
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
                    {startingAppointments.map((apt, aptIndex) => {
                      const durationMinutes = parseDuration(apt.duration);
                      const slotsSpanned = Math.ceil(durationMinutes / 30);
                      const heightInPixels = slotsSpanned * 56 - 4; // 56px per slot (h-14) minus border
                      
                      // Color based on service type or status
                      const getAppointmentColor = () => {
                        if (apt.status === 'completed') return 'bg-green-100 border-green-300 text-green-800';
                        if (apt.status === 'cancelled') return 'bg-red-100 border-red-300 text-red-800';
                        if (apt.service.toLowerCase().includes('nail')) return 'bg-pink-100 border-pink-300 text-pink-800';
                        if (apt.service.toLowerCase().includes('wax')) return 'bg-purple-100 border-purple-300 text-purple-800';
                        if (apt.service.toLowerCase().includes('pedicure')) return 'bg-blue-100 border-blue-300 text-blue-800';
                        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
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
                          {displayMode === "staff" ? (
                            <div className="font-bold truncate">
                              {apt.customer}
                            </div>
                          ) : displayMode === "customer" ? (
                            <div className="font-bold truncate">
                              {apt.customer}
                            </div>
                          ) : (
                            <div className="font-bold truncate">
                              {apt.customer}
                            </div>
                          )}
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
  );
}
