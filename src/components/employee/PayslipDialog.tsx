import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currencyUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface AppointmentDetail {
  id: string;
  date: string;
  service: string;
  tip: number;
  supply: number;
  discount: number;
  price: number;
}

interface PayslipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  appointments: AppointmentDetail[];
  commissionRate: number;
  totalEarnings: number;
  workingDays: number;
}

export function PayslipDialog({
  open,
  onOpenChange,
  employeeName,
  appointments,
  commissionRate,
  totalEarnings,
  workingDays
}: PayslipDialogProps) {
  const { language } = useLanguage();

  const translations = {
    vi: {
      payslip: "Phiếu Lương",
      date: "Ngày",
      service: "Dịch Vụ",
      tip: "Tip",
      supply: "Sply",
      discount: "Discount",
      workingDays: "Ngày làm",
      miscDeduct: "Misc. Deduct",
      discountTotal: "Discount",
      profit: "Profit",
      totalProfit: "Total Profit",
      other: "Other:",
      check: "Check:",
      print: "In Phiếu Lương"
    },
    en: {
      payslip: "Payslip",
      date: "Date",
      service: "Service",
      tip: "Tip",
      supply: "Sply",
      discount: "Discount",
      workingDays: "Working Days",
      miscDeduct: "Misc. Deduct",
      discountTotal: "Discount",
      profit: "Profit",
      totalProfit: "Total Profit",
      other: "Other:",
      check: "Check:",
      print: "Print Payslip"
    }
  };

  const text = translations[language];

  const totalTips = appointments.reduce((sum, apt) => sum + apt.tip, 0);
  const totalSupply = appointments.reduce((sum, apt) => sum + apt.supply, 0);
  const totalDiscount = appointments.reduce((sum, apt) => sum + apt.discount, 0);
  const totalRevenue = appointments.reduce((sum, apt) => sum + apt.price, 0);
  const profit = totalRevenue - totalDiscount - totalSupply;
  const checkAmount = totalEarnings + totalTips;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-full">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 print:text-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{text.date}</TableHead>
                <TableHead>{text.service}</TableHead>
                <TableHead className="text-right">{text.tip}</TableHead>
                <TableHead className="text-right">{text.supply}</TableHead>
                <TableHead className="text-right">{text.discount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt, index) => (
                <TableRow key={apt.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(apt.date), "MM/dd")}
                  </TableCell>
                  <TableCell className="text-sm">{apt.service}</TableCell>
                  <TableCell className="text-right text-sm">
                    {apt.tip > 0 ? formatCurrency(apt.tip) : "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {apt.supply > 0 ? formatCurrency(apt.supply) : "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {apt.discount > 0 ? formatCurrency(apt.discount) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{workingDays} {text.workingDays}</span>
              <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
            </div>
            
            <div className="flex justify-between text-red-600">
              <span>{text.supply} Cost</span>
              <span>-{formatCurrency(totalSupply)}</span>
            </div>
            
            <div className="flex justify-between text-red-600">
              <span>{text.discountTotal}</span>
              <span>-{formatCurrency(totalDiscount)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-semibold">
              <span>{text.profit}</span>
              <span>{formatCurrency(profit)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-bold text-base">
              <span>{text.totalProfit}</span>
              <span>{formatCurrency(totalEarnings)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-bold text-base">
              <span>{text.other}</span>
              <span>{formatCurrency(totalTips)}</span>
            </div>
            
            <div className="flex justify-between font-bold text-lg">
              <span>{text.check}</span>
              <span>{formatCurrency(checkAmount)}</span>
            </div>
          </div>

          <div className="flex justify-center pt-4 print:hidden">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              {text.print}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
