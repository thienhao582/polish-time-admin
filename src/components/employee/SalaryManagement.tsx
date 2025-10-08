import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSalonStore } from "@/stores/useSalonStore";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarIcon, DollarSign, TrendingUp, FileText } from "lucide-react";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { PayslipDialog } from "./PayslipDialog";
import { cn } from "@/lib/utils";

interface SalaryCalculation {
  employeeId: string;
  employeeName: string;
  totalEarnings: number;
  appointmentCount: number;
  commissionRate: number;
  averageServicePrice: number;
}

export function SalaryManagement() {
  const { language, t } = useLanguage();
  const { employees } = useSalonStore();
  const { fetchAppointments } = useSupabaseData();
  const { isDemoMode } = useDemoMode();
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [salaryData, setSalaryData] = useState<SalaryCalculation[]>([]);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);

  const translations = {
    vi: {
      title: "Quản lý Lương",
      subtitle: "Tính toán và quản lý hoa hồng nhân viên",
      period: "Kỳ tính lương",
      thisMonth: "Tháng này",
      lastMonth: "Tháng trước",
      last7Days: "7 ngày qua",
      last30Days: "30 ngày qua",
      customRange: "Tùy chọn ngày",
      fromDate: "Từ ngày",
      toDate: "Đến ngày",
      employee: "Nhân viên",
      commissionRate: "Tỷ lệ hoa hồng",
      appointments: "Lịch hẹn",
      avgServicePrice: "Giá TB dịch vụ",
      totalEarnings: "Tổng thu nhập",
      actions: "Thao tác",
      payslip: "Phiếu Lương",
      calculate: "Tính toán",
      noData: "Chưa có dữ liệu lương cho kỳ này",
      summary: "Tổng kết",
      totalStaff: "Tổng nhân viên",
      totalEarningsAll: "Tổng thu nhập",
      avgCommission: "Hoa hồng TB"
    },
    en: {
      title: "Salary Management",
      subtitle: "Calculate and manage employee commissions",
      period: "Salary Period",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      customRange: "Custom Range",
      fromDate: "From Date",
      toDate: "To Date",
      employee: "Employee",
      commissionRate: "Commission Rate",
      appointments: "Appointments",
      avgServicePrice: "Avg Service Price",
      totalEarnings: "Total Earnings",
      actions: "Actions",
      payslip: "Payslip",
      calculate: "Calculate",
      noData: "No salary data for this period",
      summary: "Summary",
      totalStaff: "Total Staff",
      totalEarningsAll: "Total Earnings",
      avgCommission: "Avg Commission"
    }
  };

  const text = translations[language];

  const calculateSalaryData = async () => {
    try {
      const appointments = await fetchAppointments();
      setAllAppointments(appointments);
      
      let startDate: Date;
      let endDate = new Date();
      
      switch (selectedPeriod) {
        case "this-month":
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          break;
        case "last-month":
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case "last-7-days":
          startDate = subDays(new Date(), 7);
          break;
        case "last-30-days":
          startDate = subDays(new Date(), 30);
          break;
        case "custom-range":
          if (customStartDate && customEndDate) {
            startDate = customStartDate;
            endDate = customEndDate;
          } else {
            startDate = startOfMonth(new Date());
            endDate = endOfMonth(new Date());
          }
          break;
        default:
          startDate = startOfMonth(new Date());
      }

      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= startDate && aptDate <= endDate;
      });

      // Demo mode: Generate realistic salary data for employees
      if (isDemoMode && filteredAppointments.length === 0) {
        const demoEmployeeNames = ["Trần My", "Lý Nhung", "Võ Giang", "Đặng Hoài", "Nguyễn Mai"];
        const salaryCalculations: SalaryCalculation[] = employees.slice(0, 10).map((employee, index) => {
          // Generate varied data for first 5 employees
          const isActive = index < 5;
          const appointmentCount = isActive ? Math.floor(8 + Math.random() * 15) : 0;
          const avgPrice = isActive ? 2.5 + Math.random() * 2 : 0; // $2.5-$4.5
          const totalServicePrice = appointmentCount * avgPrice;
          const commissionRate = 0.10 + Math.random() * 0.05; // 10-15%
          const totalEarnings = totalServicePrice * commissionRate;

          return {
            employeeId: employee.id,
            employeeName: employee.name,
            totalEarnings: Math.round(totalEarnings * 100) / 100,
            appointmentCount,
            commissionRate,
            averageServicePrice: Math.round(avgPrice * 100) / 100
          };
        });

        setSalaryData(salaryCalculations);
        return;
      }

      const salaryCalculations: SalaryCalculation[] = employees.map(employee => {
        let employeeAppointments = filteredAppointments.filter(
          apt => apt.employee_id === employee.id
        );

        const totalServicePrice = employeeAppointments.reduce(
          (sum, apt) => sum + (apt.price || 0), 0
        );

        const commissionRate = (employee as any).commission_rate || 0.10;
        const totalEarnings = totalServicePrice * commissionRate;
        const averageServicePrice = employeeAppointments.length > 0 
          ? totalServicePrice / employeeAppointments.length 
          : 0;

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          totalEarnings,
          appointmentCount: employeeAppointments.length,
          commissionRate,
          averageServicePrice
        };
      });

      setSalaryData(salaryCalculations);
    } catch (error) {
      console.error("Error calculating salary data:", error);
    }
  };

  const handleViewPayslip = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  const getEmployeeAppointments = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const salaryCalc = salaryData.find(s => s.employeeId === employeeId);
    
    let startDate: Date;
    let endDate = new Date();
    
    switch (selectedPeriod) {
      case "this-month":
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
      case "last-month":
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "last-7-days":
        startDate = subDays(new Date(), 7);
        break;
      case "last-30-days":
        startDate = subDays(new Date(), 30);
        break;
      case "custom-range":
        if (customStartDate && customEndDate) {
          startDate = customStartDate;
          endDate = customEndDate;
        } else {
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
        }
        break;
      default:
        startDate = startOfMonth(new Date());
    }

    const filteredAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return apt.employee_id === employeeId && aptDate >= startDate && aptDate <= endDate;
    });

    // Demo mode: Generate mock appointment details
    if (isDemoMode && filteredAppointments.length === 0 && salaryCalc && salaryCalc.appointmentCount > 0) {
      const services = ["Gel Nails", "Pedicure", "Manicure", "Acrylic Full Set", "Nail Art", "Gel Polish Change", "French Manicure", "Nail Repair"];
      const customers = ["Nguyễn Thị A", "Trần Văn B", "Lê Thị C", "Phạm Thị D", "Hoàng Văn E", "Đỗ Thị F", "Vũ Văn G", "Bùi Thị H"];
      
      const mockAppointments = Array.from({ length: salaryCalc.appointmentCount }, (_, i) => {
        const daysAgo = Math.floor(Math.random() * 28);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];
        
        const price = salaryCalc.averageServicePrice + (Math.random() - 0.5) * 1;
        const tip = Math.random() > 0.3 ? (0.21 + Math.random() * 0.62) : 0; // $0.21-$0.83 or 0
        const supply = 0.13 + Math.random() * 0.29; // $0.13-$0.42
        const discount = Math.random() > 0.7 ? (0.21 + Math.random() * 0.42) : 0; // $0.21-$0.63 or 0
        
        return {
          id: `mock-${i}`,
          date: dateStr,
          service: services[Math.floor(Math.random() * services.length)],
          tip: Math.round(tip * 100) / 100,
          supply: Math.round(supply * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          price: Math.round(price * 100) / 100
        };
      });

      // Sort by date
      mockAppointments.sort((a, b) => a.date.localeCompare(b.date));
      
      const uniqueDates = new Set(mockAppointments.map(apt => apt.date));
      const workingDays = uniqueDates.size;

      return {
        appointments: mockAppointments,
        workingDays
      };
    }

    const uniqueDates = new Set(filteredAppointments.map(apt => apt.appointment_date));
    const workingDays = uniqueDates.size;

    // Generate realistic mock data for each appointment (in USD)
    return {
      appointments: filteredAppointments.map((apt, index) => {
        const price = apt.price || (1.67 + Math.random() * 2.5); // 40-100k VND in USD
        
        const tipOptions = [0.21, 0.33, 0.42, 0.50, 0.63, 0.75, 0.83, 0]; // USD tips
        const tip = tipOptions[Math.floor(Math.random() * tipOptions.length)];
        
        const supplyOptions = [0.13, 0.17, 0.21, 0.25, 0.29, 0.33, 0.38, 0.42]; // USD supply costs
        const supply = supplyOptions[Math.floor(Math.random() * supplyOptions.length)];
        
        const hasDiscount = Math.random() > 0.7;
        const discount = hasDiscount ? (0.21 + Math.floor(Math.random() * 10) * 0.04) : 0; // USD discounts
        
        return {
          id: apt.id,
          date: apt.appointment_date,
          service: apt.service_name || `Service ${index + 1}`,
          tip,
          supply,
          discount,
          price: Math.round(price * 100) / 100
        };
      }),
      workingDays
    };
  };

  // Auto-calculate on component mount
  useEffect(() => {
    calculateSalaryData();
  }, []);

  const getSelectDisplayValue = () => {
    if (selectedPeriod === "custom-range" && customStartDate && customEndDate) {
      return `${format(customStartDate, "dd/MM/yyyy")} - ${format(customEndDate, "dd/MM/yyyy")}`;
    }
    return undefined; // Let Select component handle default display
  };

  const summaryStats = useMemo(() => {
    const totalEarnings = salaryData.reduce((sum, item) => sum + item.totalEarnings, 0);
    const totalAppointments = salaryData.reduce((sum, item) => sum + item.appointmentCount, 0);
    const avgCommission = salaryData.length > 0 
      ? salaryData.reduce((sum, item) => sum + item.commissionRate, 0) / salaryData.length
      : 0;

    return {
      totalStaff: salaryData.length,
      totalEarnings,
      totalAppointments,
      avgCommission: avgCommission * 100 // Convert to percentage
    };
  }, [salaryData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{text.title}</h2>
          <p className="text-gray-600 mt-1">{text.subtitle}</p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="period">{text.period}</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {getSelectDisplayValue() || (
                      selectedPeriod === "this-month" ? text.thisMonth :
                      selectedPeriod === "last-month" ? text.lastMonth :
                      selectedPeriod === "last-7-days" ? text.last7Days :
                      selectedPeriod === "last-30-days" ? text.last30Days :
                      selectedPeriod === "custom-range" ? text.customRange :
                      text.thisMonth
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">{text.thisMonth}</SelectItem>
                  <SelectItem value="last-month">{text.lastMonth}</SelectItem>
                  <SelectItem value="last-7-days">{text.last7Days}</SelectItem>
                  <SelectItem value="last-30-days">{text.last30Days}</SelectItem>
                  <SelectItem value="custom-range">{text.customRange}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={calculateSalaryData} className="mt-6">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {text.calculate}
            </Button>
          </div>

          {/* Custom Date Range Pickers */}
          {selectedPeriod === "custom-range" && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex-1">
                <Label>{text.fromDate}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "PPP") : <span>{text.fromDate}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label>{text.toDate}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "PPP") : <span>{text.toDate}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {salaryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">{text.totalStaff}</p>
                  <p className="text-2xl font-bold">{summaryStats.totalStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">{text.totalEarningsAll}</p>
                  <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">{text.appointments}</p>
                  <p className="text-2xl font-bold">{summaryStats.totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">{text.avgCommission}</p>
                  <p className="text-2xl font-bold">{summaryStats.avgCommission.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle>{text.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {salaryData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {text.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{text.employee}</TableHead>
                  <TableHead>{text.commissionRate}</TableHead>
                  <TableHead>{text.appointments}</TableHead>
                  <TableHead>{text.avgServicePrice}</TableHead>
                  <TableHead>{text.totalEarnings}</TableHead>
                  <TableHead>{text.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryData.map((data) => (
                  <TableRow key={data.employeeId}>
                    <TableCell className="font-medium">{data.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {(data.commissionRate * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{data.appointmentCount}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(data.averageServicePrice)}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(data.totalEarnings)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPayslip(data.employeeId)}
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {text.payslip}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payslip Dialog */}
      {selectedEmployee && (() => {
        const employeeData = salaryData.find(d => d.employeeId === selectedEmployee);
        const { appointments, workingDays } = getEmployeeAppointments(selectedEmployee);
        
        return employeeData ? (
          <PayslipDialog
            open={!!selectedEmployee}
            onOpenChange={(open) => !open && setSelectedEmployee(null)}
            employeeName={employeeData.employeeName}
            appointments={appointments}
            commissionRate={employeeData.commissionRate}
            totalEarnings={employeeData.totalEarnings}
            workingDays={workingDays}
          />
        ) : null;
      })()}
    </div>
  );
}