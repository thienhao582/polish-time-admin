
import { useState } from "react";
import { Scissors, Plus, Search, Clock, DollarSign, Eye, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ServiceForm } from "@/components/ServiceForm";
import { Service, useSalonStore } from "@/stores/useSalonStore";
import { useToast } from "@/hooks/use-toast";

const Services = () => {
  const { services, deleteService, toggleServiceStatus } = useSalonStore();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const itemsPerPage = 10;

  // Get unique categories
  const categories = Array.from(new Set(services.map(s => s.category)));

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const activeServices = services.filter(s => s.status === 'active').length;
  const avgPrice = services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length / 1000) : 0;
  const avgDuration = services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0;

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setServiceFormOpen(true);
  };

  const handleDelete = (service: Service) => {
    setDeletingService(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingService) {
      deleteService(deletingService.id);
      toast({
        title: "Thành công",
        description: "Xóa dịch vụ thành công"
      });
      setDeleteDialogOpen(false);
      setDeletingService(null);
    }
  };

  const handleToggleStatus = (service: Service) => {
    toggleServiceStatus(service.id);
    toast({
      title: "Thành công",
      description: `Đã ${service.status === 'active' ? 'tạm ngưng' : 'kích hoạt'} dịch vụ`
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Dịch Vụ</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục và giá dịch vụ</p>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700"
          onClick={() => {
            setEditingService(null);
            setServiceFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm dịch vụ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng dịch vụ</p>
                <p className="text-2xl font-bold text-gray-800">{services.length}</p>
              </div>
              <Scissors className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{activeServices}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Power className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Giá trung bình</p>
                <p className="text-2xl font-bold text-green-600">{avgPrice}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thời gian TB</p>
                <p className="text-2xl font-bold text-blue-600">{avgDuration}p</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm dịch vụ theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Phân loại:</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Trạng thái:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang áp dụng</SelectItem>
                    <SelectItem value="inactive">Ngừng áp dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Giá tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {service.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{service.duration} phút</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatPrice(service.price)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status === 'active' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {service.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleStatus(service)}
                        className={service.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                      >
                        {service.status === 'active' ? 
                          <PowerOff className="w-4 h-4" /> : 
                          <Power className="w-4 h-4" />
                        }
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDelete(service)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Form Dialog */}
      <ServiceForm 
        open={serviceFormOpen}
        onOpenChange={(open) => {
          setServiceFormOpen(open);
          if (!open) setEditingService(null);
        }}
        service={editingService}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ "{deletingService?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Services;
