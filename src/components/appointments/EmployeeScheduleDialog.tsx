import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSalonStore } from "@/stores/useSalonStore";
import { toast } from "sonner";

interface EmployeeScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  selectedDate: Date;
  onScheduleUpdate: () => void;
}

type WorkType = 'off' | 'full' | 'half' | 'quarter' | 'custom';

interface DaySchedule {
  workType: WorkType;
  startTime?: string;
  endTime?: string;
}

export function EmployeeScheduleDialog({
  isOpen,
  onClose,
  employee,
  selectedDate,
  onScheduleUpdate
}: EmployeeScheduleDialogProps) {
  const { language } = useLanguage();
  const { updateEmployee } = useSalonStore();
  
  const [workType, setWorkType] = useState<WorkType>('full');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    vi: {
      title: "Thiết lập lịch làm việc",
      date: "Ngày",
      workType: "Loại ca làm",
      workTypes: {
        off: "Nghỉ",
        full: "Cả ngày",
        half: "Nửa ngày", 
        quarter: "1/4 ngày",
        custom: "Tùy chỉnh"
      },
      startTime: "Giờ bắt đầu",
      endTime: "Giờ kết thúc",
      reason: "Lý do",
      reasonPlaceholder: "Nhập lý do (nghỉ ốm, việc cá nhân, ...)",
      save: "Lưu",
      cancel: "Hủy",
      offNote: "Nhân viên sẽ nghỉ trong khoảng thời gian được chỉ định",
      workNote: "Nhân viên sẽ làm việc trong khoảng thời gian được chỉ định"
    },
    en: {
      title: "Set Work Schedule",
      date: "Date",
      workType: "Work Type",
      workTypes: {
        off: "Off",
        full: "Full Day",
        half: "Half Day",
        quarter: "Quarter Day", 
        custom: "Custom Hours"
      },
      startTime: "Start Time",
      endTime: "End Time",
      reason: "Reason",
      reasonPlaceholder: "Enter reason (sick leave, personal, ...)",
      save: "Save",
      cancel: "Cancel",
      offNote: "Employee will be off during the specified time period",
      workNote: "Employee will work during the specified time period"
    }
  };

  const text = translations[language];

  const getDefaultHours = (type: WorkType): { start: string; end: string } => {
    switch (type) {
      case 'full':
        return { start: '08:00', end: '18:00' };
      case 'half':
        return { start: '08:00', end: '13:00' };
      case 'quarter':
        return { start: '08:00', end: '10:30' };
      case 'off':
        return { start: '', end: '' };
      default:
        return { start: '08:00', end: '18:00' };
    }
  };

  const handleWorkTypeChange = (type: WorkType) => {
    setWorkType(type);
    const defaultHours = getDefaultHours(type);
    if (defaultHours.start && defaultHours.end) {
      setStartTime(defaultHours.start);
      setEndTime(defaultHours.end);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      console.log('=== SAVING SCHEDULE ===');
      console.log('Employee:', employee?.name);
      console.log('Date:', dateString);
      console.log('Work type:', workType);
      console.log('Start time:', startTime);
      console.log('End time:', endTime);
      console.log('Reason:', reason);
      
      // Get current work schedule or create new one
      const currentSchedule = employee.workSchedule || {
        employeeId: employee.id,
        employeeName: employee.name,
        defaultSchedule: {
          0: { workType: 'off' }, // Sunday
          1: { workType: 'full', startTime: '08:00', endTime: '18:00' }, // Monday
          2: { workType: 'full', startTime: '08:00', endTime: '18:00' }, // Tuesday
          3: { workType: 'full', startTime: '08:00', endTime: '18:00' }, // Wednesday
          4: { workType: 'full', startTime: '08:00', endTime: '18:00' }, // Thursday
          5: { workType: 'full', startTime: '08:00', endTime: '18:00' }, // Friday
          6: { workType: 'half', startTime: '08:00', endTime: '13:00' }, // Saturday
        },
        scheduleOverrides: []
      };

      console.log('Current schedule before update:', currentSchedule);

      // Create new schedule entry
      const newSchedule: DaySchedule = {
        workType,
        ...(workType !== 'off' && startTime && endTime ? { startTime, endTime } : {}),
        ...(workType === 'off' && startTime && endTime ? { startTime, endTime } : {})
      };

      console.log('New schedule entry:', newSchedule);

      // Remove existing override for this date
      const filteredOverrides = currentSchedule.scheduleOverrides.filter(
        (override: any) => override.date !== dateString
      );

      // Add new override
      const newOverride = {
        date: dateString,
        schedule: newSchedule,
        reason: reason.trim() || undefined
      };

      console.log('New override:', newOverride);

      const updatedSchedule = {
        ...currentSchedule,
        scheduleOverrides: [...filteredOverrides, newOverride]
      };

      console.log('Updated complete schedule:', updatedSchedule);

      // Update employee with new schedule
      await updateEmployee(employee.id, {
        workSchedule: updatedSchedule
      } as any);

      console.log('Employee updated successfully');
      toast.success(`Đã cập nhật lịch làm việc cho ${employee.name}`);
      onScheduleUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Có lỗi xảy ra khi cập nhật lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWorkType('full');
    setStartTime('08:00');
    setEndTime('18:00');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {text.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee and Date Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-900">{employee?.name}</div>
            <div className="text-sm text-blue-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(selectedDate, 'EEEE, dd/MM/yyyy')}
            </div>
          </div>

          {/* Work Type Selection */}
          <div className="space-y-2">
            <Label>{text.workType}</Label>
            <Select value={workType} onValueChange={handleWorkTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">{text.workTypes.full}</SelectItem>
                <SelectItem value="half">{text.workTypes.half}</SelectItem>
                <SelectItem value="quarter">{text.workTypes.quarter}</SelectItem>
                <SelectItem value="custom">{text.workTypes.custom}</SelectItem>
                <SelectItem value="off">{text.workTypes.off}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Inputs */}
          {(workType !== 'off' || (workType === 'off' && (startTime || endTime))) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{text.startTime}</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{text.endTime}</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* For off periods, allow partial day off with time specification */}
          {workType === 'off' && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              💡 Để nghỉ một phần ngày, hãy chỉ định giờ bắt đầu và kết thúc nghỉ
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>{text.reason}</Label>
            <Textarea
              placeholder={text.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info Note */}
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {workType === 'off' ? text.offNote : text.workNote}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              {text.cancel}
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Đang lưu...' : text.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}