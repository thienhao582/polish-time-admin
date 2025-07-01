
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
}

export function AppointmentDayView({
  selectedDate,
  filteredAppointments,
  handleAppointmentClick
}: AppointmentDayViewProps) {
  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    const dateString = format(date, "yyyy-MM-dd");
    const appointments = filteredAppointments.filter(apt => apt.date === dateString);
    return appointments.filter(apt => {
      const [appointmentHour] = apt.time.split(':').map(Number);
      return appointmentHour === hour;
    });
  };

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
  
  return (
    <div className="flex h-[600px]">
      {/* Time column */}
      <div className="w-20 border-r">
        <div className="h-12 border-b"></div> {/* Header spacer */}
        {hours.map((hour) => (
          <div key={hour} className="h-12 border-b flex items-center justify-center text-sm text-gray-600">
            {hour}:00
          </div>
        ))}
      </div>

      {/* Day content */}
      <div className="flex-1">
        {/* Header */}
        <div className="h-12 border-b flex items-center justify-center bg-gray-50 font-medium">
          {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}
        </div>
        
        {/* Timeline */}
        <div className="relative">
          {hours.map((hour) => {
            const appointments = getAppointmentsForTimeSlot(selectedDate, hour);
            return (
              <div key={hour} className="h-12 border-b relative hover:bg-gray-50">
                {appointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className="absolute left-2 right-2 bg-pink-100 border-l-4 border-pink-500 rounded p-1 cursor-pointer hover:bg-pink-200 z-10"
                    style={{
                      top: `${index * 25}px`,
                      height: '22px'
                    }}
                    onClick={(e) => handleAppointmentClick(apt, e)}
                  >
                    <div className="text-xs font-medium truncate">
                      {apt.customer} - {apt.service}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
