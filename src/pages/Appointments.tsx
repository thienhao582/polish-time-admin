
import { useState } from "react";
import { Calendar, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const appointments = [
    {
      id: 1,
      date: "2024-06-27",
      time: "09:00",
      customer: "Nguyễn Thị Lan",
      phone: "0901234567",
      service: "Gel Polish + Nail Art",
      duration: "90 phút",
      price: "450.000đ",
      status: "confirmed",
      staff: "Mai",
    },
    {
      id: 2,
      date: "2024-06-27",
      time: "10:30",
      customer: "Trần Minh Anh",
      phone: "0987654321",
      service: "Manicure + Pedicure",
      duration: "120 phút",
      price: "380.000đ",
      status: "pending",
      staff: "Linh",
    },
    {
      id: 3,
      date: "2024-06-27",
      time: "14:00",
      customer: "Lê Thị Hoa",
      phone: "0912345678",
      service: "Nail Extension",
      duration: "150 phút",
      price: "650.000đ",
      status: "completed",
      staff: "Mai",
    },
    {
      id: 4,
      date: "2024-06-28",
      time: "09:30",
      customer: "Phạm Thị Thu",
      phone: "0923456789",
      service: "Basic Manicure",
      duration: "60 phút",
      price: "200.000đ",
      status: "cancelled",
      staff: "Linh",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Xác nhận", variant: "default" as const },
      pending: { label: "Chờ xác nhận", variant: "secondary" as const },
      completed: { label: "Hoàn thành", variant: "default" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={
        status === "confirmed" ? "bg-green-100 text-green-700 hover:bg-green-100" :
        status === "completed" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""
      }>
        {config.label}
      </Badge>
    );
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phone.includes(searchTerm) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Lịch Hẹn</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả lịch hẹn</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm lịch hẹn
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên khách hàng, SĐT, dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Lịch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch hẹn</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Giá tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appointment.date}</p>
                      <p className="text-sm text-gray-500">{appointment.time}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appointment.customer}</p>
                      <p className="text-sm text-gray-500">{appointment.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>{appointment.staff}</TableCell>
                  <TableCell>{appointment.duration}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {appointment.price}
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
