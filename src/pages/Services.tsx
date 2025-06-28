
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ServiceStats } from "@/components/services/ServiceStats";
import { ServiceFilters } from "@/components/services/ServiceFilters";
import { ServiceTable } from "@/components/services/ServiceTable";
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

      <ServiceStats services={services} />

      <ServiceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categories={categories}
      />

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceTable
            services={paginatedServices}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

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

      <ServiceForm 
        open={serviceFormOpen}
        onOpenChange={(open) => {
          setServiceFormOpen(open);
          if (!open) setEditingService(null);
        }}
        service={editingService}
      />

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
