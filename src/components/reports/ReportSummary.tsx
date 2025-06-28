
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useSalonStore } from "@/stores/useSalonStore";
import { useMemo } from "react";
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react";

interface ReportSummaryProps {
  startDate: string;
  endDate: string;
}

export const ReportSummary = ({ startDate, endDate }: ReportSummaryProps) => {
  const { invoices } = useInvoiceStore();
  const { enhancedCustomers } = useSalonStore();

  const summaryData = useMemo(() => {
    const filteredInvoices = invoices.filter(
      invoice => 
        invoice.createdAt >= startDate && 
        invoice.createdAt <= endDate
    );

    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalServices = filteredInvoices.reduce((sum, inv) => sum + inv.items.length, 0);
    const uniqueCustomers = new Set(filteredInvoices.map(inv => inv.customerId)).size;

    // Calculate average revenue per customer
    const avgRevenuePerCustomer = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

    return {
      totalRevenue,
      totalServices,
      uniqueCustomers,
      avgRevenuePerCustomer,
      totalInvoices: filteredInvoices.length
    };
  }, [invoices, startDate, endDate]);

  const summaryCards = [
    {
      title: "Tổng Doanh thu",
      value: `${summaryData.totalRevenue.toLocaleString()}đ`,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Khách hàng",
      value: summaryData.uniqueCustomers.toString(),
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Dịch vụ thực hiện",
      value: summaryData.totalServices.toString(),
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      title: "TB/Khách hàng",
      value: `${Math.round(summaryData.avgRevenuePerCustomer / 1000)}K`,
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
