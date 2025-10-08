
import { useState } from "react";
import { Receipt, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
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
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { Invoice, useInvoiceStore } from "@/stores/useInvoiceStore";
import { useToast } from "@/hooks/use-toast";

const Invoices = () => {
  const { invoices, deleteInvoice, updateInvoiceStatus, getTotalRevenue } = useInvoiceStore();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalRevenue = getTotalRevenue();
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid').length;

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setInvoiceFormOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingInvoice) {
      deleteInvoice(deletingInvoice.id);
      toast({
        title: "Thành công",
        description: "Xóa hóa đơn thành công"
      });
      setDeleteDialogOpen(false);
      setDeletingInvoice(null);
    }
  };

  const handleStatusChange = (invoice: Invoice, newStatus: Invoice['status']) => {
    updateInvoiceStatus(invoice.id, newStatus);
    toast({
      title: "Thành công",
      description: "Cập nhật trạng thái hóa đơn thành công"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return "bg-green-100 text-green-800";
      case 'unpaid': return "bg-yellow-100 text-yellow-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return "Đã thanh toán";
      case 'unpaid': return "Chưa thanh toán";
      case 'cancelled': return "Đã hủy";
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Hóa Đơn</h1>
          <p className="text-gray-600 mt-1">Quản lý hóa đơn và thanh toán</p>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700"
          onClick={() => {
            setEditingInvoice(null);
            setInvoiceFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo hóa đơn
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng hóa đơn</p>
                <p className="text-2xl font-bold text-gray-800">{invoices.length}</p>
              </div>
              <Receipt className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã thanh toán</p>
                <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chưa thanh toán</p>
                <p className="text-2xl font-bold text-yellow-600">{unpaidInvoices}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Receipt className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-600">${(totalRevenue / 1000).toFixed(1)}K</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo mã hóa đơn, tên khách hàng hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã hóa đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.customerName}</p>
                      <p className="text-sm text-gray-600">{invoice.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatPrice(invoice.total)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={invoice.status}
                      onValueChange={(value: Invoice['status']) => handleStatusChange(invoice, value)}
                    >
                      <SelectTrigger className="w-auto">
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusText(invoice.status)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(invoice)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDelete(invoice)}
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

      <InvoiceForm 
        open={invoiceFormOpen}
        onOpenChange={(open) => {
          setInvoiceFormOpen(open);
          if (!open) setEditingInvoice(null);
        }}
        invoice={editingInvoice}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hóa đơn "{deletingInvoice?.invoiceNumber}"? 
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

export default Invoices;
