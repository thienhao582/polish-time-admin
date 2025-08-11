
import { useState } from "react";
import { Users, Plus, Search, Phone, Mail, MessageSquare, Calendar, Star, Gift, Edit, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/currencyUtils";

export const CustomerManagement = () => {
  const { enhancedCustomers, updateEnhancedCustomer, deleteEnhancedCustomer } = useSalonStore();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerEnhanced | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerEnhanced | null>(null);

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

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customerName}"?`)) {
      deleteEnhancedCustomer(customerId);
      toast.success("Đã xóa khách hàng thành công!");
    }
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

  if (editingCustomer) {
    return (
      <CustomerForm
        customer={editingCustomer}
        onBack={() => setEditingCustomer(null)}
        onSave={() => setEditingCustomer(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('customers.customers.general-info')}</h1>
          <p className="text-gray-600 mt-1">{t('customers.subtitle')}</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('customers.add_customer')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('customers.total_customers')}</p>
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
                <p className="text-sm text-gray-600">{t('customers.members')}</p>
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
                <p className="text-sm text-gray-600">{t('customers.new_customers')}</p>
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
                placeholder={t('customers.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('customers.filter_level')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('customers.all_levels')}</SelectItem>
                <SelectItem value="Mới">{t('customers.new')}</SelectItem>
                <SelectItem value="Thành viên">{t('customers.member')}</SelectItem>
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
          <CardTitle>{t('customers.customer_list')}</CardTitle>
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
                <TableHead>{t('customers.customer')}</TableHead>
                <TableHead>{t('customers.contact')}</TableHead>
                <TableHead>{t('customers.birthday')}</TableHead>
                <TableHead>{t('customers.points')}</TableHead>
                <TableHead>{t('customers.level')}</TableHead>
                <TableHead>{t('customers.last_visit')}</TableHead>
                <TableHead>{t('customers.total_spent')}</TableHead>
                <TableHead>{t('customers.actions')}</TableHead>
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
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCustomer(customer);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(customer.id, customer.name);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
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
