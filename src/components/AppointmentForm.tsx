
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useSalonStore } from "@/stores/useSalonStore";
import { ServiceStaffSelector } from "@/components/appointments/ServiceStaffSelector";

const appointmentSchema = z.object({
  date: z.date({
    required_error: "Vui lòng chọn ngày.",
  }),
  time: z.string().min(1, "Vui lòng chọn giờ."),
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Vui lòng nhập tên khách hàng."),
  customerPhone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số."),
  customerEmail: z.string().email("Email không hợp lệ.").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface ServiceStaffItem {
  id: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  price: number;
  duration: number;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  customer: string;
  phone: string;
  service: string;
  duration: string;
  price: string;
  status: string;
  staff: string;
}

interface AppointmentFormProps {
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
  editData?: Appointment;
}

export function AppointmentForm({ onClose, onSubmit, editData }: AppointmentFormProps) {
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedServiceStaffItems, setSelectedServiceStaffItems] = useState<ServiceStaffItem[]>([]);

  // Get data from Zustand store
  const { 
    customers, 
    services, 
    employees, 
    addAppointment, 
    updateAppointment
  } = useSalonStore();

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerName: editData?.customer || "",
      customerPhone: editData?.phone || "",
      customerEmail: "",
      notes: "",
      date: editData ? new Date(editData.date) : undefined,
      time: editData?.time || "",
    },
  });

  useEffect(() => {
    if (editData) {
      // Parse existing service and staff data for editing
      const service = services.find(s => s.name === editData.service);
      const employee = employees.find(e => e.name === editData.staff);
      
      if (service && employee) {
        const editItem: ServiceStaffItem = {
          id: `${service.id}-${employee.id}-edit`,
          serviceId: service.id,
          serviceName: service.name,
          staffId: employee.id,
          staffName: employee.name,
          price: service.price,
          duration: service.duration
        };
        setSelectedServiceStaffItems([editItem]);
      }
    }
  }, [editData, services, employees]);

  const handleFormSubmit = (data: AppointmentFormData) => {
    if (selectedServiceStaffItems.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một dịch vụ và nhân viên",
        variant: "destructive"
      });
      return;
    }

    console.log("Appointment data:", data);
    console.log("Selected services and staff:", selectedServiceStaffItems);
    
    if (editData) {
      // For editing, use the first selected service/staff combination
      const firstItem = selectedServiceStaffItems[0];
      const updateData = {
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
        serviceId: firstItem.serviceId,
        staffId: firstItem.staffId
      };
      updateAppointment(editData.id, updateData);
      toast({
        title: "Lịch hẹn đã được cập nhật!",
        description: `Lịch hẹn cho ${data.customerName} vào ${format(data.date, "dd/MM/yyyy")} lúc ${data.time}`,
      });
    } else {
      // For new appointments, create multiple appointments if multiple services are selected
      selectedServiceStaffItems.forEach((item, index) => {
        const appointmentData = {
          ...data,
          serviceId: item.serviceId,
          staffId: item.staffId
        };
        
        addAppointment(appointmentData);
        
        if (index === 0) {
          toast({
            title: "Lịch hẹn đã được tạo!",
            description: `${selectedServiceStaffItems.length > 1 ? `Đã tạo ${selectedServiceStaffItems.length} lịch hẹn` : 'Lịch hẹn'} cho ${data.customerName} vào ${format(data.date, "dd/MM/yyyy")} lúc ${data.time}`,
          });
        }
      });
    }
    
    onSubmit(data);
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      form.setValue("customerId", customerId);
      form.setValue("customerName", customer.name);
      form.setValue("customerPhone", customer.phone);
      form.setValue("customerEmail", customer.email || "");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Date and Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarIcon className="w-4 h-4" />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm">Ngày</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal h-9",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Giờ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn giờ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!editData && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!isNewCustomer ? "default" : "outline"}
                  onClick={() => setIsNewCustomer(false)}
                  className="flex-1 h-8 text-sm"
                  size="sm"
                >
                  Khách cũ
                </Button>
                <Button
                  type="button"
                  variant={isNewCustomer ? "default" : "outline"}
                  onClick={() => setIsNewCustomer(true)}
                  className="flex-1 h-8 text-sm"
                  size="sm"
                >
                  Khách mới
                </Button>
              </div>
            )}

            {!isNewCustomer && !editData && (
              <div>
                <Label className="text-sm">Chọn khách hàng</Label>
                <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue placeholder="Chọn khách hàng có sẵn" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Tên khách hàng</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập SĐT" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập email" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Service and Staff Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scissors className="w-4 h-4" />
              Dịch vụ & Nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceStaffSelector
              selectedItems={selectedServiceStaffItems}
              onItemsChange={setSelectedServiceStaffItems}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <textarea
                      placeholder="Ghi chú thêm về lịch hẹn..."
                      className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="h-9">
            Hủy
          </Button>
          <Button type="submit" className="bg-pink-600 hover:bg-pink-700 h-9">
            {editData ? "Cập nhật lịch hẹn" : "Tạo lịch hẹn"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
