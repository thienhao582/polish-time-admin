
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { AppointmentOverflow } from "./AppointmentOverflow";
import { useLanguage } from "@/contexts/LanguageContext";

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
  displayMode: "customer" | "staff" | "both";
  showFullView: boolean;
}

export function AppointmentMonthView({
  selectedDate,
  setSelectedDate,
  filteredAppointments,
  handleAppointmentClick,
  displayMode,
  showFullView
}: AppointmentMonthViewProps) {
  const { t } = useLanguage();

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return filteredAppointments.filter(apt => apt.date === dateString);
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allCalendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Always show full calendar view - all days including previous/next month's days
  const calendarDays = allCalendarDays;

  const dayHeaders = [
    t('day.monday'), t('day.tuesday'), t('day.wednesday'), 
    t('day.thursday'), t('day.friday'), t('day.saturday'), t('day.sunday')
  ];

  return (
    <div className="w-full">
      {/* Header with day names */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {dayHeaders.map((day) => (
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
              className={`min-h-[200px] h-auto border-r border-b last:border-r-0 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
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

              {/* Appointments list with overflow handling */}
              <div className="space-y-1">
                <AppointmentOverflow
                  appointments={dayAppointments}
                  maxVisible={3}
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
