import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalonStore } from "@/stores/useSalonStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarIcon, Save, Edit, Plus, X, Clock, Settings, Search } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

type WorkType = 'off' | 'full' | 'half' | 'quarter' | 'custom';

interface DaySchedule {
  workType: WorkType;
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

export function WorkScheduleManagement() {
  const { language } = useLanguage();
  const { employees, updateEmployee } = useSalonStore();
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const translations = {
    vi: {
      title: "Quản lý Lịch làm việc",
      subtitle: "Thiết lập lịch làm việc linh hoạt với giờ cụ thể",
      employee: "Nhân viên",
      defaultSchedule: "Lịch mặc định",
      weeklyView: "Xem theo tuần",
      scheduleOverrides: "Điều chỉnh lịch",
      dayOfWeek: {
        0: "CN",
        1: "T2", 
        2: "T3",
        3: "T4",
        4: "T5",
        5: "T6",
        6: "T7"
      },
      dayOfWeekFull: {
        0: "Chủ nhật",
        1: "Thứ hai",
        2: "Thứ ba", 
        3: "Thứ tư",
        4: "Thứ năm",
        5: "Thứ sáu",
        6: "Thứ bảy"
      },
      workTypes: {
        off: "Nghỉ",
        full: "Cả ngày",
        half: "Nửa ngày",
        quarter: "1/4 ngày",
        custom: "Tùy chỉnh"
      },
      actions: "Thao tác",
      edit: "Sửa",
      save: "Lưu",
      cancel: "Hủy",
      addOverride: "Thêm điều chỉnh",
      selectDate: "Chọn ngày",
      startTime: "Giờ bắt đầu",
      endTime: "Giờ kết thúc",
      reason: "Lý do",
      overrideReason: "Lý do điều chỉnh",
      sickLeave: "Nghỉ ốm",
      vacation: "Nghỉ phép",
      extraWork: "Làm thêm",
      personalLeave: "Nghỉ phép riêng",
      other: "Khác",
      thisWeek: "Tuần này",
      nextWeek: "Tuần sau",
      previousWeek: "Tuần trước",
      workType: "Loại ca làm",
      weeklyViewTab: "Xem theo tuần",
      defaultScheduleTab: "Lịch mặc định",
      searchEmployee: "Tìm kiếm nhân viên...",
      noEmployeesFound: "Không tìm thấy nhân viên nào"
    },
    en: {
      title: "Work Schedule Management",
      subtitle: "Set flexible work schedules with specific hours",
      employee: "Employee",
      defaultSchedule: "Default Schedule",
      weeklyView: "Weekly View",
      scheduleOverrides: "Schedule Overrides",
      dayOfWeek: {
        0: "Sun",
        1: "Mon",
        2: "Tue", 
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat"
      },
      dayOfWeekFull: {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday", 
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
      },
      workTypes: {
        off: "Off",
        full: "Full Day",
        half: "Half Day",
        quarter: "Quarter Day",
        custom: "Custom Hours"
      },
      actions: "Actions",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      addOverride: "Add Override",
      selectDate: "Select Date",
      startTime: "Start Time",
      endTime: "End Time",
      reason: "Reason",
      overrideReason: "Override Reason",
      sickLeave: "Sick Leave",
      vacation: "Vacation",
      extraWork: "Extra Work",
      personalLeave: "Personal Leave",
      other: "Other",
      thisWeek: "This Week",
      nextWeek: "Next Week",
      previousWeek: "Previous Week",
      workType: "Work Type",
      weeklyViewTab: "Weekly View",
      defaultScheduleTab: "Default Schedule",
      searchEmployee: "Search employee...",
      noEmployeesFound: "No employees found"
    }
  };

  const text = translations[language];

  const getDefaultHours = (workType: WorkType): { startTime?: string; endTime?: string } => {
    switch (workType) {
      case 'full':
        return { startTime: '08:00', endTime: '18:00' };
      case 'half':
        return { startTime: '08:00', endTime: '13:00' };
      case 'quarter':
        return { startTime: '08:00', endTime: '10:30' };
      default:
        return {};
    }
  };

  useEffect(() => {
    // Initialize schedules from employees
    const initialSchedules: WorkSchedule[] = employees.map(employee => {
      const existingSchedule = (employee as any).workSchedule;
      
      // Create default schedule (Monday to Friday full day, weekends off)
      const defaultSchedule: { [key: number]: DaySchedule } = {};
      for (let i = 0; i <= 6; i++) {
        if (existingSchedule?.defaultSchedule?.[i]) {
          defaultSchedule[i] = existingSchedule.defaultSchedule[i];
        } else {
          // Default: Monday-Friday full day, weekends off
          defaultSchedule[i] = i >= 1 && i <= 5 
            ? { workType: 'full', ...getDefaultHours('full') }
            : { workType: 'off' };
        }
      }

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        defaultSchedule,
        scheduleOverrides: existingSchedule?.scheduleOverrides || []
      };
    });
    setSchedules(initialSchedules);
  }, [employees]);

