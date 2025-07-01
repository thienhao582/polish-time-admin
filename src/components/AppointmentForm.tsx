import { useState } from "react";
import { CalendarIcon, ClockIcon, UserRound } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useSalonStore } from "@/stores/useSalonStore";

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
  const { addAppointment } = useSalonStore();
  const [serviceStaffItems, setServiceStaffItems] = useState<any[]>([]);

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

  const handleSubmit = (data: any) => {
    console.log("Form data submitted:", data);
    console.log("Service staff items:", serviceStaffItems);
    
    if (serviceStaffItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    const appointmentData = {
      ...data,
      serviceStaffItems, // Send the complete service-staff items array
      date: data.date,
      time: data.time,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      notes: data.notes
    };

    try {
      const result = addAppointment(appointmentData);
      console.log("Appointment created:", result);
      toast.success("Tạo lịch hẹn thành công!");
      onSubmit(appointmentData);
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
                      date > new Date()
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
                  {Array.from({ length: 15 }, (_, i) => i + 8).map((hour) => (
                    <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>
                  ))}
                  {Array.from({ length: 15 }, (_, i) => i + 8).map((hour) => (
                    <SelectItem key={`${hour}:30`} value={`${hour}:30`}>{`${hour}:30`}</SelectItem>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="customerName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
            Tên khách hàng
          </Label>
          <Input id="customerName" type="text" placeholder="Nhập tên khách hàng" {...form.register("customerName")} />
          {form.formState.errors.customerName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.customerName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="customerPhone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
            Số điện thoại
          </Label>
          <Input id="customerPhone" type="tel" placeholder="Nhập số điện thoại" {...form.register("customerPhone")} />
          {form.formState.errors.customerPhone && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.customerPhone.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="customerEmail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
          Địa chỉ email (tùy chọn)
        </Label>
        <Input id="customerEmail" type="email" placeholder="Nhập địa chỉ email" {...form.register("customerEmail")} />
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
