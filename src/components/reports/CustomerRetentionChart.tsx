
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useMemo } from "react";

interface CustomerRetentionChartProps {
  startDate: string;
  endDate: string;
}

export const CustomerRetentionChart = ({ startDate, endDate }: CustomerRetentionChartProps) => {
  const { invoices } = useInvoiceStore();

  const retentionData = useMemo(() => {
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

    // Group by month
    const monthlyData: { [key: string]: { newCustomers: Set<string>; returningCustomers: Set<string> } } = {};
    const allCustomers = new Set<string>();

    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.createdAt);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { 
          newCustomers: new Set(), 
          returningCustomers: new Set() 
        };
      }

      if (allCustomers.has(invoice.customerId)) {
        monthlyData[monthKey].returningCustomers.add(invoice.customerId);
      } else {
        monthlyData[monthKey].newCustomers.add(invoice.customerId);
        allCustomers.add(invoice.customerId);
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      newCustomers: data.newCustomers.size,
      returningCustomers: data.returningCustomers.size,
      retentionRate: data.returningCustomers.size > 0 ? 
        Math.round((data.returningCustomers.size / (data.newCustomers.size + data.returningCustomers.size)) * 100) : 0
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [invoices, startDate, endDate]);

  const chartConfig = {
    newCustomers: {
      label: "Khách mới",
      color: "hsl(var(--chart-1))",
    },
    returningCustomers: {
      label: "Khách quay lại",
      color: "hsl(var(--chart-2))",
    },
    retentionRate: {
      label: "Tỷ lệ quay lại (%)",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Khách hàng Quay lại</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="newCustomers" 
                stroke="hsl(var(--chart-1))" 
                name="Khách mới"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="returningCustomers" 
                stroke="hsl(var(--chart-2))" 
                name="Khách quay lại"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="retentionRate" 
                stroke="hsl(var(--chart-3))" 
                name="Tỷ lệ quay lại (%)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
