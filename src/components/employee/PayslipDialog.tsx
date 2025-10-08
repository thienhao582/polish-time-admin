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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col print:max-w-full print:max-h-full print:overflow-visible print:w-[80mm]">
        <div className="payslip-container">
          <DialogHeader className="flex-shrink-0 payslip-header">
            <DialogTitle className="text-center text-2xl font-bold print:text-[14px]">
              {employeeName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto print:overflow-visible space-y-4 print:space-y-0">
            <Table className="payslip-table">
              <TableHeader>
                <TableRow className="print:border-b print:border-black">
                  <TableHead className="w-8 print:w-6 print:text-[10px] print:p-[2px_4px]">#</TableHead>
                  <TableHead className="print:text-[10px] print:p-[2px_4px]">{text.date}</TableHead>
                  <TableHead className="print:text-[10px] print:p-[2px_4px]">{text.service}</TableHead>
                  <TableHead className="text-right print:text-[10px] print:p-[2px_4px]">{text.tip}</TableHead>
                  <TableHead className="text-right print:text-[10px] print:p-[2px_4px]">{text.supply}</TableHead>
                  <TableHead className="text-right print:text-[10px] print:p-[2px_4px]">{text.discount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt, index) => (
                  <TableRow key={apt.id} className="print:border-b print:border-dashed print:border-gray-300">
                    <TableCell className="print:text-[10px] print:p-[2px_4px]">{index + 1}</TableCell>
                    <TableCell className="text-sm print:text-[10px] print:p-[2px_4px]">
                      {format(new Date(apt.date), "MM/dd")}
                    </TableCell>
                    <TableCell className="text-sm print:text-[10px] print:p-[2px_4px]">{apt.service}</TableCell>
                    <TableCell className="text-right text-sm print:text-[10px] print:p-[2px_4px]">
                      {apt.tip > 0 ? formatCurrency(apt.tip) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm print:text-[10px] print:p-[2px_4px]">
                      {apt.supply > 0 ? formatCurrency(apt.supply) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm print:text-[10px] print:p-[2px_4px]">
                      {apt.discount > 0 ? formatCurrency(apt.discount) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex-shrink-0 space-y-4 print:space-y-0 payslip-summary">
            <Separator className="print:hidden" />

            <div className="space-y-2 text-sm print:space-y-0 print:text-[11px]">
              <div className="flex justify-between payslip-summary-row">
                <span>{workingDays} {text.workingDays}</span>
                <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
              </div>
              
              <div className="flex justify-between text-red-600 print:text-black payslip-summary-row">
                <span>{text.supply} Cost</span>
                <span>-{formatCurrency(totalSupply)}</span>
              </div>
              
              <div className="flex justify-between text-red-600 print:text-black payslip-summary-row">
                <span>{text.discountTotal}</span>
                <span>-{formatCurrency(totalDiscount)}</span>
              </div>
              
              <Separator className="print:border-t print:border-black print:my-1" />
              
              <div className="flex justify-between font-semibold payslip-summary-row">
                <span>{text.profit}</span>
                <span>{formatCurrency(profit)}</span>
              </div>
              
              <Separator className="print:border-t print:border-black print:my-1" />
              
              <div className="flex justify-between font-bold text-base print:text-[11px] payslip-summary-row">
                <span>{text.totalProfit}</span>
                <span>{formatCurrency(totalEarnings)}</span>
              </div>
              
              <Separator className="print:border-t print:border-black print:my-1" />
              
              <div className="flex justify-between font-bold text-base print:text-[11px] payslip-summary-row">
                <span>{text.other}</span>
                <span>{formatCurrency(totalTips)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg print:text-[12px] payslip-total payslip-summary-row">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
