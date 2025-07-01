
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, getWeeksInMonth } from "date-fns";

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

interface AppointmentMonthViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  filteredAppointments: Appointment[];
  handleAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
}

export function AppointmentMonthView({
  selectedDate,
  setSelectedDate,
  filteredAppointments,
  handleAppointmentClick
}: AppointmentMonthViewProps) {
  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return filteredAppointments.filter(apt => apt.date === dateString);
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="w-full">
      {/* Header with day names */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((day) => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-t">
        {calendarDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[160px] border-r border-b last:border-r-0 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
              } ${isSelected ? 'border-4 border-pink-500' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              {/* Date number */}
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium ${
                  isToday ? 'bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' :
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, "d")}
                </span>
                {dayAppointments.length > 0 && (
                  <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded">
                    {dayAppointments.length}
                  </span>
                )}
              </div>

              {/* Appointments list */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 4).map((apt) => (
                  <div
                    key={apt.id}
                    className="text-xs p-2 bg-pink-50 border-l-2 border-pink-400 rounded text-gray-700 truncate cursor-pointer hover:bg-pink-100 transition-colors"
                    title={`${apt.time} - ${apt.customer} (${apt.service})`}
                    onClick={(e) => handleAppointmentClick(apt, e)}
                  >
                    <div className="font-medium">{apt.time}</div>
                    <div className="truncate">{apt.customer}</div>
                  </div>
                ))}
                {dayAppointments.length > 4 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayAppointments.length - 4} khác
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
