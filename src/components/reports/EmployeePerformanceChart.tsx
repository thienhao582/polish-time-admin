
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useMemo } from "react";

interface EmployeePerformanceChartProps {
  startDate: string;
  endDate: string;
}

export const EmployeePerformanceChart = ({ startDate, endDate }: EmployeePerformanceChartProps) => {
  const { invoices } = useInvoiceStore();

  const performanceData = useMemo(() => {
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);
      
      // Reset time to compare dates only
      invoiceDate.setHours(0, 0, 0, 0);
      filterStart.setHours(0, 0, 0, 0);
      filterEnd.setHours(23, 59, 59, 999);
      
      return invoiceDate >= filterStart && invoiceDate <= filterEnd;
    });

    const employeeStats: { [key: string]: { services: number; revenue: number } } = {};

    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (!employeeStats[item.employeeName]) {
          employeeStats[item.employeeName] = { services: 0, revenue: 0 };
        }
        employeeStats[item.employeeName].services += 1;
        employeeStats[item.employeeName].revenue += item.price;
      });
    });

    return Object.entries(employeeStats).map(([name, stats]) => ({
      name,
      services: stats.services,
      revenue: Math.round(stats.revenue / 1000), // Convert to thousands
    })).sort((a, b) => b.revenue - a.revenue);
  }, [invoices, startDate, endDate]);

  const chartConfig = {
    services: {
      label: "Số dịch vụ",
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: "Doanh thu (K)",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiệu suất Nhân viên</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="services" fill="hsl(var(--chart-1))" name="Số dịch vụ" />
              <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Doanh thu (K)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {performanceData.map((employee) => (
            <div key={employee.name} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
              <span className="font-medium">{employee.name}</span>
              <div className="flex gap-4">
                <span>{employee.services} dịch vụ</span>
                <span className="text-green-600">{employee.revenue}K</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
