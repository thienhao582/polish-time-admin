import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, UserRound } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ServiceStaffSelector } from "@/components/appointments/ServiceStaffSelector";
import { CustomerHistoryPopup } from "@/components/appointments/CustomerHistoryPopup";
import { useSalonStore } from "@/stores/useSalonStore";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { generateTimeOptions } from "@/utils/timeUtils";

const appointmentFormSchema = z.object({
  date: z.date({
    required_error: "Vui lòng chọn ngày",
  }),
  time: z.string({
    required_error: "Vui lòng chọn giờ",
  }),
  customerName: z.string().min(2, {
    message: "Tên khách hàng phải có ít nhất 2 ký tự",
  }),
  customerPhone: z.string().min(10, {
    message: "Số điện thoại phải có ít nhất 10 ký tự",
  }),
  customerEmail: z.string().email().optional(),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

export function AppointmentForm({ onClose, onSubmit, editData }: AppointmentFormProps) {
  const { enhancedCustomers, deduplicateCustomers, services, employees } = useSalonStore();
  const { createAppointment, createCustomer } = useSupabaseData();
  const [serviceStaffItems, setServiceStaffItems] = useState<any[]>([]);
  const [customerType, setCustomerType] = useState<"new" | "existing">("new");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: editData?.date ? new Date(editData.date) : new Date(),
      time: editData?.time || "08:00",
      customerName: editData?.customer || "",
      customerPhone: editData?.phone || "",
      customerEmail: editData?.email || "",
      notes: editData?.notes || "",
    },
  });

  // Deduplicate customers when component loads
  useEffect(() => {
    deduplicateCustomers();
  }, [deduplicateCustomers]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = enhancedCustomers.find(c => c.id === customerId);
    if (customer) {
      form.setValue("customerName", customer.name);
      form.setValue("customerPhone", customer.phone);
      form.setValue("customerEmail", customer.email || "");
    }
  };

  const handleSubmit = async (data: any) => {
    console.log("Form data submitted:", data);
    console.log("Service staff items:", serviceStaffItems);
    
    if (serviceStaffItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    try {
      // Create customer if new customer
      let customerId = customerType === "existing" ? selectedCustomerId : undefined;
      
      if (customerType === "new") {
        // Check if customer with same phone already exists
        const existingCustomer = enhancedCustomers.find(c => c.phone === data.customerPhone);
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
          toast.info("Khách hàng đã tồn tại, sử dụng thông tin khách cũ");
        } else {
          const newCustomer = await createCustomer({
            name: data.customerName,
            phone: data.customerPhone,
            email: data.customerEmail || null
          });
          customerId = newCustomer.id;
          toast.success("Đã thêm khách hàng mới vào hệ thống");
        }
      }

      // For multiple services, create separate appointments for each service
      const appointments = [];
      
      for (const serviceStaffItem of serviceStaffItems) {
        const service = services.find(s => s.id === serviceStaffItem.serviceId);
        const employee = employees.find(e => serviceStaffItem.staffIds.includes(e.id));
        
        // Format date to YYYY-MM-DD
        const formattedDate = data.date instanceof Date 
          ? `${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, '0')}-${String(data.date.getDate()).padStart(2, '0')}`
          : data.date;

        const appointmentData: any = {
          appointment_date: formattedDate,
          appointment_time: data.time,
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          service_name: serviceStaffItem.serviceName || service?.name || "Unknown Service",
          employee_name: employee?.name || serviceStaffItem.staffNames[0] || "Unknown Staff",
          duration_minutes: serviceStaffItem.duration || service?.duration || 0,
          price: serviceStaffItem.price || service?.price || 0,
          status: "confirmed",
          notes: data.notes
        };

        // Only add UUID fields if they exist and are valid
        if (customerId && customerId.length > 10) {
          appointmentData.customer_id = customerId;
        }
        if (serviceStaffItem.serviceId && serviceStaffItem.serviceId.length > 10) {
          appointmentData.service_id = serviceStaffItem.serviceId;
        }
        if (employee?.id && employee.id.length > 10) {
          appointmentData.employee_id = employee.id;
        }

        const createdAppointment = await createAppointment(appointmentData);
        appointments.push(createdAppointment);
      }

      console.log("Appointments created:", appointments);
      toast.success("Tạo lịch hẹn thành công!");
      onSubmit({ appointments });
      onClose();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Có lỗi xảy ra khi tạo lịch hẹn");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
            Ngày
          </Label>
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {form.formState.errors.date && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="time" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
            Giờ
          </Label>
          <Controller
            control={form.control}
            name="time"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeOptions().map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.time && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.time.message}</p>
          )}
        </div>
      </div>

      {/* Customer Type Selection */}
      <div>
        <Label className="text-sm font-medium leading-none mb-3 block">
          Loại khách hàng
        </Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={customerType === "new" ? "default" : "outline"}
            onClick={() => {
              setCustomerType("new");
              setSelectedCustomerId("");
              form.setValue("customerName", "");
              form.setValue("customerPhone", "");
              form.setValue("customerEmail", "");
            }}
            className="flex-1"
          >
            <UserRound className="w-4 h-4 mr-2" />
            Khách mới
          </Button>
          <Button
            type="button"
            variant={customerType === "existing" ? "default" : "outline"}
            onClick={() => setCustomerType("existing")}
            className="flex-1"
          >
            <UserRound className="w-4 h-4 mr-2" />
            Khách cũ
          </Button>
        </div>
      </div>

      {/* Existing Customer Selection */}
      {customerType === "existing" && (
        <div>
          <Label className="text-sm font-medium leading-none mb-2 block">
            Chọn khách hàng
          </Label>
          <div className="flex gap-2">
            <Select onValueChange={handleCustomerChange} value={selectedCustomerId}>
              <SelectTrigger className="flex-1">
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
            
            {/* Customer History Button */}
            {selectedCustomerId && (
              <CustomerHistoryPopup 
                customerId={selectedCustomerId}
                customerName={enhancedCustomers.find(c => c.id === selectedCustomerId)?.name || ""}
              />
            )}
          </div>
        </div>
      )}

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="customerName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
            Tên khách hàng
          </Label>
          <Input 
            id="customerName" 
            type="text" 
            placeholder="Nhập tên khách hàng" 
            {...form.register("customerName")}
            disabled={customerType === "existing" && selectedCustomerId !== ""}
          />
          {form.formState.errors.customerName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.customerName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="customerPhone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
            Số điện thoại
          </Label>
          <Input 
            id="customerPhone" 
            type="tel" 
            placeholder="Nhập số điện thoại" 
            {...form.register("customerPhone")}
            disabled={customerType === "existing" && selectedCustomerId !== ""}
          />
          {form.formState.errors.customerPhone && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.customerPhone.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="customerEmail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
          Địa chỉ email (tùy chọn)
        </Label>
        <Input 
          id="customerEmail" 
          type="email" 
          placeholder="Nhập địa chỉ email" 
          {...form.register("customerEmail")}
          disabled={customerType === "existing" && selectedCustomerId !== ""}
        />
        {form.formState.errors.customerEmail && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.customerEmail.message}</p>
        )}
      </div>

      <div>
        <ServiceStaffSelector
          selectedItems={serviceStaffItems}
          onItemsChange={setServiceStaffItems}
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
          Ghi chú (tùy chọn)
        </Label>
        <Textarea id="notes" placeholder="Nhập ghi chú" {...form.register("notes")} />
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onClose}>
          Hủy bỏ
        </Button>
        <Button type="submit">
          Xác nhận
        </Button>
      </div>
    </form>
  );
}
