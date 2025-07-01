
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { AppointmentOverflow } from "./AppointmentOverflow";

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
  displayMode: "customer" | "staff";
}

export function AppointmentWeekView({
  selectedDate,
  filteredAppointments,
  handleAppointmentClick,
  displayMode
}: AppointmentWeekViewProps) {
  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return filteredAppointments.filter(apt => apt.date === dateString);
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="w-full">
      {/* Header with day names */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="p-3 text-center border-r last:border-r-0">
            <div className="font-medium text-gray-600">
              {format(day, "EEEE", { locale: { localize: { day: () => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][day.getDay()] } } })}
            </div>
            <div className={`text-sm ${isSameDay(day, new Date()) ? 'bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 border-l border-t">
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[400px] border-r border-b last:border-r-0 p-3 ${
                isToday ? 'bg-pink-50' : 'bg-white'
              }`}
            >
              {/* Appointments list with overflow handling */}
              <div className="space-y-1">
                <AppointmentOverflow
                  appointments={dayAppointments}
                  maxVisible={4}
                  displayMode={displayMode}
                  onAppointmentClick={handleAppointmentClick}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
