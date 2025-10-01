
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface AppointmentOverflowProps {
  appointments: Appointment[];
  maxVisible: number;
  displayMode: "customer" | "staff" | "both";
  onAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
}

const getStatusClasses = (status: string) => {
  const normalizedStatus = status?.toLowerCase() || 'confirmed';
  
  switch (normalizedStatus) {
    case 'confirmed':
      return 'bg-[hsl(var(--status-confirmed-bg))] border-[hsl(var(--status-confirmed-border))] hover:bg-[hsl(var(--status-confirmed-bg))]/80';
    case 'in-progress':
      return 'bg-[hsl(var(--status-in-progress-bg))] border-[hsl(var(--status-in-progress-border))] hover:bg-[hsl(var(--status-in-progress-bg))]/80';
    case 'completed':
      return 'bg-[hsl(var(--status-completed-bg))] border-[hsl(var(--status-completed-border))] hover:bg-[hsl(var(--status-completed-bg))]/80';
    case 'cancelled':
      return 'bg-[hsl(var(--status-cancelled-bg))] border-[hsl(var(--status-cancelled-border))] hover:bg-[hsl(var(--status-cancelled-bg))]/80';
    case 'pending':
      return 'bg-[hsl(var(--status-pending-bg))] border-[hsl(var(--status-pending-border))] hover:bg-[hsl(var(--status-pending-bg))]/80';
    default:
      return 'bg-[hsl(var(--status-confirmed-bg))] border-[hsl(var(--status-confirmed-border))] hover:bg-[hsl(var(--status-confirmed-bg))]/80';
  }
};

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
            className={`text-xs p-2 border-l-2 rounded text-gray-700 truncate cursor-pointer transition-colors mb-1 ${getStatusClasses(apt.status)}`}
            title={`${apt.time} - ${apt.customer} (${apt.service})`}
            onClick={(e) => onAppointmentClick(apt, e)}
          >
            <div className="font-medium">{formatTimeRange(apt.time, apt.duration)}</div>
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
          className={`text-xs p-2 border-l-2 rounded text-gray-700 truncate cursor-pointer transition-colors mb-1 ${getStatusClasses(apt.status)}`}
          title={`${apt.time} - ${apt.customer} (${apt.service})`}
          onClick={(e) => onAppointmentClick(apt, e)}
        >
          <div className="font-medium">{formatTimeRange(apt.time, apt.duration)}</div>
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
                className={`p-3 border rounded cursor-pointer transition-colors ${getStatusClasses(apt.status)}`}
                onClick={(e) => {
                  onAppointmentClick(apt, e);
                  setIsOpen(false);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{formatTimeRange(apt.time, apt.duration)}</div>
                    <div className="text-sm font-bold text-customer-name">{apt.customer}</div>
                    <div className="text-xs text-gray-500">{apt.service}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-staff-name">{apt.staff}</div>
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
