
import { format, isSameDay, parseISO } from "date-fns";
import { AppointmentOverflow } from "./AppointmentOverflow";
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
  
  // Filter appointments for the selected day with improved date parsing
  const dayAppointments = filteredAppointments.filter(apt => {
    try {
      // Handle both date string formats
      const aptDate = apt.date.includes('T') ? parseISO(apt.date) : parseISO(apt.date + 'T00:00:00');
      return isSameDay(aptDate, selectedDate);
    } catch (error) {
      console.error("Error parsing appointment date:", apt.date, error);
      return false;
    }
  });

  console.log("AppointmentDayView - Selected date:", dateString);
  console.log("AppointmentDayView - All filtered appointments:", filteredAppointments);
  console.log("AppointmentDayView - Day appointments after filtering:", dayAppointments);

  // Create time slots from 8 AM to 9 PM (to match the time selector in the form)
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
    return match ? parseInt(match[1]) : 30; // Default 30 minutes if can't parse
  };

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert minutes since midnight back to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Check if an appointment overlaps with a specific time slot
  const appointmentOverlapsTimeSlot = (apt: Appointment, timeSlot: string): boolean => {
    const aptStartMinutes = timeToMinutes(apt.time);
    const aptDurationMinutes = parseDuration(apt.duration);
    const aptEndMinutes = aptStartMinutes + aptDurationMinutes;
    
    const slotStartMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotStartMinutes + 30; // Each slot is 30 minutes
    
    // Check if appointment overlaps with this time slot
    return aptStartMinutes < slotEndMinutes && aptEndMinutes > slotStartMinutes;
  };

  const getAppointmentsForTimeSlot = (timeSlot: string) => {
    const appointments = dayAppointments.filter(apt => 
      appointmentOverlapsTimeSlot(apt, timeSlot)
    );
    console.log(`Time slot ${timeSlot} appointments:`, appointments);
    return appointments;
  };

  // Calculate how many slots an appointment spans
  const getAppointmentSpan = (apt: Appointment, startTimeSlot: string): { span: number, isStart: boolean } => {
    const aptStartMinutes = timeToMinutes(apt.time);
    const aptDurationMinutes = parseDuration(apt.duration);
    const slotStartMinutes = timeToMinutes(startTimeSlot);
    
    const isStart = aptStartMinutes === slotStartMinutes;
    const slotsSpanned = Math.ceil(aptDurationMinutes / 30);
    
    return { span: slotsSpanned, isStart };
  };

  // Filter time slots based on showFullView setting
  const timeSlots = showFullView 
    ? allTimeSlots 
    : allTimeSlots.filter(timeSlot => {
        const timeSlotAppointments = getAppointmentsForTimeSlot(timeSlot);
        return timeSlotAppointments.length > 0;
      });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="font-medium text-lg">
          {format(selectedDate, "EEEE, dd/MM/yyyy")}
        </h3>
        <p className="text-sm text-gray-600">
          {dayAppointments.length} lịch hẹn
        </p>
      </div>

      {/* Timeline */}
      <div className="flex">
        {/* Time column */}
        <div className="w-20 bg-gray-50">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="h-16 p-2 border-b border-r text-sm text-gray-600 font-medium">
              {timeSlot}
            </div>
          ))}
        </div>

        {/* Appointments column */}
        <div className="flex-1 relative">
          {timeSlots.map((timeSlot, index) => {
            const timeSlotAppointments = getAppointmentsForTimeSlot(timeSlot);
            
            // Only render appointments that start at this time slot
            const startingAppointments = timeSlotAppointments.filter(apt => {
              const aptStartMinutes = timeToMinutes(apt.time);
              const slotStartMinutes = timeToMinutes(timeSlot);
              return aptStartMinutes === slotStartMinutes;
            });
            
            return (
              <div key={timeSlot} className="h-16 border-b bg-white hover:bg-gray-50 relative">
                {startingAppointments.length > 0 ? (
                  <div className="flex gap-1 p-1 h-full">
                    {startingAppointments.map((apt, aptIndex) => {
                      const durationMinutes = parseDuration(apt.duration);
                      const slotsSpanned = Math.ceil(durationMinutes / 30);
                      const heightInPixels = slotsSpanned * 64; // 64px per slot (h-16)
                      const widthPercentage = 100 / startingAppointments.length; // Divide width equally
                      
                      return (
                        <div
                          key={`${apt.id}-${aptIndex}`}
                          className="absolute bg-blue-100 border border-blue-200 rounded-md p-2 cursor-pointer hover:bg-blue-200 transition-colors z-10 animate-fade-in"
                          style={{
                            top: '4px',
                            left: `${aptIndex * widthPercentage + 1}%`,
                            width: `${widthPercentage - 2}%`,
                            height: `${heightInPixels - 8}px`,
                            minHeight: '56px'
                          }}
                          onClick={(e) => handleAppointmentClick(apt, e)}
                        >
                          {displayMode === "customer" ? (
                            <div className="text-xs font-bold text-customer-name truncate">
                              {apt.customer}
                            </div>
                          ) : displayMode === "staff" ? (
                            <div className="text-xs font-bold text-staff-name truncate">
                              {apt.staff}
                            </div>
                          ) : (
                            <>
                              <div className="text-xs font-bold text-customer-name truncate">
                                {apt.customer}
                              </div>
                              <div className="text-xs font-bold text-staff-name truncate">
                                {apt.staff}
                              </div>
                            </>
                          )}
                          <div className="text-xs text-blue-600 truncate">
                            {apt.service}
                          </div>
                          <div className="text-xs text-blue-500">
                            {formatTimeRange(apt.time, apt.duration)}
                          </div>
                          <div className="text-xs text-blue-500 truncate">
                            ({apt.duration})
                          </div>
                          {apt.phone && startingAppointments.length === 1 && (
                            <div className="text-xs text-blue-500 truncate">
                              {apt.phone}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Show continuation indicators for appointments that started earlier
                  <div className="h-full">
                    {timeSlotAppointments.filter(apt => {
                      const aptStartMinutes = timeToMinutes(apt.time);
                      const slotStartMinutes = timeToMinutes(timeSlot);
                      return aptStartMinutes < slotStartMinutes;
                    }).map((apt, index) => (
                      <div
                        key={`continuation-${apt.id}-${index}`}
                        className="absolute inset-x-0 h-full bg-blue-50 border-l-2 border-blue-200 opacity-30"
                        style={{
                          left: `${index * 50}%`,
                          width: `${Math.min(50, 100 / timeSlotAppointments.length)}%`
                        }}
                      >
                        <div className="text-xs text-blue-400 p-1">
                          {displayMode === "customer" ? (
                            <div className="truncate font-bold text-customer-name">{apt.customer}</div>
                          ) : displayMode === "staff" ? (
                            <div className="truncate font-bold text-staff-name">{apt.staff}</div>
                          ) : (
                            <>
                              <div className="truncate font-bold text-customer-name">{apt.customer}</div>
                              <div className="truncate font-bold text-staff-name">{apt.staff}</div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-medium text-yellow-800">Debug Info:</h4>
          <p className="text-sm text-yellow-700">Selected Date: {dateString}</p>
          <p className="text-sm text-yellow-700">Total Filtered Appointments: {filteredAppointments.length}</p>
          <p className="text-sm text-yellow-700">Day Appointments: {dayAppointments.length}</p>
          <p className="text-sm text-yellow-700">Time Slots: {timeSlots.length}</p>
          {dayAppointments.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-yellow-700">Appointments for this day:</p>
              {dayAppointments.map(apt => (
                <p key={apt.id} className="text-xs text-yellow-600 ml-2">
                  {apt.time} - {apt.customer} - {apt.service}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
