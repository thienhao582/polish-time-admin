import { format } from "date-fns";

interface DaySchedule {
  workType: 'off' | 'full' | 'half' | 'quarter' | 'custom';
  startTime?: string;
  endTime?: string;
}

interface WorkSchedule {
  employeeId: string;
  employeeName: string;
  defaultSchedule: {
    [key: number]: DaySchedule; // 0 = Sunday, 1 = Monday, etc.
  };
  scheduleOverrides: {
    date: string;
    schedule: DaySchedule;
    reason?: string;
  }[];
}

export const isEmployeeAvailableAtTime = (
  employee: any,
  date: Date,
  timeSlot: string
): { available: boolean; reason?: string } => {
  const dateString = format(date, 'yyyy-MM-dd');
  const dayOfWeek = date.getDay();
  
  // Get work schedule from employee data
  const workSchedule = employee.workSchedule as WorkSchedule | undefined;
  
  if (!workSchedule) {
    // If no schedule defined, assume available (default behavior)
    return { available: true };
  }
  
  // Check for schedule overrides first
  const override = workSchedule.scheduleOverrides?.find(o => o.date === dateString);
  const schedule = override ? override.schedule : workSchedule.defaultSchedule?.[dayOfWeek];
  
  if (!schedule) {
    // No schedule defined for this day, assume available
    return { available: true };
  }
  
  // If employee is off for the entire day
  if (schedule.workType === 'off' && !schedule.startTime && !schedule.endTime) {
    return { 
      available: false, 
      reason: override?.reason || 'Nghỉ'
    };
  }
  
  // If employee has specific working hours
  if (schedule.startTime && schedule.endTime) {
    const timeSlotMinutes = timeToMinutes(timeSlot);
    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    
    // For off periods with specific times (partial day off)
    if (schedule.workType === 'off') {
      // Check if time slot is within the OFF period
      if (timeSlotMinutes >= startMinutes && timeSlotMinutes < endMinutes) {
        return { 
          available: false, 
          reason: override?.reason || `Nghỉ ${schedule.startTime}-${schedule.endTime}`
        };
      }
    } else {
      // For work periods, check if time slot is within working hours
      if (timeSlotMinutes < startMinutes || timeSlotMinutes >= endMinutes) {
        return { 
          available: false, 
          reason: `Không trong giờ làm việc (${schedule.startTime}-${schedule.endTime})`
        };
      }
    }
  }
  
  return { available: true };
};

export const getEmployeeScheduleStatus = (
  employee: any,
  date: Date
): { status: 'working' | 'off' | 'partial'; details?: string } => {
  const dateString = format(date, 'yyyy-MM-dd');
  const dayOfWeek = date.getDay();
  
  const workSchedule = employee.workSchedule as WorkSchedule | undefined;
  
  if (!workSchedule) {
    return { status: 'working' };
  }
  
  // Check for schedule overrides first
  const override = workSchedule.scheduleOverrides?.find(o => o.date === dateString);
  const schedule = override ? override.schedule : workSchedule.defaultSchedule?.[dayOfWeek];
  
  if (!schedule) {
    return { status: 'working' };
  }
  
  if (schedule.workType === 'off') {
    if (schedule.startTime && schedule.endTime) {
      return { 
        status: 'partial', 
        details: `Nghỉ ${schedule.startTime}-${schedule.endTime}`
      };
    } else {
      return { 
        status: 'off', 
        details: override?.reason || 'Nghỉ'
      };
    }
  }
  
  if (schedule.startTime && schedule.endTime) {
    return { 
      status: 'working', 
      details: `${schedule.startTime}-${schedule.endTime}`
    };
  }
  
  return { status: 'working' };
};

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt((parts[1] || '0').slice(0, 2), 10);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};