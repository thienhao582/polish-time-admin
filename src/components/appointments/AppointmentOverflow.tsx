
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface AppointmentOverflowProps {
  appointments: Appointment[];
  maxVisible: number;
  displayMode: "customer" | "staff";
  onAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
}

export function AppointmentOverflow({
  appointments,
  maxVisible,
  displayMode,
  onAppointmentClick
}: AppointmentOverflowProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (appointments.length <= maxVisible) {
    return (
      <>
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="text-xs p-2 bg-pink-50 border-l-2 border-pink-400 rounded text-gray-700 truncate cursor-pointer hover:bg-pink-100 transition-colors mb-1"
            title={`${apt.time} - ${apt.customer} (${apt.service})`}
            onClick={(e) => onAppointmentClick(apt, e)}
          >
            <div className="font-medium">{apt.time}</div>
            <div className="truncate">
              {displayMode === "customer" ? apt.customer : apt.staff}
            </div>
          </div>
        ))}
      </>
    );
  }

  const visibleAppointments = appointments.slice(0, maxVisible);
  const hiddenCount = appointments.length - maxVisible;

  return (
    <>
      {visibleAppointments.map((apt) => (
        <div
          key={apt.id}
          className="text-xs p-2 bg-pink-50 border-l-2 border-pink-400 rounded text-gray-700 truncate cursor-pointer hover:bg-pink-100 transition-colors mb-1"
          title={`${apt.time} - ${apt.customer} (${apt.service})`}
          onClick={(e) => onAppointmentClick(apt, e)}
        >
          <div className="font-medium">{apt.time}</div>
          <div className="truncate">
            {displayMode === "customer" ? apt.customer : apt.staff}
          </div>
        </div>
      ))}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs p-1 h-auto bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            +{hiddenCount} lịch hẹn khác
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tất cả lịch hẹn</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3 bg-pink-50 border border-pink-200 rounded cursor-pointer hover:bg-pink-100 transition-colors"
                onClick={(e) => {
                  onAppointmentClick(apt, e);
                  setIsOpen(false);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{apt.time}</div>
                    <div className="text-sm text-gray-700">{apt.customer}</div>
                    <div className="text-xs text-gray-500">{apt.service}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{apt.staff}</div>
                    <Badge variant="outline" className="text-xs">
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
