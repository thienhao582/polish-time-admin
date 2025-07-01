
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

const appointmentSchema = z.object({
  date: z.date({
    required_error: "Vui lòng chọn ngày.",
  }),
  time: z.string().min(1, "Vui lòng chọn giờ."),
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Vui lòng nhập tên khách hàng."),
  customerPhone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số."),
  customerEmail: z.string().email("Email không hợp lệ.").optional().or(z.literal("")),
  serviceId: z.string().min(1, "Vui lòng chọn dịch vụ."),
  staffId: z.string().min(1, "Vui lòng chọn nhân viên."),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

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
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  // Get data from Zustand store - using employees instead of staff
  const { 
    customers, 
    services, 
    employees, 
    addAppointment, 
    updateAppointment,
    getAvailableEmployeesForService 
  } = useSalonStore();

  const [availableEmployees, setAvailableEmployees] = useState(employees);

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
      // Find service and staff IDs from editData
      const service = services.find(s => s.name === editData.service);
      const employee = employees.find(e => e.name === editData.staff);
      
      if (service) {
        setSelectedServiceId(service.id);
        form.setValue("serviceId", service.id);
      }
      if (employee) {
        form.setValue("staffId", employee.id);
      }
    }
  }, [editData, services, employees, form]);

  useEffect(() => {
    // Update available employees when service changes
    if (selectedServiceId) {
      const employeesForService = getAvailableEmployeesForService(selectedServiceId);
      setAvailableEmployees(employeesForService);
      
      // Reset staff selection if current selection is not available for the new service
      const currentStaffId = form.getValues("staffId");
      if (currentStaffId && !employeesForService.find(e => e.id === currentStaffId)) {
        form.setValue("staffId", "");
      }
    } else {
      setAvailableEmployees([]);
      form.setValue("staffId", "");
    }
  }, [selectedServiceId, form, getAvailableEmployeesForService]);

  const handleFormSubmit = (data: AppointmentFormData) => {
    console.log("Appointment data:", data);
    
    if (editData) {
      // Update existing appointment
      updateAppointment(editData.id, data);
      toast({
        title: "Lịch hẹn đã được cập nhật!",
        description: `Lịch hẹn cho ${data.customerName} vào ${format(data.date, "dd/MM/yyyy")} lúc ${data.time}`,
      });
    } else {
      // Save new appointment to Zustand store
      const newAppointment = addAppointment(data);
      toast({
        title: "Lịch hẹn đã được tạo!",
        description: `Lịch hẹn cho ${data.customerName} vào ${format(data.date, "dd/MM/yyyy")} lúc ${data.time}`,
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

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    form.setValue("serviceId", serviceId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Date and Time - Compact Layout */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="w-5 h-5" />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
                    <FormLabel>Giờ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

        {/* Customer Information - Compact Layout */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!editData && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!isNewCustomer ? "default" : "outline"}
                  onClick={() => setIsNewCustomer(false)}
                  className="flex-1"
                  size="sm"
                >
                  Khách cũ
                </Button>
                <Button
                  type="button"
                  variant={isNewCustomer ? "default" : "outline"}
                  onClick={() => setIsNewCustomer(true)}
                  className="flex-1"
                  size="sm"
                >
                  Khách mới
                </Button>
              </div>
            )}

            {!isNewCustomer && !editData && (
              <div>
                <Label>Chọn khách hàng</Label>
                <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger className="mt-1">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên khách hàng" {...field} />
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
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số điện thoại" {...field} />
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
                  <FormLabel>Email (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Service and Staff - Compact Layout */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scissors className="w-5 h-5" />
              Dịch vụ & Nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn dịch vụ</FormLabel>
                    <Select onValueChange={handleServiceSelect} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn dịch vụ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.filter(service => service.status === 'active').map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-gray-500">
                                {service.duration} phút - {service.price.toLocaleString()}đ
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn nhân viên</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhân viên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableEmployees.length > 0 ? (
                          availableEmployees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-gray-500">
                                  {employee.specialties.join(", ")}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-staff" disabled>
                            {selectedServiceId ? "Không có nhân viên cho dịch vụ này" : "Vui lòng chọn dịch vụ trước"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes - Compact */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Ghi chú</CardTitle>
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
                      className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
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
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
            {editData ? "Cập nhật lịch hẹn" : "Tạo lịch hẹn"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
