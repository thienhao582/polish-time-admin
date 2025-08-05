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
  isContentOnly?: boolean;
}

export function AvailableStaffSidebar({ selectedDate, filteredAppointments, isContentOnly = false }: AvailableStaffSidebarProps) {
  const { employees, timeRecords } = useSalonStore();
  const [isOpen, setIsOpen] = useState(false);

  // Get staff availability for the selected date
  const getStaffAvailability = () => {
    const dateString = format(selectedDate, "yyyy-MM-dd");
    const dayAppointments = filteredAppointments.filter(apt => apt.date === dateString);
    
    console.log("AvailableStaffSidebar Debug:", {
      dateString,
      totalEmployees: employees.length,
      totalTimeRecords: timeRecords.length,
      dayAppointments: dayAppointments.length,
      timeRecordsForDate: timeRecords.filter(tr => format(new Date(tr.date), "yyyy-MM-dd") === dateString).length
    });
    
    // Filter to only technicians who do services
    const serviceEmployees = employees.filter(emp => 
      emp.role === "thợ" || emp.role === "thợ chính" || emp.role === "phụ tá"
    );
    
    const staffAvailability = serviceEmployees.map(employee => {
      // Check if employee has time record for this date (is working)
      const timeRecord = timeRecords.find(tr => 
        tr.employeeId === employee.id && 
        format(new Date(tr.date), "yyyy-MM-dd") === dateString
      );
      
      // If no time records exist for any employee, show all service employees
      // If time records exist but this employee doesn't have one, don't show them
      const hasAnyTimeRecords = timeRecords.length > 0;
      const hasTimeRecordForDate = timeRecords.some(tr => format(new Date(tr.date), "yyyy-MM-dd") === dateString);
      
      if (hasAnyTimeRecords && hasTimeRecordForDate && (!timeRecord || timeRecord.status === 'absent')) {
        return null; // Don't show employees not working or absent when time records exist
      }
      
      // If no time records system in place, show all service employees
      if (!hasAnyTimeRecords || !hasTimeRecordForDate) {
        // Show all service employees when no time tracking
      }

      // Get employee's appointments for the day  
      const employeeAppointments = dayAppointments.filter(apt => 
        apt.staff.includes(employee.name) || employee.name.includes(apt.staff)
      );
      
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

    console.log("Staff availability result:", {
      serviceEmployees: serviceEmployees.length,
      availableStaff: staffAvailability.length,
      sampleStaff: staffAvailability.slice(0, 3).map(s => s?.employee.name)
    });

    // Sort by priority (1 = highest priority)
    return staffAvailability.sort((a, b) => a!.priority - b!.priority);
  };

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const availableStaff = getStaffAvailability();

  // If isContentOnly is true, return only the content without Sheet wrapper
  if (isContentOnly) {
    return (
      <div className="mt-4">
        {availableStaff.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Không có nhân viên nào đang làm việc hôm nay
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-3">
              Sắp xếp theo độ ưu tiên: Rảnh → Sắp xong → Đang bận
            </div>
            
            {availableStaff.map((staff, index) => (
              <div 
                key={staff!.employee.id} 
                className="p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium truncate">{staff!.employee.name}</span>
                      <Badge 
                        variant={
                          staff!.status === "Rảnh" ? "default" : 
                          staff!.status === "Sắp xong" ? "secondary" : 
                          "outline"
                        }
                        className="text-xs h-4 px-1"
                      >
                        {staff!.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{staff!.nextAvailable}</span>
                    </div>
                    
                    {staff!.appointmentCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        📅 {staff!.appointmentCount} lịch
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-2 flex items-center">
                    <span className="text-xs text-muted-foreground mr-1">#{index + 1}</span>
                    {staff!.status === "Rảnh" ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : staff!.status === "Sắp xong" ? (
                      <Clock className="w-3 h-3 text-orange-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Original Sheet-based component
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