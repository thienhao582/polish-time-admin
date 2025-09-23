import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, X, Save } from "lucide-react";
import { useSalonStore } from "@/stores/useSalonStore";
import { useToast } from "@/hooks/use-toast";

interface QuickScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  selectedDate: Date;
  onScheduleUpdate?: () => void;
}

export function QuickScheduleDialog({ 
  isOpen, 
  onClose, 
  employee, 
  selectedDate,
  onScheduleUpdate 
}: QuickScheduleDialogProps) {
  const { updateEmployee } = useSalonStore();
  const { toast } = useToast();
  
  const [workType, setWorkType] = useState<'off' | 'full' | 'half' | 'quarter' | 'custom'>('full');
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [reason, setReason] = useState("");

  const handleSave = () => {
    if (!employee) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const currentWorkSchedule = employee.workSchedule || {
      employeeId: employee.id,
      employeeName: employee.name,
      defaultSchedule: {},
      scheduleOverrides: []
    };

    // Create schedule override for this specific date
    const scheduleOverride = {
      date: dateString,
      schedule: {
        workType,
        startTime: workType === 'off' || (workType !== 'full' && startTime) ? startTime : undefined,
        endTime: workType === 'off' || (workType !== 'full' && endTime) ? endTime : undefined
      },
      reason: reason.trim() || undefined
    };

    // Remove existing override for this date if any
    const filteredOverrides = currentWorkSchedule.scheduleOverrides?.filter(
      (override: any) => override.date !== dateString
    ) || [];

    // Add new override
    const updatedWorkSchedule = {
      ...currentWorkSchedule,
      scheduleOverrides: [...filteredOverrides, scheduleOverride]
    };

    // Update employee with new work schedule
    updateEmployee(employee.id, {
      ...employee,
      workSchedule: updatedWorkSchedule
    });

    toast({
      title: "Lịch làm việc đã được cập nhật",
      description: `Đã thiết lập lịch cho ${employee.name} ngày ${format(selectedDate, 'dd/MM/yyyy')}`
    });

    onScheduleUpdate?.();
    onClose();
  };

  const handleCancel = () => {
    setWorkType('full');
    setStartTime("08:00");
    setEndTime("18:00");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Set Work Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee and Date Info */}
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{employee?.name}</div>
            <div className="flex items-center gap-2">
              📅 {format(selectedDate, 'EEEE, dd/MM/yyyy')}
            </div>
          </div>

          {/* Work Type */}
          <div className="space-y-2">
            <Label htmlFor="workType">Work Type</Label>
            <Select value={workType} onValueChange={(value: any) => setWorkType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Day</SelectItem>
                <SelectItem value="half">Half Day</SelectItem>
                <SelectItem value="quarter">Quarter Day</SelectItem>
                <SelectItem value="custom">Custom Hours</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Inputs - Show when not full day */}
          {workType !== 'full' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason (sick leave, personal, ...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {workType !== 'off' && (
            <div className="text-xs text-muted-foreground">
              Employee will work during the specified time period
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}