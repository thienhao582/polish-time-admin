import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Search, FileText, Printer, Phone, Mail, Eye, Save } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useSalonStore } from "@/stores/useSalonStore";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { toast } from "sonner";

interface CustomerServiceManagementProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
}

interface HistoryAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  employee_name: string;
  status: string;
  duration_minutes: number;
  price: number;
  notes?: string;
  tip?: number;
}

export function CustomerServiceManagement({
  isOpen,
  onOpenChange,
}: CustomerServiceManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [historyAppointments, setHistoryAppointments] = useState<HistoryAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<HistoryAppointment | null>(null);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [staffTips, setStaffTips] = useState<{ [key: string]: number }>({});
  const [isSavingTip, setIsSavingTip] = useState(false);
  const { appointments: demoAppointments, customers: demoCustomers } = useSalonStore();
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen, isDemoMode]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // Create customer list from demo appointments
        const customerMap = new Map<string, Customer>();
        
        demoAppointments.forEach(apt => {
          const key = apt.phone || apt.customer;
          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: key,
              name: apt.customer,
              phone: apt.phone,
              totalVisits: 0,
              totalSpent: 0,
            });
          }
          
          const customer = customerMap.get(key)!;
          customer.totalVisits++;
          if (apt.status === 'completed') {
            customer.totalSpent += parseFloat(apt.price.replace(/[^\d]/g, '')) || 0;
          }
          if (!customer.lastVisit || apt.date > customer.lastVisit) {
            customer.lastVisit = apt.date;
          }
        });

        setCustomers(Array.from(customerMap.values()));
      } else {
        // Load from Supabase
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: false });

        if (appointmentsData) {
          const customerMap = new Map<string, Customer>();
          
          appointmentsData.forEach(apt => {
            const key = apt.customer_phone || apt.customer_name;
            if (!customerMap.has(key)) {
              customerMap.set(key, {
                id: key,
                name: apt.customer_name,
                phone: apt.customer_phone,
                totalVisits: 0,
                totalSpent: 0,
              });
            }
            
            const customer = customerMap.get(key)!;
            customer.totalVisits++;
            if (apt.status === 'completed') {
              customer.totalSpent += (typeof apt.price === 'number' ? apt.price : parseFloat(String(apt.price))) || 0;
            }
            if (!customer.lastVisit || apt.appointment_date > customer.lastVisit) {
              customer.lastVisit = apt.appointment_date;
            }
          });

          setCustomers(Array.from(customerMap.values()));
        }
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerHistory = async (customer: Customer) => {
    setLoading(true);
    try {
      if (isDemoMode) {
        const history = demoAppointments
          .filter(apt => 
            apt.customer.toLowerCase() === customer.name.toLowerCase() ||
            (customer.phone && apt.phone === customer.phone)
          )
          .map(apt => {
            // Get tip from invoiceData if available
            const invoiceData = (apt as any).invoiceData;
            const tip = invoiceData?.services?.[0]?.tip || 0;
            
            return {
              id: apt.id.toString(),
              appointment_date: apt.date,
              appointment_time: apt.time,
              service_name: apt.service,
              employee_name: apt.staff || "Chưa phân công",
              status: apt.status,
              duration_minutes: parseInt(apt.duration.match(/(\d+)/)?.[1] || "60"),
              price: parseFloat(apt.price.replace(/[^\d]/g, '')) || 0,
              notes: apt.notes,
              tip
            };
          })
          .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
        
        setHistoryAppointments(history);
      } else {
        let query = supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: false })
          .order('appointment_time', { ascending: false });

        if (customer.phone) {
          query = query.or(`customer_name.ilike.%${customer.name}%,customer_phone.eq.${customer.phone}`);
        } else {
          query = query.ilike('customer_name', `%${customer.name}%`);
        }

        const { data: appointmentsData, error } = await query;

        if (error) {
          console.error('Error loading customer history:', error);
          toast.error("Không thể tải lịch sử khách hàng");
          return;
        }

        // Load invoice data for each appointment to get tip information
        const appointmentsWithTips = await Promise.all(
          (appointmentsData || []).map(async (apt) => {
            const { data: invoiceData } = await supabase
              .from('invoices')
              .select('services')
              .eq('appointment_id', apt.id)
              .maybeSingle();
            
            const tip = invoiceData?.services?.[0]?.tip || 0;
            
            return {
              ...apt,
              tip
            };
          })
        );

        setHistoryAppointments(appointmentsWithTips);
      }
    } catch (error) {
      console.error('Error loading customer history:', error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    loadCustomerHistory(customer);
  };

  const loadInvoiceData = async (appointmentId: string) => {
    if (isDemoMode) {
      setInvoiceData(null);
      setStaffTips({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (error) {
        console.error('Error loading invoice:', error);
        setInvoiceData(null);
        setStaffTips({});
        return;
      }

      setInvoiceData(data);
      
      // Load tip distribution from invoice services
      if (data?.services?.[0]?.staffTips) {
        setStaffTips(data.services[0].staffTips);
      } else {
        setStaffTips({});
      }
    } catch (error) {
      console.error('Error loading invoice data:', error);
      setInvoiceData(null);
      setStaffTips({});
    }
  };

  const handleSaveTip = async () => {
    if (!invoiceData || isDemoMode) {
      toast.error("Không thể cập nhật tip trong chế độ demo");
      return;
    }

    setIsSavingTip(true);
    try {
      const totalTip = Object.values(staffTips).reduce((sum, tip) => sum + tip, 0);
      
      const updatedServices = invoiceData.services.map((service: any, index: number) => {
        if (index === 0) {
          return { ...service, tip: totalTip, staffTips };
        }
        return service;
      });

      const { error } = await supabase
        .from('invoices')
        .update({ 
          services: updatedServices,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceData.id);

      if (error) throw error;

      toast.success("Đã cập nhật tip thành công");
      setInvoiceData({ ...invoiceData, services: updatedServices });
    } catch (error) {
      console.error('Error updating tip:', error);
      toast.error("Không thể cập nhật tip");
    } finally {
      setIsSavingTip(false);
    }
  };

  const handlePrintInvoice = (appointment: HistoryAppointment) => {
    // Create a printable invoice
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Không thể mở cửa sổ in");
      return;
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hóa đơn - ${appointment.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .invoice-details table { width: 100%; border-collapse: collapse; }
          .invoice-details td { padding: 8px; border-bottom: 1px solid #ddd; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN DỊCH VỤ</h1>
          <p>Mã hóa đơn: ${appointment.id}</p>
        </div>
        
        <div class="invoice-details">
          <table>
            <tr>
              <td><strong>Khách hàng:</strong></td>
              <td>${selectedCustomer?.name || ''}</td>
            </tr>
            <tr>
              <td><strong>Số điện thoại:</strong></td>
              <td>${selectedCustomer?.phone || 'Không có'}</td>
            </tr>
            <tr>
              <td><strong>Ngày:</strong></td>
              <td>${format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: vi })}</td>
            </tr>
            <tr>
              <td><strong>Giờ:</strong></td>
              <td>${appointment.appointment_time}</td>
            </tr>
            <tr>
              <td><strong>Dịch vụ:</strong></td>
              <td>${appointment.service_name}</td>
            </tr>
            <tr>
              <td><strong>Thời gian:</strong></td>
              <td>${appointment.duration_minutes} phút</td>
            </tr>
            <tr>
              <td><strong>Nhân viên:</strong></td>
              <td>${appointment.employee_name}</td>
            </tr>
            ${appointment.notes ? `
            <tr>
              <td><strong>Ghi chú:</strong></td>
              <td>${appointment.notes}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div class="total">
          Tổng tiền: ${appointment.price.toLocaleString('vi-VN')}đ
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    toast.success("Đang in hóa đơn...");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Xác nhận", className: "bg-status-confirmed" },
      "in-progress": { label: "Đang làm", className: "bg-status-in-progress" },
      completed: { label: "Hoàn thành", className: "bg-status-completed" },
      cancelled: { label: "Đã hủy", className: "bg-status-cancelled" },
      pending: { label: "Chờ xác nhận", className: "bg-status-pending" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, className: "bg-gray-100 text-gray-700" };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quản lý dịch vụ khách hàng
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Customer List */}
          <div className="border-r pr-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loading && !selectedCustomer ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : (
              <div className="space-y-2 max-h-[calc(90vh-220px)] overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedCustomer?.id === customer.id ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <div className="font-medium">{customer.name}</div>
                    {customer.phone && (
                      <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{customer.totalVisits} lượt</span>
                      <span className="text-green-600 font-medium">
                        {customer.totalSpent.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer History */}
          <div className="col-span-2">
            {!selectedCustomer ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <User className="w-16 h-16 mb-4" />
                <p>Chọn khách hàng để xem lịch sử</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{selectedCustomer.name}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Tổng lượt đến</div>
                      <div className="text-xl font-bold text-blue-600">{selectedCustomer.totalVisits}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Tổng chi tiêu</div>
                      <div className="text-xl font-bold text-green-600">
                        {selectedCustomer.totalSpent.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Lần cuối</div>
                      <div className="text-lg font-medium">
                        {selectedCustomer.lastVisit ? format(new Date(selectedCustomer.lastVisit), "dd/MM/yy") : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* History List */}
                <div>
                  <h4 className="font-semibold mb-3">Lịch sử dịch vụ ({historyAppointments.length})</h4>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Đang tải...</div>
                  ) : historyAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Chưa có lịch sử
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[calc(90vh-400px)] overflow-y-auto">
                      {historyAppointments.map((appointment) => (
                        <div 
                          key={appointment.id} 
                          className="border rounded-lg p-3 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{appointment.service_name}</span>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="font-medium text-green-600 text-sm">
                                  {appointment.price.toLocaleString('vi-VN')}đ
                                </div>
                                {appointment.tip && appointment.tip > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Tip: {appointment.tip.toLocaleString('vi-VN')}đ
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedInvoice(appointment);
                                  loadInvoiceData(appointment.id);
                                }}
                                className="h-7 w-7 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(appointment.appointment_date), "dd/MM/yyyy")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appointment.appointment_time}
                            </div>
                            <div className="flex items-center gap-1 col-span-2">
                              <User className="w-3 h-3" />
                              {appointment.employee_name}
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hóa đơn thanh toán</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="text-center pb-4 border-b">
                <div className="text-3xl font-bold mb-2">#{selectedInvoice.id.slice(0, 8)}</div>
                <div className="text-xl font-semibold mb-1">{selectedCustomer?.name}</div>
                {selectedCustomer?.phone && (
                  <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  {format(new Date(selectedInvoice.appointment_date), "dd/MM/yyyy HH:mm", { locale: vi })}
                </div>
              </div>

              {/* Services Section */}
              <div>
                <h3 className="font-semibold mb-3">Dịch vụ đã sử dụng</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{selectedInvoice.service_name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Nhân viên: {selectedInvoice.employee_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Thời gian: {selectedInvoice.duration_minutes} phút
                      </div>
                    </div>
                    <div className="text-lg font-semibold">
                      {selectedInvoice.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Tips Section */}
              {invoiceData && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Tip cho nhân viên</h3>
                  <div className="space-y-3">
                    {invoiceData.services?.map((service: any, idx: number) => {
                      if (!service.staff || service.staff.length === 0) return null;
                      
                      return service.staff.map((staffMember: any) => {
                        const staffKey = `${staffMember.name}-${idx}`;
                        return (
                          <div key={staffKey} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                            <div>
                              <div className="font-medium">{staffMember.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Dịch vụ: {service.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={staffTips[staffKey] || 0}
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  setStaffTips(prev => ({
                                    ...prev,
                                    [staffKey]: newValue >= 0 ? newValue : 0
                                  }));
                                }}
                                className="w-28 h-8 text-right"
                                min="0"
                              />
                              <span className="text-sm">đ</span>
                            </div>
                          </div>
                        );
                      });
                    })}
                    <div className="flex justify-between text-sm font-medium pt-2 border-t">
                      <span>Tổng tip:</span>
                      <span>{Object.values(staffTips).reduce((sum, tip) => sum + tip, 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Tổng kết thanh toán</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{selectedInvoice.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>0đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (8%):</span>
                    <span>{Math.round(selectedInvoice.price * 0.08).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tip:</span>
                    <span>{Object.values(staffTips).reduce((sum, tip) => sum + tip, 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span>{(Math.round(selectedInvoice.price * 1.08) + Object.values(staffTips).reduce((sum, tip) => sum + tip, 0)).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm font-medium mb-1">Ghi chú:</div>
                  <div className="text-sm text-muted-foreground">{selectedInvoice.notes}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                  className="flex-1"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  In hóa đơn
                </Button>
                {!isDemoMode && invoiceData && (
                  <Button
                    onClick={handleSaveTip}
                    disabled={isSavingTip}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSavingTip ? "Đang lưu..." : "Lưu tip"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
