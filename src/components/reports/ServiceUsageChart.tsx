
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useMemo } from "react";

interface ServiceUsageChartProps {
  startDate: string;
  endDate: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ServiceUsageChart = ({ startDate, endDate }: ServiceUsageChartProps) => {
  const { invoices } = useInvoiceStore();

  const serviceData = useMemo(() => {
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

    const serviceCount: { [key: string]: number } = {};

    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        serviceCount[item.serviceName] = (serviceCount[item.serviceName] || 0) + 1;
      });
    });

    return Object.entries(serviceCount)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 services
  }, [invoices, startDate, endDate]);

  const chartConfig = {
    value: {
      label: "Số lượng",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dịch vụ Phổ biến</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {serviceData.map((service, index) => (
            <div key={service.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{service.name}</span>
              </div>
              <span className="font-medium">{service.value} lần</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
