
import { useState } from "react";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { ServiceUsageChart } from "@/components/reports/ServiceUsageChart";
import { EmployeePerformanceChart } from "@/components/reports/EmployeePerformanceChart";
import { CustomerRetentionChart } from "@/components/reports/CustomerRetentionChart";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { toast } from "sonner";

const Dashboard = () => {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleExport = (format: "pdf" | "excel") => {
    // Placeholder for export functionality
    toast.success(`Xuất báo cáo ${format.toUpperCase()} thành công!`);
  };

  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Tổng quan & Báo cáo
        </h1>
      </div>

      <ReportFilters
        period={period}
        setPeriod={setPeriod}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onExport={handleExport}
      />

      <ReportSummary 
        startDate={startDateString}
        endDate={endDateString}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart 
          period={period}
          startDate={startDateString}
          endDate={endDateString}
        />
        
        <ServiceUsageChart 
          startDate={startDateString}
          endDate={endDateString}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeePerformanceChart 
          startDate={startDateString}
          endDate={endDateString}
        />
        
        <CustomerRetentionChart 
          startDate={startDateString}
          endDate={endDateString}
        />
      </div>
    </div>
  );
};

export default Dashboard;
