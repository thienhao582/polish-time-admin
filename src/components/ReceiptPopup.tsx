import { X, FileText, Printer, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { format } from "date-fns";

interface ReceiptPopupProps {
  isOpen: boolean;
  onClose: () => void;
  checkInItem: {
    id: string;
    customerNumber: string;
    customerName: string;
    checkInTime: string;
    services?: string[];
    tags: string[];
    waitTime?: number;
    phone?: string;
    notes?: string;
  };
  onConfirmCheckOut: () => void;
}

export function ReceiptPopup({ isOpen, onClose, checkInItem, onConfirmCheckOut }: ReceiptPopupProps) {
  if (!isOpen) return null;

  const currentTime = format(new Date(), "HH:mm");
  const currentDate = format(new Date(), "dd/MM/yyyy");
  
  // State for editable discount
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState(10); // Default 10%
  
  // Calculate pricing details for popup display
  const serviceTotal = checkInItem.services?.length ? checkInItem.services.length * 2.08 : 0; // 50000 VND = 2.08 USD
  const discount = discountType === 'percentage' 
    ? Math.floor(serviceTotal * (discountValue / 100))
    : discountValue;
  const tip = Math.floor(serviceTotal * 0.05); // 5% tip
  const tax = Math.floor(serviceTotal * 0.08); // 8% VAT
  const subtotal = serviceTotal;
  const totalDue = subtotal - discount + tip + tax;
  
  // Additional details
  const receiptNumber = `RC${Date.now().toString().slice(-6)}`;
  const employeeName = "Nhân viên phục vụ";
  const totalServiceTime = checkInItem.services?.length ? checkInItem.services.length * 30 : 0;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
      if (printWindow) {
          // Calculate pricing (enhanced with more details)
          const serviceTotal = checkInItem.services?.length ? checkInItem.services.length * 2.08 : 0; // 50000 VND = 2.08 USD
          const discountAmount = discountType === 'percentage' 
            ? Math.floor(serviceTotal * (discountValue / 100))
            : discountValue;
          const tip = Math.floor(serviceTotal * 0.05); // 5% tip
          const tax = Math.floor(serviceTotal * 0.08); // 8% VAT
          const subtotal = serviceTotal;
          const totalDue = subtotal - discountAmount + tip + tax;
          
          // Additional receipt details
          const receiptNumber = `RC${Date.now().toString().slice(-6)}`;
          const employeeName = "Nhân viên phục vụ";
          const totalServiceTime = checkInItem.services?.length ? checkInItem.services.length * 30 : 0;

      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn - ${checkInItem.customerName}</title>
            <style>
              @page {
                margin: 5mm;
                size: A7;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                }
              }
              body {
                font-family: Arial, sans-serif; 
                padding: 10px; 
                max-width: 250px;
                margin: 0 auto;
                line-height: 1.3;
                font-size: 12px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 10px;
                border-bottom: 1px dashed #333;
                padding-bottom: 8px;
              }
              .customer-info { 
                margin-bottom: 8px; 
                text-align: center;
              }
              .service-line {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
                padding: 1px 0;
              }
              .service-name {
                flex: 1;
                text-align: left;
              }
              .service-price {
                text-align: right;
                font-weight: bold;
              }
              .totals {
                border-top: 1px dashed #333;
                margin-top: 8px;
                padding-top: 5px;
              }
              .total-line {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
              }
              .total-due {
                font-weight: bold;
                font-size: 1.1em;
                border-top: 1px solid #333;
                padding-top: 3px;
                margin-top: 5px;
              }
              .footer {
                text-align: center;
                margin-top: 10px;
                border-top: 1px dashed #333;
                padding-top: 8px;
                font-size: 11px;
              }
              h2 {
                font-size: 16px;
                margin: 0;
              }
              h3 {
                font-size: 13px;
                margin: 8px 0 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>SALON RECEIPT</h2>
              <p style="margin: 3px 0;">Receipt #: ${receiptNumber}</p>
              <p style="margin: 3px 0;">${currentDate} ${currentTime}</p>
            </div>
            
            <div class="customer-info">
              <p style="margin: 3px 0;"><strong>#${checkInItem.customerNumber}</strong></p>
              <p style="margin: 3px 0;">${checkInItem.customerName}</p>
              ${checkInItem.phone ? `<p style="margin: 3px 0;">${checkInItem.phone}</p>` : ''}
            </div>

            <div style="margin: 8px 0;">
              <p style="margin: 3px 0;"><strong>Nhân viên:</strong> ${employeeName}</p>
              <p style="margin: 3px 0;"><strong>Check-in:</strong> ${checkInItem.checkInTime}</p>
              <p style="margin: 3px 0;"><strong>Check-out:</strong> ${currentTime}</p>
              ${checkInItem.waitTime ? `<p style="margin: 3px 0;"><strong>Thời gian chờ:</strong> ${checkInItem.waitTime} phút</p>` : ''}
              ${totalServiceTime > 0 ? `<p style="margin: 3px 0;"><strong>Thời gian phục vụ:</strong> ${totalServiceTime} phút</p>` : ''}
            </div>

            <div>
              <h3>Dịch vụ đã sử dụng:</h3>
              ${checkInItem.services && checkInItem.services.length > 0 ? 
                checkInItem.services.map(service => `
                  <div class="service-line">
                    <span class="service-name">${service}</span>
                    <span class="service-price">50,000₫</span>
                  </div>
                `).join('') : 
                '<p style="margin: 5px 0;">Không có dịch vụ</p>'
              }
            </div>

              ${checkInItem.services && checkInItem.services.length > 0 ? `
              <div class="totals">
                <div class="total-line">
                  <span>Subtotal:</span>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-line">
                  <span>Discount${discountType === 'percentage' ? ` (${discountValue}%)` : ''}:</span>
                  <span>-$${discountAmount.toFixed(2)}</span>
                </div>
                <div class="total-line">
                  <span>VAT (8%):</span>
                  <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="total-line">
                  <span>Tip (5%):</span>
                  <span>$${tip.toFixed(2)}</span>
                </div>
                <div class="total-line total-due">
                  <span>Total Due:</span>
                  <span>$${totalDue.toFixed(2)}</span>
                </div>
              </div>
            ` : ''}

            ${checkInItem.notes ? `
              <div style="margin: 8px 0;">
                <p style="margin: 3px 0;"><strong>Ghi chú:</strong></p>
                <p style="margin: 3px 0;">${checkInItem.notes}</p>
              </div>
            ` : ''}

            <div class="footer">
              <p style="margin: 3px 0;"><strong>Phương thức thanh toán:</strong> Tiền mặt</p>
              <p style="margin: 3px 0;">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
              <p style="margin: 3px 0;">Hẹn gặp lại!</p>
              <p style="margin: 2px 0; font-size: 10px;">Hotline: 0123.456.789</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleConfirm = () => {
    onConfirmCheckOut();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Hóa đơn Check Out</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Receipt Content */}
          <div className="p-6 space-y-4">
            {/* Receipt Header */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">Hóa đơn #{receiptNumber}</p>
              <p className="text-xs text-gray-500">{currentDate} {currentTime}</p>
            </div>

            {/* Customer Info */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-primary">
                #{checkInItem.customerNumber}
              </h3>
              <p className="text-lg font-medium">{checkInItem.customerName}</p>
              {checkInItem.phone && (
                <p className="text-sm text-gray-600">{checkInItem.phone}</p>
              )}
            </div>

            <Separator />

            {/* Staff and Service Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nhân viên:</span>
                <span className="font-medium">{employeeName}</span>
              </div>
              {totalServiceTime > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Thời gian phục vụ:</span>
                  <span className="font-medium">{totalServiceTime} phút</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {checkInItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {checkInItem.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Time Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Check-in</p>
                <p className="font-medium">{checkInItem.checkInTime}</p>
              </div>
              <div>
                <p className="text-gray-500">Check-out</p>
                <p className="font-medium">{currentTime}</p>
              </div>
            </div>

            {checkInItem.waitTime && (
              <div className="text-center">
                <p className="text-gray-500 text-sm">Thời gian chờ</p>
                <p className="text-lg font-medium text-primary">{checkInItem.waitTime} phút</p>
              </div>
            )}

            <Separator />

            {/* Services */}
            <div>
              <p className="text-gray-500 text-sm mb-2">Dịch vụ đã sử dụng:</p>
              <div className="space-y-2">
                {checkInItem.services && checkInItem.services.length > 0 ? (
                  checkInItem.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{service}</span>
                      <span className="text-sm font-semibold">50,000₫</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Không có dịch vụ</p>
                )}
              </div>
            </div>

            {/* Pricing Summary */}
            {checkInItem.services && checkInItem.services.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Tổng kết thanh toán:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {isEditingDiscount ? (
                      <div className="space-y-2 p-3 bg-blue-50 rounded border">
                        <div className="flex gap-2">
                          <Button
                            variant={discountType === 'percentage' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDiscountType('percentage')}
                          >
                            %
                          </Button>
                          <Button
                            variant={discountType === 'amount' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDiscountType('amount')}
                          >
                            $
                          </Button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Label className="text-xs">
                            {discountType === 'percentage' ? 'Giảm %:' : 'Giảm tiền:'}
                          </Label>
                          <Input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                            className="h-8 w-20 text-xs"
                            min="0"
                            max={discountType === 'percentage' ? 100 : serviceTotal}
                          />
                          <Button
                            size="sm"
                            onClick={() => setIsEditingDiscount(false)}
                          >
                            OK
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between text-green-600 group">
                        <span className="flex items-center gap-2">
                          Discount{discountType === 'percentage' ? ` (${discountValue}%)` : ''}:
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingDiscount(true)}
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>VAT (8%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip (5%):</span>
                      <span>${tip.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">${totalDue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {checkInItem.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-gray-500 text-sm mb-1">Ghi chú:</p>
                  <p className="text-sm bg-gray-50 p-2 rounded">{checkInItem.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Payment & Footer Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phương thức thanh toán:</span>
                <span className="font-medium">Tiền mặt</span>
              </div>
              <div className="text-center text-xs text-gray-500">
                <p className="mt-2">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                <p>Hẹn gặp lại!</p>
                <p className="mt-1">Hotline: 0123.456.789</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 p-4 border-t bg-gray-50">
            <Button 
              variant="outline"
              onClick={handlePrint}
              className="flex-1 gap-2"
            >
              <Printer className="h-4 w-4" />
              In hóa đơn
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1"
            >
              Xác nhận Check Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}