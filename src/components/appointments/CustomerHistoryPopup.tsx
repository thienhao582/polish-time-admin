import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSalonStore } from "@/stores/useSalonStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatTimeRange } from "@/utils/timeUtils";
import { History, Calendar, User, Scissors } from "lucide-react";

interface CustomerHistoryPopupProps {
  customerId: string;
  customerName: string;
}

export const CustomerHistoryPopup = ({ customerId, customerName }: CustomerHistoryPopupProps) => {
  const { appointments, customers } = useSalonStore();
  const [isOpen, setIsOpen] = useState(false);

  // Get customer appointments (last 10 most recent)
  const customerAppointments = appointments
    .filter(apt => 
      apt.customerId === customerId || 
      apt.customer === customers.find(c => c.id === customerId)?.name
    )
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10); // Only show last 10 appointments

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

          {/* Recent History */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lịch sử gần đây
            </h3>
            
            {customerAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có lịch sử làm nail
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[100px]">Ngày</TableHead>
                      <TableHead className="w-[100px]">Giờ</TableHead>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead className="w-[80px]">Giá</TableHead>
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
                            <Scissors className="h-4 w-4 text-pink-500" />
                            <span className="text-sm font-medium truncate max-w-[150px]">
                              {appointment.service}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {appointment.staff?.charAt(0).toUpperCase() || 'N'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm truncate max-w-[100px]">
                              {appointment.staff || 'N/A'}
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

          {/* Recommendations */}
          {(favoriteService || favoriteStaff) && (
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-medium text-amber-800 mb-2">💡 Gợi ý cho lần hẹn tiếp theo</h4>
              <div className="text-sm text-amber-700 space-y-1">
                {favoriteService && (
                  <div>• Dịch vụ ưa thích: <span className="font-medium">{favoriteService}</span></div>
                )}
                {favoriteStaff && (
                  <div>• Nhân viên quen: <span className="font-medium">{favoriteStaff}</span></div>
                )}
                {lastVisit && (
                  <div>• Lần cuối làm: <span className="font-medium">
                    {format(new Date(lastVisit), 'dd/MM/yyyy', { locale: vi })}
                  </span></div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};