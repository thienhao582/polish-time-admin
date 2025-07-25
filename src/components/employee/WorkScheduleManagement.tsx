import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSalonStore } from "@/stores/useSalonStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarIcon, Save, Edit, Plus, X, Check } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";

interface WorkSchedule {
  employeeId: string;
  employeeName: string;
  defaultWorkDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  scheduleOverrides: {
    date: string;
    isWorking: boolean;
    reason?: string;
  }[];
}

export function WorkScheduleManagement() {
  const { language } = useLanguage();
  const { employees, updateEmployee } = useSalonStore();
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [overrideReason, setOverrideReason] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const translations = {
    vi: {
      title: "Quản lý Lịch làm việc",
      subtitle: "Thiết lập lịch làm việc mặc định và điều chỉnh cho từng ngày",
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
      actions: "Thao tác",
      edit: "Sửa",
      save: "Lưu",
      cancel: "Hủy",
      addOverride: "Thêm điều chỉnh",
      selectDate: "Chọn ngày",
      working: "Làm việc",
      notWorking: "Nghỉ",
      reason: "Lý do",
      overrideReason: "Lý do điều chỉnh",
      sickLeave: "Nghỉ ốm",
      vacation: "Nghỉ phép",
      extraWork: "Làm thêm",
      other: "Khác",
      thisWeek: "Tuần này",
      nextWeek: "Tuần sau",
      previousWeek: "Tuần trước"
    },
    en: {
      title: "Work Schedule Management",
      subtitle: "Set default work schedules and adjust for specific days",
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
      actions: "Actions",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      addOverride: "Add Override",
      selectDate: "Select Date",
      working: "Working",
      notWorking: "Not Working",
      reason: "Reason",
      overrideReason: "Override Reason",
      sickLeave: "Sick Leave",
      vacation: "Vacation",
      extraWork: "Extra Work",
      other: "Other",
      thisWeek: "This Week",
      nextWeek: "Next Week",
      previousWeek: "Previous Week"
    }
  };

  const text = translations[language];

  useEffect(() => {
    // Initialize schedules from employees
    const initialSchedules: WorkSchedule[] = employees.map(employee => ({
      employeeId: employee.id,
      employeeName: employee.name,
      defaultWorkDays: (employee as any).defaultWorkDays || [],
      scheduleOverrides: (employee as any).scheduleOverrides || []
    }));
    setSchedules(initialSchedules);
  }, [employees]);

  const updateSchedule = (employeeId: string, updates: Partial<WorkSchedule>) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.employeeId === employeeId 
        ? { ...schedule, ...updates }
        : schedule
    ));
  };

  const saveSchedule = async (employeeId: string) => {
    const schedule = schedules.find(s => s.employeeId === employeeId);
    if (schedule) {
      await updateEmployee(employeeId, {
        defaultWorkDays: schedule.defaultWorkDays,
        scheduleOverrides: schedule.scheduleOverrides
      } as any);
    }
    setEditingEmployee(null);
  };

  const handleDayToggle = (employeeId: string, dayIndex: number, checked: boolean) => {
    const schedule = schedules.find(s => s.employeeId === employeeId);
    if (schedule) {
      const newWorkDays = checked 
        ? [...schedule.defaultWorkDays, dayIndex].sort()
        : schedule.defaultWorkDays.filter(day => day !== dayIndex);
      updateSchedule(employeeId, { defaultWorkDays: newWorkDays });
    }
  };

  const addOverride = (employeeId: string, date: string, isWorking: boolean, reason: string) => {
    const schedule = schedules.find(s => s.employeeId === employeeId);
    if (schedule) {
      const newOverrides = [
        ...schedule.scheduleOverrides.filter(o => o.date !== date),
        { date, isWorking, reason }
      ];
      updateSchedule(employeeId, { scheduleOverrides: newOverrides });
    }
  };

  const removeOverride = (employeeId: string, date: string) => {
    const schedule = schedules.find(s => s.employeeId === employeeId);
    if (schedule) {
      const newOverrides = schedule.scheduleOverrides.filter(o => o.date !== date);
      updateSchedule(employeeId, { scheduleOverrides: newOverrides });
    }
  };

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const isEmployeeWorkingOnDate = (schedule: WorkSchedule, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const override = schedule.scheduleOverrides.find(o => o.date === dateStr);
    
    if (override) {
      return override.isWorking;
    }
    
    return schedule.defaultWorkDays.includes(date.getDay());
  };

  const getOverrideForDate = (schedule: WorkSchedule, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedule.scheduleOverrides.find(o => o.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{text.title}</h2>
          <p className="text-gray-600 mt-1">{text.subtitle}</p>
        </div>
      </div>

      {/* Weekly View */}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">{text.employee}</TableHead>
                  {getWeekDays(selectedWeek).map((date, index) => (
                    <TableHead key={index} className="text-center min-w-24">
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
                {schedules.map((schedule) => (
                  <TableRow key={schedule.employeeId}>
                    <TableCell className="font-medium">{schedule.employeeName}</TableCell>
                    {getWeekDays(selectedWeek).map((date, index) => {
                      const isWorking = isEmployeeWorkingOnDate(schedule, date);
                      const override = getOverrideForDate(schedule, date);
                      
                      return (
                        <TableCell key={index} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge 
                              variant={isWorking ? "default" : "secondary"}
                              className={isWorking ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                            >
                              {isWorking ? text.working : text.notWorking}
                            </Badge>
                            {override && (
                              <div className="text-xs text-gray-500 max-w-20 truncate">
                                {override.reason}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Employee Schedules Management */}
      <Card>
        <CardHeader>
          <CardTitle>{text.defaultSchedule}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.employeeId} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{schedule.employeeName}</h3>
                  <div className="flex gap-2">
                    {editingEmployee === schedule.employeeId ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => saveSchedule(schedule.employeeId)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {text.save}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEmployee(null)}
                        >
                          {text.cancel}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEmployee(schedule.employeeId)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {text.edit}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Default Work Days */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">{text.defaultSchedule}</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => (
                      <div key={dayIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${schedule.employeeId}-day-${dayIndex}`}
                          checked={schedule.defaultWorkDays.includes(dayIndex)}
                          onCheckedChange={(checked) => 
                            editingEmployee === schedule.employeeId && 
                            handleDayToggle(schedule.employeeId, dayIndex, checked as boolean)
                          }
                          disabled={editingEmployee !== schedule.employeeId}
                        />
                        <Label 
                          htmlFor={`${schedule.employeeId}-day-${dayIndex}`}
                          className="text-sm"
                        >
                          {text.dayOfWeekFull[dayIndex as keyof typeof text.dayOfWeekFull]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule Overrides */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">{text.scheduleOverrides}</Label>
                    {editingEmployee === schedule.employeeId && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            {text.addOverride}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-4">
                            <div>
                              <Label>{text.selectDate}</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : text.selectDate}
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
                              <Label>{text.reason}</Label>
                              <Select value={overrideReason} onValueChange={setOverrideReason}>
                                <SelectTrigger>
                                  <SelectValue placeholder={text.overrideReason} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sick">{text.sickLeave}</SelectItem>
                                  <SelectItem value="vacation">{text.vacation}</SelectItem>
                                  <SelectItem value="extra">{text.extraWork}</SelectItem>
                                  <SelectItem value="other">{text.other}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (selectedDate && overrideReason) {
                                    addOverride(
                                      schedule.employeeId,
                                      format(selectedDate, 'yyyy-MM-dd'),
                                      false,
                                      overrideReason
                                    );
                                    setSelectedDate(undefined);
                                    setOverrideReason("");
                                  }
                                }}
                                disabled={!selectedDate || !overrideReason}
                              >
                                <X className="w-4 h-4 mr-2" />
                                {text.notWorking}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (selectedDate && overrideReason) {
                                    addOverride(
                                      schedule.employeeId,
                                      format(selectedDate, 'yyyy-MM-dd'),
                                      true,
                                      overrideReason
                                    );
                                    setSelectedDate(undefined);
                                    setOverrideReason("");
                                  }
                                }}
                                disabled={!selectedDate || !overrideReason}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                {text.working}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {schedule.scheduleOverrides.map((override, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {format(new Date(override.date), 'dd/MM/yyyy')}
                          </span>
                          <Badge variant={override.isWorking ? "default" : "secondary"}>
                            {override.isWorking ? text.working : text.notWorking}
                          </Badge>
                          <span className="text-sm text-gray-600">{override.reason}</span>
                        </div>
                        {editingEmployee === schedule.employeeId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeOverride(schedule.employeeId, override.date)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {schedule.scheduleOverrides.length === 0 && (
                      <p className="text-sm text-gray-500 italic">Chưa có điều chỉnh nào</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}