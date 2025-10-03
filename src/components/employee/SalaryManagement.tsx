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

      const salaryCalculations: SalaryCalculation[] = employees.map(employee => {
        const employeeAppointments = filteredAppointments.filter(
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

    const uniqueDates = new Set(filteredAppointments.map(apt => apt.appointment_date));
    const workingDays = uniqueDates.size;

    // Generate realistic mock data for tips, supply, and discount
    return {
      appointments: filteredAppointments.map(apt => {
        const price = apt.price || 0;
        // Mock tip: 10-20% of price
        const tip = Math.floor(price * (0.1 + Math.random() * 0.1));
        // Mock supply cost: 5-15% of price
        const supply = Math.floor(price * (0.05 + Math.random() * 0.1));
        // Mock discount: 0-10% of price (not all appointments have discount)
        const discount = Math.random() > 0.6 ? Math.floor(price * (Math.random() * 0.1)) : 0;
        
        return {
          id: apt.id,
          date: apt.appointment_date,
          service: apt.service_name || "Service",
          tip,
          supply,
          discount,
          price
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