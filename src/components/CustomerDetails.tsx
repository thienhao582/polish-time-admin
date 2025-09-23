
import { useState } from "react";
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
import { InvoiceFilters, InvoiceFiltersState } from "@/components/customer/InvoiceFilters";

interface CustomerDetailsProps {
  customer: CustomerEnhanced;
  onBack: () => void;
}

export const CustomerDetails = ({ customer, onBack }: CustomerDetailsProps) => {
  const { getInvoicesByCustomer } = useInvoiceStore();
  
  // Filter state
  const [filters, setFilters] = useState<InvoiceFiltersState>({
    searchTerm: "",
    selectedServiceId: "all",
    selectedEmployeeId: "all",
    selectedPeriod: "all"
  });
  
  // Get customer's invoices
  const allCustomerInvoices = getInvoicesByCustomer(customer.id);
  
  // Apply filters
  const customerInvoices = allCustomerInvoices.filter(invoice => {
    // Search filter
    const matchesSearch = filters.searchTerm === "" || 
      invoice.invoiceNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      invoice.items.some(item => 
        item.serviceName.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    
    // Service filter
    const matchesService = filters.selectedServiceId === "all" ||
      invoice.items.some(item => item.serviceId === filters.selectedServiceId);
    
    // Employee filter  
    const matchesEmployee = filters.selectedEmployeeId === "all" ||
      invoice.items.some(item => item.employeeId === filters.selectedEmployeeId);
    
    // Time period filter
    const matchesPeriod = filters.selectedPeriod === "all" || (() => {
      const invoiceDate = new Date(invoice.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= parseInt(filters.selectedPeriod);
    })();
    
    return matchesSearch && matchesService && matchesEmployee && matchesPeriod;
  });
  
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

      {/* Invoice Filters */}
      <InvoiceFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Danh sách hóa đơn</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                Hiển thị: {customerInvoices.length} hóa đơn
              </Badge>
              <Badge variant="outline">
                Tổng: {allCustomerInvoices.length} hóa đơn
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customerInvoices.length > 0 ? (
            <div className="space-y-6">
              {customerInvoices.map((invoice) => (
                <Card key={invoice.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Invoice Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {invoice.invoiceNumber}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              invoice.status === 'paid' ? 'default' : 
                              invoice.status === 'unpaid' ? 'destructive' : 'secondary'
                            }
                          >
                            {invoice.status === 'paid' ? 'Đã thanh toán' : 
                             invoice.status === 'unpaid' ? 'Chưa thanh toán' : 'Đã hủy'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(invoice.total)}
                          </p>
                        </div>
                      </div>

                      {/* Services and Employees */}
                      <div className="border-t pt-4">
                        <h5 className="font-medium mb-3 text-gray-800">Chi tiết dịch vụ:</h5>
                        <div className="space-y-3">
                          {invoice.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                  <p className="font-medium">{item.serviceName}</p>
                                  <p className="text-sm text-gray-600">
                                    Nhân viên: <span className="font-medium">{item.employeeName}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(item.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <span>{invoice.items.length} dịch vụ • </span>
                            <span>{Array.from(new Set(invoice.items.map(item => item.employeeName))).length} nhân viên</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Tổng cộng: <span className="font-bold text-green-600">{formatCurrency(invoice.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Chưa có hóa đơn nào</h3>
              <p>Khách hàng này chưa có hóa đơn nào trong hệ thống</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
