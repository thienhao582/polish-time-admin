
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useMemo } from "react";

interface RevenueChartProps {
  period: "day" | "week" | "month";
  startDate: string;
  endDate: string;
}

export const RevenueChart = ({ period, startDate, endDate }: RevenueChartProps) => {
  const { invoices } = useInvoiceStore();

  const revenueData = useMemo(() => {
    const filteredInvoices = invoices.filter(
      invoice => 
        invoice.status === 'paid' &&
        invoice.createdAt >= startDate && 
        invoice.createdAt <= endDate
    );

    const groupedData: { [key: string]: number } = {};

    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.createdAt);
      let key: string;

      switch (period) {
        case "day":
          key = date.toISOString().split('T')[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Tuần ${weekStart.toISOString().split('T')[0]}`;
          break;
        case "month":
          key = `${date.getMonth() + 1}/${date.getFullYear()}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      groupedData[key] = (groupedData[key] || 0) + invoice.total;
    });

    return Object.entries(groupedData).map(([period, revenue]) => ({
      period,
      revenue: revenue / 1000, // Convert to thousands
    })).sort((a, b) => a.period.localeCompare(b.period));
  }, [invoices, period, startDate, endDate]);

  const chartConfig = {
    revenue: {
      label: "Doanh thu (K)",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Biểu đồ Doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                formatter={(value) => [`${value}K`, "Doanh thu"]}
              />
              <Bar dataKey="revenue" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
