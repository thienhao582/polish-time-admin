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
    // Always use English labels for printing
    const printLabels = {
      date: "Date",
      service: "Service",
      tip: "Tip",
      supply: "Sply",
      discount: "Discount",
      workingDays: "Wks Days",
      profit: "Profit",
      totalProfit: "Total Profit",
      other: "Other:",
      check: "Check:"
    };
    
    // Create HTML content for thermal printer (80mm)
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payslip - ${employeeName}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              width: 80mm;
              font-family: Arial, sans-serif;
              font-size: 10px;
              line-height: 1.3;
              padding: 4mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            h2 {
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
              margin-bottom: 4px;
            }
            
            th, td {
              padding: 2px 1px;
              text-align: left;
            }
            
            th {
              font-weight: bold;
              border-bottom: 1px solid #000;
            }
            
            td.text-right, th.text-right {
              text-align: right;
            }
            
            .separator {
              border-top: 1px dashed #000;
              margin: 3px 0;
            }
            
            .summary {
              font-size: 10px;
              margin-top: 4px;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            
            .text-red {
              color: #dc2626;
            }
            
            .font-semibold {
              font-weight: 600;
            }
            
            .font-bold {
              font-weight: 700;
            }
            
            .text-base {
              font-size: 11px;
            }
            
            .text-lg {
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h2>${employeeName}</h2>
          
          <table>
            <thead>
              <tr>
                <th style="width: 8%">#</th>
                <th style="width: 15%">${printLabels.date}</th>
                <th style="width: 35%">${printLabels.service}</th>
                <th class="text-right" style="width: 14%">${printLabels.tip}</th>
                <th class="text-right" style="width: 14%">${printLabels.supply}</th>
                <th class="text-right" style="width: 14%">${printLabels.discount}</th>
              </tr>
            </thead>
            <tbody>
              ${appointments.map((apt, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${format(new Date(apt.date), "MM/dd")}</td>
                  <td>${apt.service}</td>
                  <td class="text-right">${apt.tip > 0 ? formatCurrency(apt.tip) : "-"}</td>
                  <td class="text-right">${apt.supply > 0 ? formatCurrency(apt.supply) : "-"}</td>
                  <td class="text-right">${apt.discount > 0 ? formatCurrency(apt.discount) : "-"}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="separator"></div>
          
          <div class="summary">
            <div class="summary-row">
              <span>${workingDays} ${printLabels.workingDays}</span>
              <span class="font-semibold">${formatCurrency(totalRevenue)}</span>
            </div>
            
            <div class="summary-row text-red">
              <span>${printLabels.supply} Cost</span>
              <span>-${formatCurrency(totalSupply)}</span>
            </div>
            
            <div class="summary-row text-red">
              <span>${printLabels.discount}</span>
              <span>-${formatCurrency(totalDiscount)}</span>
            </div>
            
            <div class="separator"></div>
            
            <div class="summary-row font-semibold">
              <span>${printLabels.profit}</span>
              <span>${formatCurrency(profit)}</span>
            </div>
            
            <div class="separator"></div>
            
            <div class="summary-row font-bold text-base">
              <span>${printLabels.totalProfit}</span>
              <span>${formatCurrency(totalEarnings)}</span>
            </div>
            
            <div class="separator"></div>
            
            <div class="summary-row font-bold text-base">
              <span>${printLabels.other}</span>
              <span>${formatCurrency(totalTips)}</span>
            </div>
            
            <div class="summary-row font-bold text-lg">
              <span>${printLabels.check}</span>
              <span>${formatCurrency(checkAmount)}</span>
            </div>
          </div>
        </body>
      </html>
    `;

    // Open new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Close window after printing (optional - user can close manually if needed)
        setTimeout(() => {
          printWindow.close();
        }, 100);
      };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-center text-2xl font-bold">
            {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto print:overflow-visible space-y-4">
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
        </div>

        <div className="flex-shrink-0 space-y-4 print:space-y-2">
          <Separator />

          <div className="space-y-2 text-sm print:space-y-1">
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
