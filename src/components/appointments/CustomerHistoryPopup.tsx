import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSalonStore } from "@/stores/useSalonStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatTimeRange } from "@/utils/timeUtils";
import { History, Calendar, User, Scissors, Search } from "lucide-react";

interface CustomerHistoryPopupProps {
  customerId: string;
  customerName: string;
}

export const CustomerHistoryPopup = ({ customerId, customerName }: CustomerHistoryPopupProps) => {
  const { appointments, customers } = useSalonStore();
  const [isOpen, setIsOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");

  // Get all customer appointments with filters
  const customerAppointments = appointments
    .filter(apt => 
      apt.customerId === customerId || 
      apt.customer === customers.find(c => c.id === customerId)?.name
    )
    .filter(apt => {
      // Filter by service name
      if (serviceFilter && !apt.service?.toLowerCase().includes(serviceFilter.toLowerCase())) {
        return false;
      }
      // Filter by employee name
      if (employeeFilter && !apt.staff?.toLowerCase().includes(employeeFilter.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    }); // Show all appointments, not limited

  // Calculate stats
  const totalVisits = customerAppointments.length;
  const totalSpent = customerAppointments.reduce((sum, apt) => {
    const price = typeof apt.price === 'string' ? parseFloat(apt.price) : apt.price;
    return sum + ((price || 0) / 24000); // Convert to USD
  }, 0);
  const lastVisit = customerAppointments.length > 0 ? customerAppointments[0].date : null;

  // Get most used services and staff
  const serviceCount = customerAppointments.reduce((acc, apt) => {
    acc[apt.service] = (acc[apt.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const staffCount = customerAppointments.reduce((acc, apt) => {
    if (apt.staff) {
      acc[apt.staff] = (acc[apt.staff] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const favoriteService = Object.entries(serviceCount).sort(([,a], [,b]) => b - a)[0]?.[0];
  const favoriteStaff = Object.entries(staffCount).sort(([,a], [,b]) => b - a)[0]?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          className="ml-2 flex-shrink-0"
        >
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lịch sử làm nail - {customerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalVisits}</div>
              <div className="text-sm text-blue-700">Lượt đến</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</div>
              <div className="text-sm text-green-700">Tổng chi tiêu</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-purple-600 truncate">
                {favoriteService || "N/A"}
              </div>
              <div className="text-sm text-purple-700">Dịch vụ ưa thích</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-orange-600 truncate">
                {favoriteStaff || "N/A"}
              </div>
              <div className="text-sm text-orange-700">Nhân viên quen</div>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Tìm kiếm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Tìm theo tên dịch vụ..."
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Input
                  placeholder="Tìm theo tên nhân viên..."
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch sử đầy đủ
              </div>
              <Badge variant="secondary" className="text-sm">
                {customerAppointments.length} kết quả
              </Badge>
            </h3>
            
            {customerAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy lịch sử phù hợp
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[100px] min-w-[100px]">Ngày</TableHead>
                      <TableHead className="w-[120px] min-w-[120px]">Giờ</TableHead>
                      <TableHead className="min-w-[200px]">Dịch vụ</TableHead>
                      <TableHead className="min-w-[150px]">Nhân viên</TableHead>
                      <TableHead className="w-[80px] min-w-[80px]">Giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerAppointments.map((appointment, index) => (
                      <TableRow key={appointment.id} className={index === 0 ? "bg-blue-50" : ""}>
                        <TableCell className="text-sm">
                          {format(new Date(appointment.date), 'dd/MM', { locale: vi })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatTimeRange(appointment.time, appointment.duration)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Scissors className="h-4 w-4 text-pink-500 flex-shrink-0" />
                            <span className="text-sm font-medium whitespace-nowrap">
                              {appointment.service}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarFallback className="text-xs">
                                {appointment.staff?.charAt(0).toUpperCase() || "N"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm whitespace-nowrap">
                              {appointment.staff || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          ${((typeof appointment.price === 'string' ? parseFloat(appointment.price) : appointment.price) / 24000).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};