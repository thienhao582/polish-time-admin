
import { useState } from "react";
import { Users, Plus, Search, Phone, Mail, MessageSquare, Calendar, Star, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalonStore, CustomerEnhanced } from "@/stores/useSalonStore";
import { CustomerForm } from "./CustomerForm";
import { CustomerDetails } from "./CustomerDetails";

export const CustomerManagement = () => {
  const { enhancedCustomers } = useSalonStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerEnhanced | null>(null);

  const filteredCustomers = enhancedCustomers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === "all" || customer.memberLevel === filterLevel;
    
    return matchesSearch && matchesLevel;
  });

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSendSMS = () => {
    const selectedCustomersList = enhancedCustomers.filter(c => 
      selectedCustomers.includes(c.id)
    );
    
    const phoneNumbers = selectedCustomersList.map(c => c.phone).join(', ');
    alert(`Gửi SMS đến ${selectedCustomers.length} khách hàng:\n${phoneNumbers}\n\nTính năng này sẽ được tích hợp với nhà cung cấp SMS.`);
  };

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

  const getMemberLevelStats = () => {
    const stats = {
      "Mới": 0,
      "Thành viên": 0,
      "VIP": 0,
      "VVIP": 0
    };
    
    enhancedCustomers.forEach(customer => {
      stats[customer.memberLevel]++;
    });
    
    return stats;
  };

  const stats = getMemberLevelStats();

  if (selectedCustomer) {
    return (
      <CustomerDetails 
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
      />
    );
  }

  if (showAddForm) {
    return (
      <CustomerForm
        onBack={() => setShowAddForm(false)}
        onSave={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Khách Hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi thông tin, tích điểm và gửi SMS khách hàng</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-gray-800">{enhancedCustomers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">VVIP</p>
                <p className="text-2xl font-bold text-purple-600">{stats.VVIP}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">VIP</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.VIP}</p>
              </div>
              <Gift className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thành viên</p>
                <p className="text-2xl font-bold text-blue-600">{stats["Thành viên"]}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Khách mới</p>
                <p className="text-2xl font-bold text-green-600">{stats.Mới}</p>
              </div>
              <Plus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp độ</SelectItem>
                <SelectItem value="Mới">Khách mới</SelectItem>
                <SelectItem value="Thành viên">Thành viên</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="VVIP">VVIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Đã chọn {selectedCustomers.length} khách hàng
              </p>
              <Button 
                onClick={handleSendSMS}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Gửi SMS hàng loạt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Sinh nhật</TableHead>
                <TableHead>Điểm tích lũy</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Lần cuối</TableHead>
                <TableHead>Tổng chi tiêu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-pink-100 text-pink-600">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.visitCount} lần đến</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {customer.birthday ? new Date(customer.birthday).toLocaleDateString('vi-VN') : 'Chưa có'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-yellow-600">{customer.points}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMemberLevelColor(customer.memberLevel)}>
                      {customer.memberLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {customer.totalSpent.toLocaleString()}đ
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
