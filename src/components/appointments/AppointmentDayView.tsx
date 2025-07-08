
import { format, isSameDay } from "date-fns";
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

interface AppointmentDayViewProps {
  selectedDate: Date;
  filteredAppointments: Appointment[];
  handleAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
  displayMode: "customer" | "staff";
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
  
  // Filter appointments for the selected day
  const dayAppointments = filteredAppointments.filter(apt => {
    // Handle both date formats - compare the date part only
    const aptDate = new Date(apt.date);
    return isSameDay(aptDate, selectedDate);
  });

  console.log("AppointmentDayView - Selected date:", dateString);
  console.log("AppointmentDayView - All filtered appointments:", filteredAppointments);
  console.log("AppointmentDayView - Day appointments:", dayAppointments);

  // Create time slots from 8 AM to 9 PM (to match the time selector in the form)
  const allTimeSlots = [];
  for (let hour = 8; hour <= 21; hour++) {
    allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  const getAppointmentsForTimeSlot = (timeSlot: string) => {
    const appointments = dayAppointments.filter(apt => apt.time === timeSlot);
    console.log(`Time slot ${timeSlot} appointments:`, appointments);
    return appointments;
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
        <div className="flex-1">
          {timeSlots.map((timeSlot) => {
            const timeSlotAppointments = getAppointmentsForTimeSlot(timeSlot);
            
            return (
              <div key={timeSlot} className="h-16 p-2 border-b bg-white hover:bg-gray-50">
                {timeSlotAppointments.length > 0 && (
                  <div className="h-full">
                    <AppointmentOverflow
                      appointments={timeSlotAppointments}
                      maxVisible={2}
                      displayMode={displayMode}
                      onAppointmentClick={handleAppointmentClick}
                    />
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