  const updateSchedule = (employeeId: string, updates: Partial<WorkSchedule>) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.employeeId === employeeId 
        ? { ...schedule, ...updates }
        : schedule
    ));
  };

  const saveSchedule = async (schedule: WorkSchedule) => {
    await updateEmployee(schedule.employeeId, {
      workSchedule: {
        defaultSchedule: schedule.defaultSchedule,
        scheduleOverrides: schedule.scheduleOverrides
      }
    } as any);
    
    // Update local state
    setSchedules(prev => prev.map(s => 
      s.employeeId === schedule.employeeId ? schedule : s
    ));
    
    setIsDialogOpen(false);
    setEditingSchedule(null);
  };

  const openEditDialog = (schedule: WorkSchedule) => {
    setEditingSchedule({ ...schedule });
    setIsDialogOpen(true);
  };

  const getDefaultScheduleSummary = (schedule: WorkSchedule): string => {
    const workingDays = Object.entries(schedule.defaultSchedule)
      .filter(([_, daySchedule]) => daySchedule.workType !== 'off')
      .map(([day, daySchedule]) => {
        const dayName = text.dayOfWeek[parseInt(day) as keyof typeof text.dayOfWeek];
        if (daySchedule.startTime && daySchedule.endTime) {
          return `${dayName} (${daySchedule.startTime}-${daySchedule.endTime})`;
        }
        return `${dayName} (${text.workTypes[daySchedule.workType]})`;
      });
    
    return workingDays.length > 0 ? workingDays.join(', ') : 'Không có ngày làm việc';
  };

  // Helper function to calculate work duration in hours
  const getWorkDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal place
  };

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getEmployeeScheduleForDate = (schedule: WorkSchedule, date: Date): DaySchedule => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const override = schedule.scheduleOverrides.find(o => o.date === dateStr);
    
    if (override) {
      return override.schedule;
    }
    
    return schedule.defaultSchedule[date.getDay()] || { workType: 'off' };
  };

  const getOverrideForDate = (schedule: WorkSchedule, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedule.scheduleOverrides.find(o => o.date === dateStr);
  };

  const formatScheduleDisplay = (daySchedule: DaySchedule): string => {
    // If it's a custom schedule or has specific times, show the hours
    if (daySchedule.startTime && daySchedule.endTime) {
      if (daySchedule.workType === 'off') {
        return `${text.workTypes[daySchedule.workType]} (${daySchedule.startTime}-${daySchedule.endTime})`;
      } else {
        return `${text.workTypes[daySchedule.workType]} (${daySchedule.startTime}-${daySchedule.endTime})`;
      }
    }
    return text.workTypes[daySchedule.workType];
  };

  // Helper function to determine display type for partial schedules
  const getDisplayType = (daySchedule: DaySchedule): string => {
    if (daySchedule.startTime && daySchedule.endTime) {
      const start = new Date(`2000-01-01T${daySchedule.startTime}:00`);
      const end = new Date(`2000-01-01T${daySchedule.endTime}:00`);
      const hours = getWorkDuration(daySchedule.startTime, daySchedule.endTime);
      
      // If it's an off period with specific times, show as partial off
      if (daySchedule.workType === 'off') {
        return 'Nghỉ một phần';
      }
      
      // For work periods, determine if it's partial based on hours
      if (hours < 8) {
        return language === 'vi' ? 'Một phần' : 'Partial';
      }
    }
    return text.workTypes[daySchedule.workType];
  };

  // Filter schedules based on search query
  const filteredSchedules = schedules.filter(schedule =>
    schedule.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{text.title}</h2>
          <p className="text-gray-600 mt-1">{text.subtitle}</p>
        </div>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">{text.weeklyViewTab}</TabsTrigger>
          <TabsTrigger value="schedule">{text.defaultScheduleTab}</TabsTrigger>
        </TabsList>

        {/* Weekly View Tab */}
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{text.weeklyView}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
                  >
                    {text.previousWeek}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWeek(new Date())}
                  >
                    {text.thisWeek}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
                  >
                    {text.nextWeek}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search Bar for Weekly View */}
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={text.searchEmployee}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">{text.employee}</TableHead>
                      {getWeekDays(selectedWeek).map((date, index) => (
                        <TableHead key={index} className="text-center min-w-36">
                          <div className="text-xs text-gray-500">
                            {text.dayOfWeek[date.getDay() as keyof typeof text.dayOfWeek]}
                          </div>
                          <div className="font-semibold">
                            {format(date, 'dd/MM', { locale: vi })}
                          </div>
                        </TableHead>
                      ))}
                   </TableRow>
                   </TableHeader>
                   <TableBody>
                     {filteredSchedules.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                           {text.noEmployeesFound}
                         </TableCell>
                       </TableRow>
                     ) : (
                       filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.employeeId}>
                        <TableCell className="font-medium">{schedule.employeeName}</TableCell>
                        {getWeekDays(selectedWeek).map((date, index) => {
                          const daySchedule = getEmployeeScheduleForDate(schedule, date);
                          const override = getOverrideForDate(schedule, date);
                          
                          return (
                            <TableCell key={index} className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                {/* Work Type Badge */}
                                 <div className="flex flex-col items-center gap-1">
                                   <Badge 
                                     variant={daySchedule.workType === 'off' ? "secondary" : "default"}
                                     className={
                                       daySchedule.workType === 'off' 
                                         ? "bg-gray-100 text-gray-700 text-xs" 
                                         : daySchedule.workType === 'full'
                                           ? "bg-green-100 text-green-700 text-xs"
                                           : daySchedule.workType === 'half'
                                             ? "bg-blue-100 text-blue-700 text-xs"
                                             : daySchedule.workType === 'quarter'
                                               ? "bg-yellow-100 text-yellow-700 text-xs"
                                               : "bg-purple-100 text-purple-700 text-xs"
                                     }
                                   >
                                     {daySchedule.startTime && daySchedule.endTime 
                                       ? getDisplayType(daySchedule)
                                       : text.workTypes[daySchedule.workType]
                                     }
                                   </Badge>
                                  
                                   {/* Time Range - Show for all types including 'off' when there are specific times */}
                                   {((daySchedule.workType !== 'off' && daySchedule.startTime && daySchedule.endTime) || 
                                     (daySchedule.workType === 'off' && daySchedule.startTime && daySchedule.endTime)) && (
                                     <div className="text-xs text-gray-600 font-mono">
                                       {daySchedule.startTime}-{daySchedule.endTime}
                                     </div>
                                   )}
                                  
                                  {/* Work Duration Indicator */}
                                  {daySchedule.workType !== 'off' && daySchedule.startTime && daySchedule.endTime && (
                                    <div className="text-xs text-gray-500">
                                      {getWorkDuration(daySchedule.startTime, daySchedule.endTime)}h
                                    </div>
                                  )}
                                </div>
                                
                                {/* Override reason */}
                                {override && (
                                  <div className="text-xs text-orange-600 bg-orange-50 px-1 rounded max-w-20 truncate">
                                    {override.reason}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                         })}
                       </TableRow>
                       ))
                     )}
                   </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Default Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>{text.defaultSchedule}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Bar for Default Schedule */}
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={text.searchEmployee}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredSchedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {text.noEmployeesFound}
                  </div>
                ) : (
                  filteredSchedules.map((schedule) => (
                  <div key={schedule.employeeId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{schedule.employeeName}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Lịch mặc định:</strong> {getDefaultScheduleSummary(schedule)}
                      </p>
                      {schedule.scheduleOverrides.length > 0 && (
                        <p className="text-sm text-blue-600">
                          {schedule.scheduleOverrides.length} điều chỉnh đặc biệt
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => openEditDialog(schedule)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa lịch làm việc - {editingSchedule?.employeeName}
            </DialogTitle>
          </DialogHeader>
          {editingSchedule && (
            <ScheduleEditForm
              schedule={editingSchedule}
              onSave={saveSchedule}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingSchedule(null);
              }}
              text={text}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Schedule Edit Form Component
function ScheduleEditForm({ 
  schedule, 
  onSave, 
  onCancel, 
  text 
}: { 
  schedule: WorkSchedule; 
  onSave: (schedule: WorkSchedule) => void;
  onCancel: () => void;
  text: any;
}) {
  const [editedSchedule, setEditedSchedule] = useState<WorkSchedule>(schedule);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getDefaultHours = (workType: WorkType): { startTime?: string; endTime?: string } => {
    switch (workType) {
      case 'full':
        return { startTime: '08:00', endTime: '18:00' };
      case 'half':
        return { startTime: '08:00', endTime: '13:00' };
      case 'quarter':
        return { startTime: '08:00', endTime: '10:30' };
      default:
        return {};
    }
  };

  const addOverride = (date: string, scheduleData: DaySchedule, reason: string) => {
    setEditedSchedule(prev => ({
      ...prev,
      scheduleOverrides: [
        ...prev.scheduleOverrides.filter(o => o.date !== date),
        { date, schedule: scheduleData, reason }
      ]
    }));
  };

  const removeOverride = (date: string) => {
    setEditedSchedule(prev => ({
      ...prev,
      scheduleOverrides: prev.scheduleOverrides.filter(o => o.date !== date)
    }));
  };

  const handleDayScheduleChange = (dayIndex: number, workType: WorkType) => {
    const defaultHours = getDefaultHours(workType);
    setEditedSchedule(prev => ({
      ...prev,
      defaultSchedule: {
        ...prev.defaultSchedule,
        [dayIndex]: {
          workType,
          ...defaultHours
        }
      }
    }));
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setEditedSchedule(prev => ({
      ...prev,
      defaultSchedule: {
        ...prev.defaultSchedule,
        [dayIndex]: {
          ...prev.defaultSchedule[dayIndex],
          [field]: value
        }
      }
    }));
  };

  const handleDateScheduleChange = (date: Date, workType: WorkType) => {
    const defaultHours = getDefaultHours(workType);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Remove existing override for this date first
    const filteredOverrides = editedSchedule.scheduleOverrides.filter(o => o.date !== dateStr);
    
    // Add new override
    setEditedSchedule(prev => ({
      ...prev,
      scheduleOverrides: [
        ...filteredOverrides,
        {
          date: dateStr,
          schedule: {
            workType,
            ...defaultHours
          },
          reason: 'Điều chỉnh lịch'
        }
      ]
    }));
  };

  const handleDateTimeChange = (date: Date, field: 'startTime' | 'endTime', value: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingOverride = editedSchedule.scheduleOverrides.find(o => o.date === dateStr);
    
    if (existingOverride) {
      // Update existing override
      setEditedSchedule(prev => ({
        ...prev,
        scheduleOverrides: prev.scheduleOverrides.map(override =>
          override.date === dateStr
            ? {
                ...override,
                schedule: {
                  ...override.schedule,
                  [field]: value
                }
              }
            : override
        )
      }));
    } else {
      // Create new override
      const dayIndex = date.getDay();
      const currentDaySchedule = editedSchedule.defaultSchedule[dayIndex] || { workType: 'off' };
      
      setEditedSchedule(prev => ({
        ...prev,
        scheduleOverrides: [
          ...prev.scheduleOverrides,
          {
            date: dateStr,
            schedule: {
              ...currentDaySchedule,
              [field]: value
            },
            reason: 'Điều chỉnh giờ làm'
          }
        ]
      }));
    }
  };

  const getScheduleForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const override = editedSchedule.scheduleOverrides.find(o => o.date === dateStr);
    
    if (override) {
      return override.schedule;
    }
    
    // Return default schedule for this day of week
    const dayIndex = date.getDay();
    return editedSchedule.defaultSchedule[dayIndex] || { workType: 'off' };
  };

  const formatScheduleDisplay = (daySchedule: DaySchedule): string => {
    const workType = text.workTypes[daySchedule.workType];
    if (daySchedule.workType === 'custom' || (daySchedule.workType !== 'off' && daySchedule.startTime && daySchedule.endTime)) {
      return `${workType} (${daySchedule.startTime}-${daySchedule.endTime})`;
    }
    return workType;
  };

  return (
    <div className="space-y-6">
      {/* Date-Based Schedule Editor */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Chỉnh sửa lịch làm việc theo ngày</h3>
        
        {/* Date Picker */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Chọn ngày cần chỉnh sửa</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Schedule Editor for Selected Date */}
        {selectedDate && (() => {
          const currentSchedule = getScheduleForDate(selectedDate);
          const dayOfWeek = text.dayOfWeekFull[selectedDate.getDay() as keyof typeof text.dayOfWeekFull];
          
          return (
            <div className="border rounded-lg p-6 space-y-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-lg">
                  {format(selectedDate, "dd/MM/yyyy", { locale: vi })} - {dayOfWeek}
                </h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">{text.workType}</Label>
                  <Select
                    value={currentSchedule.workType}
                    onValueChange={(value: WorkType) => handleDateScheduleChange(selectedDate, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">{text.workTypes.off}</SelectItem>
                      <SelectItem value="full">{text.workTypes.full}</SelectItem>
                      <SelectItem value="half">{text.workTypes.half}</SelectItem>
                      <SelectItem value="quarter">{text.workTypes.quarter}</SelectItem>
                      <SelectItem value="custom">{text.workTypes.custom}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentSchedule.workType !== 'off' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">{text.startTime}</Label>
                      <Input
                        type="time"
                        value={currentSchedule.startTime || ''}
                        onChange={(e) => handleDateTimeChange(selectedDate, 'startTime', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">{text.endTime}</Label>
                      <Input
                        type="time"
                        value={currentSchedule.endTime || ''}
                        onChange={(e) => handleDateTimeChange(selectedDate, 'endTime', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Schedule Overrides */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Điều chỉnh lịch</h3>
          <ScheduleOverrideDialog
            schedule={editedSchedule}
            onAddOverride={addOverride}
            text={text}
          />
        </div>
        
        {editedSchedule.scheduleOverrides.length > 0 ? (
          <div className="space-y-2">
            {editedSchedule.scheduleOverrides.map((override, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {format(new Date(override.date), 'dd/MM/yyyy')}
                  </div>
                  <Badge 
                    variant={override.schedule.workType === 'off' ? "secondary" : "default"}
                    className={override.schedule.workType === 'off' 
                      ? "bg-gray-100 text-gray-700" 
                      : "bg-blue-100 text-blue-700"
                    }
                  >
                    {formatScheduleDisplay(override.schedule)}
                  </Badge>
                  {override.reason && (
                    <span className="text-xs text-gray-500">({override.reason})</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeOverride(override.date)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Chưa có điều chỉnh nào
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={() => onSave(editedSchedule)}>
          <Save className="w-4 h-4 mr-2" />
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}

// Schedule Override Dialog Component  
function ScheduleOverrideDialog({ 
  schedule, 
  onAddOverride, 
  text 
}: { 
  schedule: WorkSchedule; 
  onAddOverride: (date: string, scheduleData: DaySchedule, reason: string) => void;
  text: any;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [overrideReason, setOverrideReason] = useState("");
  const [workType, setWorkType] = useState<WorkType>('off');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [open, setOpen] = useState(false);

  const getDefaultHours = (workType: WorkType): { startTime?: string; endTime?: string } => {
    switch (workType) {
      case 'full':
        return { startTime: '08:00', endTime: '18:00' };
      case 'half':
        return { startTime: '08:00', endTime: '13:00' };
      case 'quarter':
        return { startTime: '08:00', endTime: '10:30' };
      default:
        return {};
    }
  };

  const handleWorkTypeChange = (newWorkType: WorkType) => {
    setWorkType(newWorkType);
    const defaultHours = getDefaultHours(newWorkType);
    setStartTime(defaultHours.startTime || '');
    setEndTime(defaultHours.endTime || '');
  };

  const handleAddOverride = () => {
    if (selectedDate && overrideReason) {
      const scheduleData: DaySchedule = {
        workType,
        ...(workType !== 'off' && { startTime, endTime })
      };
      
      onAddOverride(
        format(selectedDate, 'yyyy-MM-dd'),
        scheduleData,
        overrideReason
      );
      
      // Reset form
      setSelectedDate(undefined);
      setOverrideReason("");
      setWorkType('off');
      setStartTime('');
      setEndTime('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Thêm điều chỉnh
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <div>
            <Label>Chọn ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>Loại ca làm</Label>
            <Select value={workType} onValueChange={handleWorkTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Nghỉ</SelectItem>
                <SelectItem value="full">Cả ngày</SelectItem>
                <SelectItem value="half">Nửa ngày</SelectItem>
                <SelectItem value="quarter">1/4 ngày</SelectItem>
                <SelectItem value="custom">Tùy chỉnh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {workType !== 'off' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Giờ bắt đầu</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Giờ kết thúc</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Lý do</Label>
            <Select value={overrideReason} onValueChange={setOverrideReason}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">Nghỉ ốm</SelectItem>
                <SelectItem value="vacation">Nghỉ phép</SelectItem>
                <SelectItem value="extra">Làm thêm</SelectItem>
                <SelectItem value="personal">Nghỉ phép riêng</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={handleAddOverride}
            disabled={!selectedDate || !overrideReason}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm điều chỉnh
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}