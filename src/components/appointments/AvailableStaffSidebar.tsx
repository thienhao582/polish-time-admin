import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { useSalonStore } from "@/stores/useSalonStore";
import { format } from "date-fns";

interface AvailableStaffSidebarProps {
  selectedDate: Date;
  filteredAppointments: any[];
}

export function AvailableStaffSidebar({ selectedDate, filteredAppointments }: AvailableStaffSidebarProps) {
  const { employees, timeRecords } = useSalonStore();
  const [isOpen, setIsOpen] = useState(false);

  // Get staff availability for the selected date
  const getStaffAvailability = () => {
    const dateString = format(selectedDate, "yyyy-MM-dd");
    const dayAppointments = filteredAppointments.filter(apt => apt.date === dateString);
    
    const staffAvailability = employees.map(employee => {
      // Check if employee has time record for this date (is working)
      const timeRecord = timeRecords.find(tr => 
        tr.employeeId === employee.id && 
        format(new Date(tr.date), "yyyy-MM-dd") === dateString
      );
      
      if (!timeRecord || timeRecord.status === 'absent') {
        return null; // Don't show employees not working or absent
      }

      // Get employee's appointments for the day
      const employeeAppointments = dayAppointments.filter(apt => apt.staff === employee.name);
      
      // Calculate priority based on current status
      let priority = 0;
      let status = "Rảnh";
      let nextAvailable = "Ngay bây giờ";
      
      if (employeeAppointments.length === 0) {
        priority = 1; // Highest priority - completely free
        status = "Rảnh";
      } else {
        // Find current/next appointment
        const currentTime = new Date();
        const currentTimeStr = format(currentTime, "HH:mm");
        
        const currentAppointment = employeeAppointments.find(apt => {
          const aptStart = apt.time;
          const aptDuration = parseInt(apt.duration.match(/(\d+)/)?.[1] || "30");
          const aptStartMinutes = timeToMinutes(aptStart);
          const aptEndMinutes = aptStartMinutes + aptDuration;
          const currentMinutes = timeToMinutes(currentTimeStr);
          
          return currentMinutes >= aptStartMinutes && currentMinutes < aptEndMinutes;
        });
        
        if (currentAppointment) {
          const aptDuration = parseInt(currentAppointment.duration.match(/(\d+)/)?.[1] || "30");
          const aptStartMinutes = timeToMinutes(currentAppointment.time);
          const aptEndMinutes = aptStartMinutes + aptDuration;
          const currentMinutes = timeToMinutes(currentTimeStr);
          const remainingMinutes = aptEndMinutes - currentMinutes;
          
          if (remainingMinutes <= 15) {
            priority = 2; // About to finish
            status = "Sắp xong";
            nextAvailable = `${remainingMinutes} phút nữa`;
          } else {
            priority = 3; // Just started or in middle
            status = "Đang bận";
            nextAvailable = `${remainingMinutes} phút nữa`;
          }
        } else {
          priority = 1; // Between appointments
          status = "Rảnh";
        }
      }
      
      return {
        employee,
        priority,
        status,
        nextAvailable,
        appointmentCount: employeeAppointments.length
      };
    }).filter(Boolean);

    // Sort by priority (1 = highest priority)
    return staffAvailability.sort((a, b) => a!.priority - b!.priority);
  };

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const availableStaff = getStaffAvailability();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Nhân viên sẵn sàng
          <Badge variant="secondary" className="ml-1">
            {availableStaff.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Nhân viên sẵn sàng
            <Badge variant="outline">{format(selectedDate, "dd/MM/yyyy")}</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          {availableStaff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Không có nhân viên nào đang làm việc hôm nay
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-4">
                Sắp xếp theo độ ưu tiên: Rảnh → Sắp xong → Đang bận
              </div>
              
              {availableStaff.map((staff, index) => (
                <div 
                  key={staff!.employee.id} 
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{staff!.employee.name}</span>
                        <Badge 
                          variant={
                            staff!.status === "Rảnh" ? "default" : 
                            staff!.status === "Sắp xong" ? "secondary" : 
                            "outline"
                          }
                          className="text-xs"
                        >
                          {staff!.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Có thể nhận lịch: {staff!.nextAvailable}</span>
                      </div>
                      
                      {staff!.appointmentCount > 0 && (
                        <div className="text-sm text-muted-foreground">
                          📅 {staff!.appointmentCount} lịch hẹn hôm nay
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground mt-2">
                        🔧 {staff!.employee.role} • {staff!.employee.specialties?.join(", ") || "Chưa có chuyên môn"}
                      </div>
                    </div>
                    
                    <div className="ml-3">
                      {staff!.status === "Rảnh" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : staff!.status === "Sắp xong" ? (
                        <Clock className="w-5 h-5 text-orange-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}