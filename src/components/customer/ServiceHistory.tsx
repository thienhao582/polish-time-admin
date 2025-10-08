import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSalonStore } from "@/stores/useSalonStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { formatTimeRange } from "@/utils/timeUtils";
import { CalendarIcon, Filter } from "lucide-react";

export const ServiceHistory = () => {
  const { appointments, customers, services, employees } = useSalonStore();
  const { language } = useLanguage();
  
  // Filter states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const translations = {
    vi: {
      title: "Lịch sử làm nail",
      subtitle: "Xem lịch sử sử dụng dịch vụ của khách hàng",
      filters: "Bộ lọc",
      allCustomers: "Tất cả khách hàng",
      allEmployees: "Tất cả nhân viên", 
      allServices: "Tất cả dịch vụ",
      allPeriods: "Tất cả thời gian",
      last7Days: "7 ngày qua",
      last30Days: "30 ngày qua",
      last3Months: "3 tháng qua",
      searchPlaceholder: "Tìm kiếm...",
      date: "Ngày",
      time: "Giờ",
      customer: "Khách hàng",
      service: "Dịch vụ",
      employee: "Nhân viên",
      price: "Giá",
      noData: "Không có lịch sử dịch vụ"
    },
    en: {
      title: "Nail Service History",
      subtitle: "View customer service usage history",
      filters: "Filters",
      allCustomers: "All Customers",
      allEmployees: "All Employees",
      allServices: "All Services", 
      allPeriods: "All Time",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      last3Months: "Last 3 Months",
      searchPlaceholder: "Search...",
      date: "Date",
      time: "Time",
      customer: "Customer",
      service: "Service",
      employee: "Employee",
      price: "Price",
      noData: "No service history"
    }
  };

  const text = translations[language];
  const locale = language === 'vi' ? vi : enUS;

  // Filter appointments based on all criteria
  const filteredAppointments = appointments.filter(apt => {
    // Customer filter
    if (selectedCustomerId !== "all") {
      const matchCustomer = apt.customerId === selectedCustomerId || 
                           apt.customer === customers.find(c => c.id === selectedCustomerId)?.name;
      if (!matchCustomer) return false;
    }

    // Employee filter
    if (selectedEmployeeId !== "all") {
      const matchEmployee = apt.staffId === selectedEmployeeId ||
                            apt.staff === employees.find(e => e.id === selectedEmployeeId)?.name;
      if (!matchEmployee) return false;
    }

    // Service filter
    if (selectedServiceId !== "all") {
      const matchService = apt.serviceId === selectedServiceId ||
                          apt.service === services.find(s => s.id === selectedServiceId)?.name;
      if (!matchService) return false;
    }

    // Period filter
    if (selectedPeriod !== "all") {
      const appointmentDate = new Date(apt.date);
      const now = new Date();
      const daysDiff = (now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (selectedPeriod) {
        case "7days":
          if (daysDiff > 7) return false;
          break;
        case "30days":
          if (daysDiff > 30) return false;
          break;
        case "3months":
          if (daysDiff > 90) return false;
          break;
      }
    }

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = apt.customer?.toLowerCase().includes(searchLower) ||
                         apt.service?.toLowerCase().includes(searchLower) ||
                         apt.staff?.toLowerCase().includes(searchLower);
      if (!matchSearch) return false;
    }

    return true;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{text.title}</h2>
          <p className="text-gray-600 mt-1">{text.subtitle}</p>
        </div>
      </div>

      {/* Compact Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {text.filters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder={text.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Customer Filter */}
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={text.allCustomers} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.allCustomers}</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Employee Filter */}
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={text.allEmployees} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.allEmployees}</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Service Filter */}
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={text.allServices} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.allServices}</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Period Filter */}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={text.allPeriods} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.allPeriods}</SelectItem>
                <SelectItem value="7days">{text.last7Days}</SelectItem>
                <SelectItem value="30days">{text.last30Days}</SelectItem>
                <SelectItem value="3months">{text.last3Months}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{text.title}</span>
            <Badge variant="secondary" className="text-sm">
              {filteredAppointments.length} kết quả
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {text.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{text.date}</TableHead>
                  <TableHead>{text.time}</TableHead>
                  <TableHead>{text.customer}</TableHead>
                  <TableHead>{text.service}</TableHead>
                  <TableHead>{text.employee}</TableHead>
                  <TableHead>{text.price}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(new Date(appointment.date), 'dd/MM/yyyy', { locale })}
                    </TableCell>
                    <TableCell>
                      {formatTimeRange(appointment.time, appointment.duration)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {appointment.customer?.charAt(0).toUpperCase() || 'K'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[120px]">{appointment.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="truncate max-w-[150px] block">{appointment.service}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {appointment.staff?.charAt(0).toUpperCase() || 'N'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[100px]">{appointment.staff || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${(typeof appointment.price === 'string' ? parseFloat(appointment.price) : appointment.price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};