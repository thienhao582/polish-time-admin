
import { useState } from "react";
import { Clock, Calendar as CalendarIcon, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useSalonStore } from "@/stores/useSalonStore";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { vi } from "date-fns/locale";

const TimeTracking = () => {
  const { 
    employees, 
    timeRecords, 
    checkIn, 
    checkOut, 
    getTimeRecordsForEmployee, 
    getTotalHoursForEmployee 
  } = useSalonStore();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const activeEmployees = employees.filter(e => e.status === "đang làm");
  const today = new Date().toISOString().split('T')[0];
  
  const getTodayRecord = (employeeId: string) => {
    return timeRecords.find(r => r.employeeId === employeeId && r.date === today);
  };

  const handleCheckIn = (employeeId: string) => {
    checkIn(employeeId);
  };

  const handleCheckOut = (employeeId: string) => {
    checkOut(employeeId);
  };

  const getEmployeeRecords = () => {
    if (!selectedEmployee) return [];
    
    const startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
    
    return getTimeRecordsForEmployee(selectedEmployee, startDate, endDate);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      working: { label: "Đang làm", variant: "default" as const, color: "bg-green-100 text-green-700" },
      completed: { label: "Hoàn thành", variant: "secondary" as const, color: "bg-blue-100 text-blue-700" },
      absent: { label: "Vắng mặt", variant: "destructive" as const, color: "" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Chấm công</h1>
          <p className="text-gray-600 mt-1">Quản lý giờ làm việc của nhân viên</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Hôm nay</p>
          <p className="text-lg font-semibold">{format(new Date(), "EEEE, dd MMMM yyyy", { locale: vi })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Đang làm việc</p>
                <p className="text-2xl font-bold">
                  {timeRecords.filter(r => r.date === today && r.status === 'working').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold">
                  {timeRecords.filter(r => r.date === today && r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600">Tổng giờ hôm nay</p>
                <p className="text-2xl font-bold">
                  {timeRecords
                    .filter(r => r.date === today && r.totalHours)
                    .reduce((sum, r) => sum + (r.totalHours || 0), 0)
                    .toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Nhân viên hoạt động</p>
                <p className="text-2xl font-bold">{activeEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checkin" className="space-y-6">
        <TabsList>
          <TabsTrigger value="checkin">Chấm công hôm nay</TabsTrigger>
          <TabsTrigger value="history">Lịch sử chấm công</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin">
          <Card>
            <CardHeader>
              <CardTitle>Chấm công hôm nay - {format(new Date(), "dd/MM/yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {activeEmployees.map((employee) => {
                  const todayRecord = getTodayRecord(employee.id);
                  const isWorking = todayRecord?.status === 'working';
                  const hasCheckedIn = todayRecord?.checkIn;
                  
                  return (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {todayRecord && (
                          <div className="text-sm">
                            {todayRecord.checkIn && (
                              <p>Vào: <span className="font-medium">{todayRecord.checkIn}</span></p>
                            )}
                            {todayRecord.checkOut && (
                              <p>Ra: <span className="font-medium">{todayRecord.checkOut}</span></p>
                            )}
                            {todayRecord.totalHours && (
                              <p>Tổng: <span className="font-medium">{todayRecord.totalHours}h</span></p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          {todayRecord && getStatusBadge(todayRecord.status)}
                          
                          {!hasCheckedIn ? (
                            <Button
                              onClick={() => handleCheckIn(employee.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Vào ca
                            </Button>
                          ) : isWorking ? (
                            <Button
                              onClick={() => handleCheckOut(employee.id)}
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Kết thúc ca
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleCheckIn(employee.id)}
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                              Vào ca lại
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Lọc dữ liệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Chọn nhân viên</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Tất cả nhân viên</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Chọn tháng</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="w-fit"
                  />
                </div>

                {selectedEmployee && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Thống kê</h4>
                    <div className="space-y-2 text-sm">
                      <p>Tuần này: <span className="font-medium">{getTotalHoursForEmployee(selectedEmployee, 'week')}h</span></p>
                      <p>Tháng này: <span className="font-medium">{getTotalHoursForEmployee(selectedEmployee, 'month')}h</span></p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>
                  Lịch sử chấm công - {format(selectedDate, "MMMM yyyy", { locale: vi })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Giờ vào</TableHead>
                      <TableHead>Giờ ra</TableHead>
                      <TableHead>Tổng giờ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getEmployeeRecords().map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{record.employeeName}</TableCell>
                        <TableCell>{record.checkIn || "-"}</TableCell>
                        <TableCell>{record.checkOut || "-"}</TableCell>
                        <TableCell>{record.totalHours ? `${record.totalHours}h` : "-"}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeTracking;
