import { X, ArrowLeft, ArrowRight, CreditCard, Banknote, Smartphone, Clock, Printer, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface CheckoutPopupProps {
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

type CheckoutStep = 'overview' | 'payment' | 'processing' | 'receipt';
type PaymentMethod = 'card' | 'cash' | 'apple-pay' | null;

export function CheckoutPopup({ isOpen, onClose, checkInItem, onConfirmCheckOut }: CheckoutPopupProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('overview');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  if (!isOpen) return null;

  const currentTime = format(new Date(), "HH:mm");
  const currentDate = format(new Date(), "dd/MM/yyyy");
  
  // Calculate pricing
  const serviceTotal = checkInItem.services?.length ? checkInItem.services.length * 50000 : 0;
  const discount = Math.floor(serviceTotal * 0.1); // 10% discount
  const tip = Math.floor(serviceTotal * 0.05); // 5% tip
  const tax = Math.floor(serviceTotal * 0.08); // 8% VAT
  const subtotal = serviceTotal;
  const totalDue = subtotal - discount + tip + tax;

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('overview');
      setSelectedPayment(null);
      setIsProcessing(false);
      setPaymentCompleted(false);
    }
  }, [isOpen]);

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
    if (method === 'card') {
      setCurrentStep('processing');
      setIsProcessing(true);
      // Simulate POS connection and processing
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentCompleted(true);
        setCurrentStep('receipt');
      }, 3000);
    } else if (method === 'cash' || method === 'apple-pay') {
      setCurrentStep('receipt');
      setPaymentCompleted(true);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn - ${checkInItem.customerName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 10px; }
              .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
              .total-due { font-weight: bold; border-top: 1px solid #333; padding-top: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>SALON RECEIPT</h2>
              <p>${currentDate} ${currentTime}</p>
            </div>
            <p><strong>${checkInItem.customerName}</strong> (#${checkInItem.customerNumber})</p>
            <p>Payment: ${selectedPayment === 'card' ? 'Credit/Debit Card' : selectedPayment === 'cash' ? 'Cash' : 'Apple Pay'}</p>
            <div class="total-line total-due">
              <span>Total:</span>
              <span>${totalDue.toLocaleString('vi-VN')}₫</span>
            </div>
            <p style="text-align: center; margin-top: 20px;">Thank you!</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-primary">#{checkInItem.customerNumber}</h3>
              <p className="text-xl font-medium">{checkInItem.customerName}</p>
              {checkInItem.phone && <p className="text-muted-foreground">{checkInItem.phone}</p>}
            </div>

            <Separator />

            {/* Services Summary */}
            <div>
              <h4 className="font-semibold mb-3">Dịch vụ đã sử dụng</h4>
              <div className="space-y-2">
                {checkInItem.services && checkInItem.services.length > 0 ? (
                  checkInItem.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">{service}</span>
                      <span className="font-semibold">50,000₫</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Không có dịch vụ</p>
                )}
              </div>
            </div>

            {/* Pricing Summary */}
            {serviceTotal > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold">Tổng kết thanh toán</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount (10%):</span>
                      <span>-{discount.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (8%):</span>
                      <span>{tax.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip (5%):</span>
                      <span>{tip.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">{totalDue.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Chọn phương thức thanh toán</h3>
              <p className="text-2xl font-bold text-primary">{totalDue.toLocaleString('vi-VN')}₫</p>
            </div>

            <div className="grid gap-4">
              {/* Card Payment */}
              <Card 
                className={`p-6 cursor-pointer border-2 transition-all hover:shadow-md ${
                  selectedPayment === 'card' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handlePaymentSelect('card')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Credit/Debit Card</h4>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Credit/Debit</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Charge {totalDue.toLocaleString('vi-VN')}₫
                  </Button>
                </div>
              </Card>

              {/* Cash Payment */}
              <Card 
                className={`p-6 cursor-pointer border-2 transition-all hover:shadow-md ${
                  selectedPayment === 'cash' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handlePaymentSelect('cash')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Cash</h4>
                    <p className="text-sm text-muted-foreground">Tiền mặt</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      {totalDue.toLocaleString('vi-VN')}₫
                    </Button>
                    <Button variant="outline" size="sm">
                      Custom
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Apple Pay */}
              <Card 
                className={`p-6 cursor-pointer border-2 transition-all hover:shadow-md ${
                  selectedPayment === 'apple-pay' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handlePaymentSelect('apple-pay')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Smartphone className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Apple Pay</h4>
                    <p className="text-sm text-muted-foreground">Touch ID or Face ID</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Pay {totalDue.toLocaleString('vi-VN')}₫
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="p-6 bg-blue-100 rounded-full">
              <Clock className="h-12 w-12 text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Đang kết nối máy POS</h3>
              <p className="text-muted-foreground">Vui lòng chờ khách hàng quẹt thẻ...</p>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Đang xử lý thanh toán...</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalDue.toLocaleString('vi-VN')}₫</p>
              <p className="text-sm text-muted-foreground">Số tiền cần thanh toán</p>
            </div>
          </div>
        );

      case 'receipt':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-100 rounded-full mx-auto w-fit">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-600">Thanh toán thành công!</h3>
                <p className="text-muted-foreground">
                  Phương thức: {selectedPayment === 'card' ? 'Thẻ tín dụng/ghi nợ' : selectedPayment === 'cash' ? 'Tiền mặt' : 'Apple Pay'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Receipt Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="text-center font-semibold">HÓA ĐƠN THANH TOÁN</div>
              <div className="text-center text-sm text-muted-foreground">
                {currentDate} {currentTime}
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Khách hàng:</span>
                  <span>{checkInItem.customerName} (#{checkInItem.customerNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span>Dịch vụ:</span>
                  <span>{checkInItem.services?.join(', ') || 'Không có'}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Tổng tiền:</span>
                  <span>{totalDue.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Thanh toán:</span>
                  <span>{selectedPayment === 'card' ? 'Thẻ' : selectedPayment === 'cash' ? 'Tiền mặt' : 'Apple Pay'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handlePrint}
                className="flex-1"
                variant="outline"
              >
                <Printer className="h-4 w-4 mr-2" />
                In hóa đơn
              </Button>
              <Button 
                onClick={() => {
                  onConfirmCheckOut();
                  onClose();
                }}
                className="flex-1"
              >
                Hoàn thành
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canGoBack = currentStep === 'payment';
  const canGoNext = currentStep === 'overview';

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              {canGoBack && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentStep('overview')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {currentStep === 'overview' && 'Chi tiết hóa đơn'}
                  {currentStep === 'payment' && 'Thanh toán'}
                  {currentStep === 'processing' && 'Đang xử lý'}
                  {currentStep === 'receipt' && 'Hoàn tất'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Checkout cho {checkInItem.customerName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Step indicators */}
              <div className="hidden sm:flex items-center gap-2 mr-4">
                {['overview', 'payment', 'processing', 'receipt'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      currentStep === step ? 'bg-primary' : 
                      ['overview', 'payment', 'processing', 'receipt'].indexOf(currentStep) > index ? 'bg-primary/50' : 'bg-muted'
                    }`} />
                    {index < 3 && <div className="w-4 h-px bg-muted mx-1" />}
                  </div>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {getStepContent()}
          </div>

          {/* Footer */}
          {currentStep === 'overview' && (
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button onClick={() => setCurrentStep('payment')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Tiếp tục thanh toán
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}