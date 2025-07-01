
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

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

interface AppointmentWeekViewProps {
  selectedDate: Date;
  filteredAppointments: Appointment[];
  handleAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
}

export function AppointmentWeekView({
  selectedDate,
  filteredAppointments,
  handleAppointmentClick
}: AppointmentWeekViewProps) {
  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return filteredAppointments.filter(apt => apt.date === dateString);
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="grid grid-cols-7 gap-1">
      {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, index) => (
        <div key={day} className="p-2 text-center font-medium text-gray-600 border-b">
          {day}
        </div>
      ))}
      {weekDays.map((day) => {
        const dayAppointments = getAppointmentsForDate(day);
        return (
          <div key={day.toISOString()} className="min-h-[200px] p-2 border-r border-b">
            <div className={`text-sm font-medium mb-2 ${isSameDay(day, new Date()) ? 'text-pink-600' : 'text-gray-700'}`}>
              {format(day, "d")}
            </div>
            <div className="space-y-1">
              {dayAppointments.map((apt) => (
                <div 
                  key={apt.id} 
                  className="text-xs p-1 bg-pink-50 border-l-2 border-pink-400 rounded cursor-pointer hover:bg-pink-100"
                  onClick={(e) => handleAppointmentClick(apt, e)}
                >
                  <div className="font-medium">{apt.time}</div>
                  <div className="text-gray-600">{apt.customer}</div>
                  <div className="text-gray-500">{apt.staff}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
