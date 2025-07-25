import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSalonStore } from "@/stores/useSalonStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { formatTimeRange } from "@/utils/timeUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

export const ServiceHistory = () => {
  const { appointments, customers } = useSalonStore();
  const { language } = useLanguage();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  
  const translations = {
    vi: {
      title: "Lịch sử làm nail",
      subtitle: "Xem lịch sử sử dụng dịch vụ của khách hàng",
      selectCustomer: "Chọn khách hàng",
      allCustomers: "Tất cả khách hàng",
      date: "Ngày",
      time: "Giờ",
      service: "Dịch vụ",
      employee: "Nhân viên",
      price: "Giá",
      noData: "Không có lịch sử dịch vụ",
      totalVisits: "Tổng lượt",
      totalSpent: "Tổng chi tiêu",
      lastVisit: "Lần cuối"
    },
    en: {
      title: "Nail Service History",
      subtitle: "View customer service usage history",
      selectCustomer: "Select Customer",
      allCustomers: "All Customers",
      date: "Date",
      time: "Time",
      service: "Service",
      employee: "Employee",
      price: "Price",
      noData: "No service history",
      totalVisits: "Total Visits",
      totalSpent: "Total Spent",
      lastVisit: "Last Visit"
    }
  };

  const text = translations[language];
  const locale = language === 'vi' ? vi : enUS;

  // Filter appointments based on selected customer
  const customerAppointments = appointments.filter(apt => {
    if (selectedCustomerId === "all") return true;
    return apt.customerId === selectedCustomerId || apt.customer === customers.find(c => c.id === selectedCustomerId)?.name;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Calculate customer stats (only for specific customer) - convert to USD
  const customerStats = {
    totalVisits: customerAppointments.length,
    totalSpent: customerAppointments.reduce((sum, apt) => {
      const price = typeof apt.price === 'string' ? parseFloat(apt.price) : apt.price;
      return sum + ((price || 0) / 24000); // Convert VND to USD (approximate rate)
    }, 0),
    lastVisit: customerAppointments.length > 0 ? customerAppointments[0].date : null
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: "default" as const, label: language === 'vi' ? 'Đã xác nhận' : 'Confirmed' },
      completed: { variant: "secondary" as const, label: language === 'vi' ? 'Hoàn thành' : 'Completed' },
      cancelled: { variant: "destructive" as const, label: language === 'vi' ? 'Đã hủy' : 'Cancelled' },
      no_show: { variant: "outline" as const, label: language === 'vi' ? 'Không đến' : 'No Show' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{text.title}</h2>
          <p className="text-gray-600 mt-1">{text.subtitle}</p>
        </div>
      </div>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {text.selectCustomer}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={text.selectCustomer} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ALL</span>
                  </div>
                  <span className="font-medium">{text.allCustomers}</span>
                </div>
              </SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {customer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      {customer.phone && (
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Customer Stats - Only show when specific customer is selected */}
      {selectedCustomerId && selectedCustomerId !== "all" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{text.totalVisits}</p>
                  <p className="text-2xl font-bold">{customerStats.totalVisits}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{text.totalSpent}</p>
                  <p className="text-2xl font-bold">${customerStats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">$</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{text.lastVisit}</p>
                  <p className="text-2xl font-bold">
                    {customerStats.lastVisit 
                      ? format(new Date(customerStats.lastVisit), 'dd/MM', { locale })
                      : '-'
                    }
                  </p>
                </div>
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service History Table - Always show */}
      <Card>
        <CardHeader>
          <CardTitle>{text.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {customerAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {text.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{text.date}</TableHead>
                  <TableHead>{text.time}</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>{text.service}</TableHead>
                  <TableHead>{text.employee}</TableHead>
                  <TableHead>{text.price}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerAppointments.map((appointment) => (
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
                        {appointment.customer}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {appointment.service}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {appointment.staff?.charAt(0).toUpperCase() || 'N'}
                          </AvatarFallback>
                        </Avatar>
                        {appointment.staff || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${((typeof appointment.price === 'string' ? parseFloat(appointment.price) : appointment.price) / 24000).toFixed(2)}
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