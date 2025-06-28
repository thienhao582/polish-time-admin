
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign } from "lucide-react";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useSalonStore } from "@/stores/useSalonStore";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface ReportSummaryProps {
  period: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
}

export const ReportSummary = ({ period, startDate, endDate }: ReportSummaryProps) => {
  const { invoices } = useInvoiceStore();
  const { enhancedCustomers, appointments } = useSalonStore();

  const metrics = useMemo(() => {
    // Normalize dates for comparison
    const normalizedStartDate = startOfDay(startDate);
    const normalizedEndDate = endOfDay(endDate);

    // Filter invoices in date range and paid status
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = startOfDay(new Date(invoice.createdAt));
      return invoiceDate >= normalizedStartDate && 
             invoiceDate <= normalizedEndDate &&
             invoice.status === 'paid';
    });

    // Calculate revenue
    const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

    // Calculate appointments in range
    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = startOfDay(new Date(appointment.date));
      return appointmentDate >= normalizedStartDate && appointmentDate <= normalizedEndDate;
    });

    // Calculate new customers in range
    const newCustomers = enhancedCustomers.filter(customer => {
      const joinDate = startOfDay(new Date(customer.joinDate));
      return joinDate >= normalizedStartDate && joinDate <= normalizedEndDate;
    }).length;

    // Calculate previous period for comparison
    let previousStart: Date, previousEnd: Date;
    const timeDiff = normalizedEndDate.getTime() - normalizedStartDate.getTime();
    
    if (period === 'day') {
      previousStart = new Date(normalizedStartDate.getTime() - timeDiff - 24 * 60 * 60 * 1000);
      previousEnd = new Date(normalizedStartDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === 'week') {
      previousStart = startOfWeek(new Date(normalizedStartDate.getTime() - 7 * 24 * 60 * 60 * 1000));
      previousEnd = endOfWeek(new Date(normalizedStartDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      previousStart = startOfMonth(new Date(normalizedStartDate.getTime() - 30 * 24 * 60 * 60 * 1000));
      previousEnd = endOfMonth(new Date(normalizedStartDate.getTime() - 30 * 24 * 60 * 60 * 1000));
    }

    // Previous period metrics
    const previousInvoices = invoices.filter(invoice => {
      const invoiceDate = startOfDay(new Date(invoice.createdAt));
      return invoiceDate >= previousStart && 
             invoiceDate <= previousEnd &&
             invoice.status === 'paid';
    });
    
    const previousRevenue = previousInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

    const previousAppointments = appointments.filter(appointment => {
      const appointmentDate = startOfDay(new Date(appointment.date));
      return appointmentDate >= previousStart && appointmentDate <= previousEnd;
    }).length;

    // Calculate growth percentages
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const appointmentGrowth = previousAppointments > 0 ? ((filteredAppointments.length - previousAppointments) / previousAppointments) * 100 : 0;

    return {
      totalRevenue,
      totalAppointments: filteredAppointments.length,
      newCustomers,
      averageOrderValue: filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0,
      revenueGrowth,
      appointmentGrowth
    };
  }, [invoices, appointments, enhancedCustomers, startDate, endDate, period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatGrowth = (growth: number) => {
    return growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {metrics.revenueGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={metrics.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
              {formatGrowth(metrics.revenueGrowth)}
            </span>
            {" "}so với kỳ trước
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lịch hẹn</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalAppointments}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {metrics.appointmentGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={metrics.appointmentGrowth >= 0 ? "text-green-500" : "text-red-500"}>
              {formatGrowth(metrics.appointmentGrowth)}
            </span>
            {" "}so với kỳ trước
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.newCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Khách hàng đăng ký mới
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Giá trị trung bình</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
          <p className="text-xs text-muted-foreground">
            Trung bình mỗi hóa đơn
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
