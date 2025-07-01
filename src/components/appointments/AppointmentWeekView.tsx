
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
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

interface AppointmentWeekViewProps {
  selectedDate: Date;
  filteredAppointments: Appointment[];
  handleAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
  displayMode: "customer" | "staff";
  showFullView: boolean;
}

export function AppointmentWeekView({
  selectedDate,
  filteredAppointments,
  handleAppointmentClick,
  displayMode,
  showFullView
}: AppointmentWeekViewProps) {
  const { t } = useLanguage();

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return filteredAppointments.filter(apt => apt.date === dateString);
  };

  const getDayName = (day: Date) => {
    const dayNames = [
      t('day.sun'), t('day.mon'), t('day.tue'), t('day.wed'), 
      t('day.thu'), t('day.fri'), t('day.sat')
    ];
    return dayNames[day.getDay()];
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const allWeekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Filter out days with no appointments when showFullView is false
  const weekDays = showFullView 
    ? allWeekDays 
    : allWeekDays.filter(day => {
        const dayAppointments = getAppointmentsForDate(day);
        return dayAppointments.length > 0;
      });

  return (
    <div className="w-full">
      {/* Header with day names */}
      <div className={`grid grid-cols-${weekDays.length} border-b bg-gray-50`}>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="p-3 text-center border-r last:border-r-0">
            <div className="font-medium text-gray-600">
              {getDayName(day)}
            </div>
            <div className={`text-sm ${isSameDay(day, new Date()) ? 'bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className={`grid grid-cols-${weekDays.length} border-l border-t`}>
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
