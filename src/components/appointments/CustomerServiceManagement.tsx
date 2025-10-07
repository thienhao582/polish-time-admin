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

interface HistoryInvoice {
  id: string;
  invoice_number: string;
  created_at: string;
  total: number;
  subtotal: number;
  discount: number;
  payment_status: string;
  payment_method: string;
  services: any[];
  notes?: string;
  appointment_id?: string;
}

export function CustomerServiceManagement({
  isOpen,
  onOpenChange,
}: CustomerServiceManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [historyInvoices, setHistoryInvoices] = useState<HistoryInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<HistoryInvoice | null>(null);
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
        // Group demo appointments by invoice
        const invoiceMap = new Map<string, HistoryInvoice>();
        
        demoAppointments
          .filter(apt => 
            apt.customer.toLowerCase() === customer.name.toLowerCase() ||
            (customer.phone && apt.phone === customer.phone)
          )
          .forEach(apt => {
            const invoiceData = (apt as any).invoiceData;
            if (!invoiceData) return;
            
            const invoiceId = apt.id.toString();
            if (!invoiceMap.has(invoiceId)) {
              // Get staff name from apt.staff or apt.employee_name
              const staffName = apt.staff || (apt as any).employee_name;
              
              // If invoiceData.services exists, enrich it with staff info
              let services;
              if (invoiceData.services && Array.isArray(invoiceData.services)) {
                services = invoiceData.services.map((service: any) => ({
                  ...service,
                  staff: service.staff && service.staff.length > 0 
                    ? service.staff 
                    : (staffName ? [{ name: staffName }] : [])
                }));
              } else {
                // Create service from appointment data
                services = [{
                  name: apt.service,
                  price: parseFloat(apt.price.replace(/[^\d]/g, '')) || 0,
                  staff: staffName ? [{ name: staffName }] : [],
                  tip: invoiceData.tip || 0,
                  staffTips: invoiceData.staffTips || {}
                }];
              }
              
              const subtotal = services.reduce((sum: number, s: any) => sum + (s.price || 0), 0);
              const totalTip = services.reduce((sum: number, s: any) => sum + (s.tip || 0), 0);
              
              invoiceMap.set(invoiceId, {
                id: invoiceId,
                invoice_number: `#${invoiceId.slice(0, 3)}`,
                created_at: `${apt.date}T${apt.time}:00`,
                total: Math.round(subtotal * 1.08) + totalTip,
                subtotal,
                discount: 0,
                payment_status: apt.status === 'completed' ? 'paid' : 'pending',
                payment_method: 'cash',
                services,
                notes: apt.notes,
                appointment_id: invoiceId
              });
            }
          });
        
        const invoices = Array.from(invoiceMap.values())
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setHistoryInvoices(invoices);
      } else {
        // Load invoices from Supabase
        let query = supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });

        if (customer.phone) {
          query = query.or(`customer_name.ilike.%${customer.name}%,customer_id.in.(select id from customers where phone.eq.${customer.phone})`);
        } else {
          query = query.ilike('customer_name', `%${customer.name}%`);
        }

        const { data: invoicesData, error } = await query;

        if (error) {
          console.error('Error loading customer invoices:', error);
          toast.error("Không thể tải lịch sử hóa đơn");
          return;
        }

        // Enrich invoices with staff information from appointments
        const enrichedInvoices = await Promise.all((invoicesData || []).map(async (invoice) => {
          if (invoice.appointment_id) {
            const { data: appointment } = await supabase
              .from('appointments')
              .select('employee_name')
              .eq('id', invoice.appointment_id)
              .maybeSingle();

            if (appointment && appointment.employee_name) {
              // Update services with staff information if not already present
              const enrichedServices = (invoice.services as any[]).map((service: any) => ({
                ...service,
                staff: (service.staff && service.staff.length > 0) 
                  ? service.staff 
                  : [{ name: appointment.employee_name }]
              }));
              
              return {
                ...invoice,
                services: enrichedServices
              };
            }
          }
          return invoice;
        }));

        setHistoryInvoices(enrichedInvoices as HistoryInvoice[]);
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

  const loadInvoiceData = async (invoiceId: string) => {
    if (isDemoMode) {
      // In demo mode, find the invoice from historyInvoices
      const invoice = historyInvoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        setInvoiceData(invoice);
        
        // Initialize staff tips with existing values or 0
        if (invoice.services?.[0]?.staffTips) {
          setStaffTips(invoice.services[0].staffTips);
        } else {
          // Initialize all staff tips to 0 if not exists
          const initialTips: { [key: string]: number } = {};
          const services = Array.isArray(invoice.services) ? invoice.services : [];
          services.forEach((service: any, idx: number) => {
            const staff = Array.isArray(service?.staff) ? service.staff : [];
            staff.forEach((staffMember: any) => {
              const staffKey = `${staffMember.name}-${idx}`;
              initialTips[staffKey] = staffMember.tip || 0;
            });
          });
          setStaffTips(initialTips);
        }
      } else {
        setInvoiceData(null);
        setStaffTips({});
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();

      if (error) {
        console.error('Error loading invoice:', error);
        setInvoiceData(null);
        setStaffTips({});
        return;
      }

      setInvoiceData(data);
      
      // Initialize staff tips with existing values or 0
      if (data?.services?.[0]?.staffTips) {
        setStaffTips(data.services[0].staffTips);
      } else {
        // Initialize all staff tips to 0 if not exists
        const initialTips: { [key: string]: number } = {};
        const services = Array.isArray(data?.services) ? data.services : [];
        services.forEach((service: any, idx: number) => {
          const staff = Array.isArray(service?.staff) ? service.staff : [];
          staff.forEach((staffMember: any) => {
            const staffKey = `${staffMember.name}-${idx}`;
            initialTips[staffKey] = staffMember.tip || 0;
          });
        });
        setStaffTips(initialTips);
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

  const handlePrintInvoice = (invoice: HistoryInvoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Không thể mở cửa sổ in");
      return;
    }

    const totalTip = invoice.services.reduce((sum: number, s: any) => sum + (s.tip || 0), 0);
    const servicesHTML = invoice.services.map((service: any) => `
      <tr>
        <td>${service.name}</td>
        <td>${service.staff?.map((s: any) => s.name).join(', ') || 'N/A'}</td>
        <td style="text-align: right;">${(service.price || 0).toLocaleString('vi-VN')}đ</td>
      </tr>
    `).join('');

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hóa đơn - ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .invoice-details table { width: 100%; border-collapse: collapse; }
          .invoice-details td, .invoice-details th { padding: 8px; border-bottom: 1px solid #ddd; }
          .invoice-details th { text-align: left; background-color: #f5f5f5; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN DỊCH VỤ</h1>
          <p>Mã hóa đơn: ${invoice.invoice_number}</p>
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
              <td>${format(new Date(invoice.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}</td>
            </tr>
          </table>

          <h3 style="margin-top: 20px;">Dịch vụ:</h3>
          <table>
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Nhân viên</th>
                <th style="text-align: right;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHTML}
            </tbody>
          </table>

          <div style="margin-top: 20px; padding-top: 10px; border-top: 2px solid #333;">
            <table style="width: 100%;">
              <tr>
                <td style="text-align: right; padding: 4px;"><strong>Subtotal:</strong></td>
                <td style="text-align: right; padding: 4px; width: 150px;">${invoice.subtotal.toLocaleString('vi-VN')}đ</td>
              </tr>
              <tr>
                <td style="text-align: right; padding: 4px;"><strong>Discount:</strong></td>
                <td style="text-align: right; padding: 4px;">${invoice.discount.toLocaleString('vi-VN')}đ</td>
              </tr>
              <tr>
                <td style="text-align: right; padding: 4px;"><strong>VAT (8%):</strong></td>
                <td style="text-align: right; padding: 4px;">${Math.round(invoice.subtotal * 0.08).toLocaleString('vi-VN')}đ</td>
              </tr>
              <tr>
                <td style="text-align: right; padding: 4px;"><strong>Tip:</strong></td>
                <td style="text-align: right; padding: 4px;">${totalTip.toLocaleString('vi-VN')}đ</td>
              </tr>
              <tr style="font-size: 20px;">
                <td style="text-align: right; padding: 8px; border-top: 2px solid #333;"><strong>Tổng cộng:</strong></td>
                <td style="text-align: right; padding: 8px; border-top: 2px solid #333;"><strong>${invoice.total.toLocaleString('vi-VN')}đ</strong></td>
              </tr>
            </table>
          </div>
        </div>
        
        <script>
          window.print();
          window.onafterprint = function() { window.close(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
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
                  <h4 className="font-semibold mb-3">Lịch sử hóa đơn ({historyInvoices.length})</h4>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Đang tải...</div>
                  ) : historyInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Chưa có hóa đơn
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[calc(90vh-400px)] overflow-y-auto">
                      {historyInvoices.map((invoice) => {
                        const totalTip = invoice.services.reduce((sum: number, s: any) => sum + (s.tip || 0), 0);
                        const serviceCount = invoice.services.length;
                        const serviceNames = invoice.services.map((s: any) => s.name).join(', ');
                        
                        return (
                          <div 
                            key={invoice.id} 
                            className="border rounded-lg p-3 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{invoice.invoice_number}</span>
                                <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                                  {invoice.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="font-medium text-green-600 text-sm">
                                    {invoice.total.toLocaleString('vi-VN')}đ
                                  </div>
                                  {totalTip > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      Tip: {totalTip.toLocaleString('vi-VN')}đ
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    loadInvoiceData(invoice.id);
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-600 mb-1">
                              {serviceCount} dịch vụ: {serviceNames}
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(invoice.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </div>

                            {invoice.notes && (
                              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                                {invoice.notes}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Hóa đơn thanh toán</DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 pr-2">
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="text-center pb-4 border-b">
                <div className="text-3xl font-bold mb-2">{selectedInvoice.invoice_number}</div>
                <div className="text-xl font-semibold mb-1">{selectedCustomer?.name}</div>
                {selectedCustomer?.phone && (
                  <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  {format(new Date(selectedInvoice.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                </div>
              </div>

              {/* Services Section */}
              <div>
                <h3 className="font-semibold mb-3">Dịch vụ đã sử dụng</h3>
                <div className="space-y-2">
                  {selectedInvoice.services.map((service: any, idx: number) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Nhân viên: {service.staff?.map((s: any) => s.name).join(', ') || 'Chưa phân công'}
                          </div>
                        </div>
                        <div className="text-lg font-semibold">
                          {(service.price || 0).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Tips Section */}
              {invoiceData && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Tip cho nhân viên</h3>
                  {(() => {
                    // Get original total tip from invoice
                    // Formula: total = subtotal + VAT + tip - discount
                    // So: tip = total - subtotal - VAT + discount
                    const vat = Math.round(selectedInvoice.subtotal * 0.08);
                    const invoiceTotalTip = selectedInvoice.total - selectedInvoice.subtotal - vat + selectedInvoice.discount;
                    // Calculate total tip already distributed to staff
                    const distributedTip = Object.values(staffTips).reduce((sum, tip) => sum + tip, 0);
                    // Remaining tip = Total tip - Distributed tip
                    const remainingTip = invoiceTotalTip - distributedTip;
                    
                    return (
                      <div className="space-y-3">
                        {invoiceData.services?.map((service: any, idx: number) => {
                          if (!service.staff || service.staff.length === 0) return null;
                          
                          return service.staff.map((staffMember: any) => {
                            const staffKey = `${staffMember.name}-${idx}`;
                            const currentStaffTip = staffTips[staffKey] || 0;
                            
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
                                    value={currentStaffTip}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      
                                      // Allow empty input for editing
                                      if (inputValue === '') {
                                        setStaffTips(prev => ({
                                          ...prev,
                                          [staffKey]: 0
                                        }));
                                        return;
                                      }
                                      
                                      const newValue = Number(inputValue);
                                      
                                      // Validate: must be >= 0
                                      if (newValue < 0 || isNaN(newValue)) {
                                        return;
                                      }
                                      
                                      setStaffTips(prev => ({
                                        ...prev,
                                        [staffKey]: newValue
                                      }));
                                    }}
                                    onBlur={(e) => {
                                      // Ensure value is a valid number on blur
                                      if (e.target.value === '' || isNaN(Number(e.target.value))) {
                                        setStaffTips(prev => ({
                                          ...prev,
                                          [staffKey]: 0
                                        }));
                                      }
                                    }}
                                    className="w-28 h-8 text-right"
                                    min="0"
                                    step="0.001"
                                  />
                                  <span className="text-sm">đ</span>
                                </div>
                              </div>
                            );
                          });
                        })}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm font-medium pt-2 border-t">
                            <span>Tổng tip:</span>
                            <span>
                              {invoiceTotalTip.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Còn lại:</span>
                            <span className={remainingTip < 0 ? 'text-red-600' : 'text-green-600'}>
                              {remainingTip.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Tổng kết thanh toán</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{selectedInvoice.subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>{selectedInvoice.discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (8%):</span>
                    <span>{Math.round(selectedInvoice.subtotal * 0.08).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tip:</span>
                    <span>{Math.round(selectedInvoice.total - (selectedInvoice.subtotal - selectedInvoice.discount + Math.round(selectedInvoice.subtotal * 0.08))).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span>{selectedInvoice.total.toLocaleString('vi-VN')}đ</span>
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
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
