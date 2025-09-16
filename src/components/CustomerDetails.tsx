
import { ArrowLeft, Star, Calendar, Phone, Mail, Gift, TrendingUp, FileText, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerEnhanced } from "@/stores/useSalonStore";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { formatCurrency } from "@/lib/currencyUtils";

interface CustomerDetailsProps {
  customer: CustomerEnhanced;
  onBack: () => void;
}

export const CustomerDetails = ({ customer, onBack }: CustomerDetailsProps) => {
  const { getInvoicesByCustomer } = useInvoiceStore();
  
  // Get customer's invoices
  const customerInvoices = getInvoicesByCustomer(customer.id);
  
  // Get unique employees who served this customer
  const getUniqueEmployees = () => {
    const employeeMap = new Map();
    customerInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (!employeeMap.has(item.employeeId)) {
          employeeMap.set(item.employeeId, {
            id: item.employeeId,
            name: item.employeeName,
            servicesCount: 1,
            totalRevenue: item.price,
            services: [item.serviceName]
          });
        } else {
          const employee = employeeMap.get(item.employeeId);
          employee.servicesCount += 1;
          employee.totalRevenue += item.price;
          if (!employee.services.includes(item.serviceName)) {
            employee.services.push(item.serviceName);
          }
        }
      });
    });
    return Array.from(employeeMap.values());
  };

  const uniqueEmployees = getUniqueEmployees();

  const getMemberLevelColor = (level: string) => {
    switch (level) {
      case "VVIP":
        return "bg-purple-100 text-purple-800";
      case "VIP":
        return "bg-yellow-100 text-yellow-800";
      case "Thành viên":
        return "bg-blue-100 text-blue-800";
      case "Mới":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNextLevelPoints = (currentLevel: string) => {
    switch (currentLevel) {
      case "Mới":
        return 100;
      case "Thành viên":
        return 500;
      case "VIP":
        return 1000;
      default:
        return null;
    }
  };

  const nextLevelPoints = getNextLevelPoints(customer.memberLevel);
  const pointsToNext = nextLevelPoints ? nextLevelPoints - customer.points : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
          <p className="text-gray-600 mt-1">Thông tin chi tiết khách hàng</p>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-pink-100 text-pink-600 text-xl">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <Badge className={getMemberLevelColor(customer.memberLevel)}>
                  {customer.memberLevel}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia: {new Date(customer.joinDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.birthday && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Sinh nhật: {new Date(customer.birthday).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Điểm tích lũy</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xl font-bold text-yellow-600">{customer.points}</span>
                </div>
              </div>
              {nextLevelPoints && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Đến cấp độ tiếp theo</span>
                    <span>{pointsToNext} điểm</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(customer.points / nextLevelPoints) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số lần đến</p>
                <p className="text-2xl font-bold text-blue-600">{customer.visitCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lần cuối đến</p>
                <p className="text-lg font-bold text-purple-600">
                  {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('vi-VN') : 'Chưa có'}
                </p>
              </div>
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">Lịch sử đến tiệm</TabsTrigger>
              <TabsTrigger value="invoices">Hóa đơn chi tiết</TabsTrigger>
              <TabsTrigger value="employees">Nhân viên phục vụ</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-6">
              {customer.visitHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Điểm tích lũy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.visitHistory.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          {new Date(visit.date).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {visit.services.map((service, index) => (
                              <div key={index} className="text-sm">
                                {service}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(visit.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-600">+{visit.pointsEarned}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có lịch sử đến tiệm</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="mt-6">
              {customerInvoices.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Danh sách hóa đơn</h3>
                    <Badge variant="secondary">
                      Tổng: {customerInvoices.length} hóa đơn
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã hóa đơn</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Dịch vụ</TableHead>
                        <TableHead>Nhân viên</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {invoice.items.map((item, index) => (
                                <div key={index} className="text-sm">
                                  {item.serviceName}
                                  <span className="text-gray-500 ml-2">
                                    ({formatCurrency(item.price)})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {Array.from(new Set(invoice.items.map(item => item.employeeName))).map((employeeName, index) => (
                                <div key={index} className="text-sm">
                                  {employeeName}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                invoice.status === 'paid' ? 'default' : 
                                invoice.status === 'unpaid' ? 'destructive' : 'secondary'
                              }
                            >
                              {invoice.status === 'paid' ? 'Đã thanh toán' : 
                               invoice.status === 'unpaid' ? 'Chưa thanh toán' : 'Đã hủy'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(invoice.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có hóa đơn nào</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="employees" className="mt-6">
              {uniqueEmployees.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Nhân viên đã phục vụ</h3>
                    <Badge variant="secondary">
                      {uniqueEmployees.length} nhân viên
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uniqueEmployees.map((employee) => (
                      <Card key={employee.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-semibold">{employee.name}</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{employee.servicesCount} dịch vụ</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4 text-gray-400" />
                                  <span>{formatCurrency(employee.totalRevenue)}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500">Dịch vụ đã thực hiện:</p>
                                <div className="flex flex-wrap gap-1">
                                  {employee.services.slice(0, 3).map((service, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                  {employee.services.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{employee.services.length - 3} khác
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có nhân viên nào phục vụ</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
