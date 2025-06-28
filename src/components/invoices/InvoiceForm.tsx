
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { Invoice, InvoiceItem, useInvoiceStore } from "@/stores/useInvoiceStore";
import { useSalonStore } from "@/stores/useSalonStore";
import { useToast } from "@/hooks/use-toast";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
}

export const InvoiceForm = ({ open, onOpenChange, invoice }: InvoiceFormProps) => {
  const { addInvoice, updateInvoice } = useInvoiceStore();
  const { enhancedCustomers, services, employees } = useSalonStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerId: "",
    discount: 0,
    paymentMethod: "cash" as "cash" | "card" | "transfer",
    notes: "",
    status: "unpaid" as "paid" | "unpaid" | "cancelled"
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({
    serviceId: "",
    employeeId: ""
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        customerId: invoice.customerId,
        discount: invoice.discount,
        paymentMethod: invoice.paymentMethod || "cash",
        notes: invoice.notes || "",
        status: invoice.status
      });
      setItems([...invoice.items]);
    } else {
      setFormData({
        customerId: "",
        discount: 0,
        paymentMethod: "cash",
        notes: "",
        status: "unpaid"
      });
      setItems([]);
    }
    setNewItem({ serviceId: "", employeeId: "" });
  }, [invoice, open]);

  const addItem = () => {
    if (!newItem.serviceId || !newItem.employeeId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn dịch vụ và nhân viên",
        variant: "destructive"
      });
      return;
    }

    const service = services.find(s => s.id === newItem.serviceId);
    const employee = employees.find(e => e.id === newItem.employeeId);

    if (!service || !employee) return;

    const item: InvoiceItem = {
      id: Date.now().toString(),
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
      employeeId: employee.id,
      employeeName: employee.name
    };

    setItems([...items, item]);
    setNewItem({ serviceId: "", employeeId: "" });
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal - formData.discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || items.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn khách hàng và thêm ít nhất một dịch vụ",
        variant: "destructive"
      });
      return;
    }

    const customer = enhancedCustomers.find(c => c.id === formData.customerId);
    if (!customer) return;

    const invoiceData = {
      customerId: formData.customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      items,
      subtotal,
      discount: formData.discount,
      total,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    };

    if (invoice) {
      updateInvoice(invoice.id, invoiceData);
      toast({
        title: "Thành công",
        description: "Cập nhật hóa đơn thành công"
      });
    } else {
      addInvoice(invoiceData);
      toast({
        title: "Thành công",
        description: "Tạo hóa đơn mới thành công"
      });
    }

    onOpenChange(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? "Sửa hóa đơn" : "Tạo hóa đơn mới"}
          </DialogTitle>
          <DialogDescription>
            {invoice ? "Cập nhật thông tin hóa đơn" : "Nhập thông tin hóa đơn mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="customer">Khách hàng *</Label>
            <Select 
              value={formData.customerId} 
              onValueChange={(value) => setFormData({...formData, customerId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khách hàng" />
              </SelectTrigger>
              <SelectContent>
                {enhancedCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-lg font-semibold">Dịch vụ</Label>
            <Card className="mt-2">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Dịch vụ</Label>
                    <Select 
                      value={newItem.serviceId} 
                      onValueChange={(value) => setNewItem({...newItem, serviceId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.filter(s => s.status === 'active').map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatPrice(service.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nhân viên</Label>
                    <Select 
                      value={newItem.employeeId} 
                      onValueChange={(value) => setNewItem({...newItem, employeeId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhân viên" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.filter(e => e.status === 'đang làm').map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="button" onClick={addItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm dịch vụ
                </Button>

                {items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.serviceName}</p>
                          <p className="text-sm text-gray-600">
                            {item.employeeName} • {item.duration} phút
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{formatPrice(item.price)}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount">Giảm giá (VNĐ)</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value: "cash" | "card" | "transfer") => setFormData({...formData, paymentMethod: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                  <SelectItem value="card">Thẻ</SelectItem>
                  <SelectItem value="transfer">Chuyển khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: "paid" | "unpaid" | "cancelled") => setFormData({...formData, status: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Ghi chú thêm..."
              rows={3}
            />
          </div>

          {items.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(formData.discount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
              {invoice ? "Cập nhật" : "Tạo hóa đơn"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
