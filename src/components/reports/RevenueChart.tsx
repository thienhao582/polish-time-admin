
import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { format, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth } from "date-fns";
import { vi } from "date-fns/locale";

interface RevenueChartProps {
  period: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
}

export const RevenueChart = ({ period, startDate, endDate }: RevenueChartProps) => {
  const { invoices } = useInvoiceStore();

  const chartData = useMemo(() => {
    // Filter invoices for paid status only and within date range
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = startOfDay(new Date(invoice.createdAt));
      const normalizedStartDate = startOfDay(startDate);
      const normalizedEndDate = endOfDay(endDate);
      
      return invoiceDate >= normalizedStartDate && 
             invoiceDate <= normalizedEndDate &&
             invoice.status === 'paid';
    });

    // Group invoices by period
    const groupedData: { [key: string]: number } = {};

    filteredInvoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      let key: string;

      if (period === 'day') {
        key = format(invoiceDate, 'yyyy-MM-dd');
      } else if (period === 'week') {
        key = format(startOfWeek(invoiceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else {
        key = format(startOfMonth(invoiceDate), 'yyyy-MM-dd');
      }

      groupedData[key] = (groupedData[key] || 0) + invoice.total;
    });

    // Generate all periods in range
    let intervals: Date[];
    if (period === 'day') {
      intervals = eachDayOfInterval({ start: startDate, end: endDate });
    } else if (period === 'week') {
      intervals = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
    } else {
      intervals = eachMonthOfInterval({ start: startDate, end: endDate });
    }

    // Create chart data with all periods
    const data = intervals.map(date => {
      let key: string;
      let label: string;

      if (period === 'day') {
        key = format(date, 'yyyy-MM-dd');
        label = format(date, 'dd/MM', { locale: vi });
      } else if (period === 'week') {
        key = format(date, 'yyyy-MM-dd');
        label = `Tuần ${format(date, 'dd/MM', { locale: vi })}`;
      } else {
        key = format(date, 'yyyy-MM-dd');
        label = format(date, 'MM/yyyy', { locale: vi });
      }

      return {
        period: label,
        revenue: groupedData[key] || 0
      };
    });

    return data;
  }, [invoices, period, startDate, endDate]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biểu đồ doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value: number) => [
                new Intl.NumberFormat('vi-VN').format(value) + 'đ', 
                'Doanh thu'
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#ec4899" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
