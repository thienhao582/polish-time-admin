
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
}

export function AppointmentDayView({
  selectedDate,
  filteredAppointments,
  handleAppointmentClick,
  displayMode
}: AppointmentDayViewProps) {
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const dayAppointments = filteredAppointments.filter(apt => apt.date === dateString);

  // Create time slots from 7 AM to 8 PM
  const allTimeSlots = [];
  for (let hour = 7; hour <= 20; hour++) {
    allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  const getAppointmentsForTimeSlot = (timeSlot: string) => {
    return dayAppointments.filter(apt => apt.time === timeSlot);
  };

  // Filter time slots to only show those with appointments when filtering is active
  const timeSlots = allTimeSlots.filter(timeSlot => {
    const timeSlotAppointments = getAppointmentsForTimeSlot(timeSlot);
    // Always show time slots if no specific filters are applied, otherwise only show slots with appointments
    return timeSlotAppointments.length > 0 || filteredAppointments.length === 0;
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
    </div>
  );
}
