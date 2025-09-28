import { X, ArrowLeft, ArrowRight, CreditCard, Banknote, Smartphone, Clock, Printer, CheckCircle, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [editableDiscount, setEditableDiscount] = useState(10); // percentage
  const [editableTip, setEditableTip] = useState(5); // percentage

  const currentTime = format(new Date(), "HH:mm");
  const currentDate = format(new Date(), "dd/MM/yyyy");
  
  // Calculate pricing
  const serviceTotal = checkInItem.services?.length ? checkInItem.services.length * 50000 : 0;
  const discount = Math.floor(serviceTotal * (editableDiscount / 100));
  const tip = Math.floor(serviceTotal * (editableTip / 100));
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
      setEditableDiscount(10);
      setEditableTip(5);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const handleStepClick = (step: CheckoutStep) => {
    // Allow navigation to any step except processing
    if (step !== 'processing') {
      setCurrentStep(step);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'overview': return true;
      case 'payment': return selectedPayment !== null;
      case 'processing': return false;
      case 'receipt': return false;
      default: return false;
    }
  };

  const canGoBack = () => {
    return currentStep === 'payment' || currentStep === 'receipt';
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'overview':
        setCurrentStep('payment');
        break;
      case 'payment':
        if (selectedPayment) {
          handlePaymentSelect(selectedPayment);
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'payment':
        setCurrentStep('overview');
        break;
      case 'receipt':
        setCurrentStep('payment');
        break;
    }
  };

  // Fixed left sidebar content - always visible
  const renderFixedInvoiceInfo = () => (
    <div className="bg-muted/30 h-full p-8 overflow-y-auto">
      <div className="space-y-8">
        {/* Customer Info */}
        <div className="text-center space-y-3">
          <h3 className="text-4xl font-bold text-primary">#{checkInItem.customerNumber}</h3>
          <p className="text-2xl font-medium">{checkInItem.customerName}</p>
          {checkInItem.phone && <p className="text-lg text-muted-foreground">{checkInItem.phone}</p>}
          <p className="text-base text-muted-foreground">{currentDate} {currentTime}</p>
        </div>

        <Separator />

        {/* Services */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Dịch vụ đã sử dụng</h4>
          <div className="space-y-3">
            {checkInItem.services && checkInItem.services.length > 0 ? (
              checkInItem.services.map((service, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-background rounded-lg">
                  <span className="text-lg font-medium">{service}</span>
                  <span className="text-lg font-semibold">50,000₫</span>
                </div>
              ))
            ) : (
              <p className="text-lg text-muted-foreground">Không có dịch vụ</p>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        {serviceTotal > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-semibold">Tổng kết thanh toán</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                
                {/* Editable Discount */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Discount:</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editableDiscount}
                        onChange={(e) => setEditableDiscount(Number(e.target.value) || 0)}
                        className="w-12 h-6 text-xs text-center"
                        min="0"
                        max="100"
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
                  <span className="text-green-600">-{discount.toLocaleString('vi-VN')}₫</span>
                </div>
                
                <div className="flex justify-between">
                  <span>VAT (8%):</span>
                  <span>{tax.toLocaleString('vi-VN')}₫</span>
                </div>
                
                {/* Editable Tip */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Tip:</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editableTip}
                        onChange={(e) => setEditableTip(Number(e.target.value) || 0)}
                        className="w-12 h-6 text-xs text-center"
                        min="0"
                        max="100"
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
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
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Xác nhận thông tin hóa đơn</h3>
              <p className="text-muted-foreground">
                Vui lòng kiểm tra lại thông tin trước khi tiến hành thanh toán
              </p>
            </div>
            
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Thông tin khách hàng</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Tên khách hàng</Label>
                  <p className="font-medium">{checkInItem.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số thứ tự</Label>
                  <p className="font-medium">#{checkInItem.customerNumber}</p>
                </div>
                {checkInItem.phone && (
                  <div>
                    <Label className="text-muted-foreground">Số điện thoại</Label>
                    <p className="font-medium">{checkInItem.phone}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Thời gian check-in</Label>
                  <p className="font-medium">{checkInItem.checkInTime}</p>
                </div>
              </div>
            </Card>

            {checkInItem.notes && (
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Ghi chú</h4>
                <p className="text-sm text-muted-foreground">{checkInItem.notes}</p>
              </Card>
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
                onClick={() => setSelectedPayment('card')}
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
                onClick={() => setSelectedPayment('cash')}
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
                onClick={() => setSelectedPayment('apple-pay')}
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

            <Card className="p-6">
              <div className="text-center font-semibold mb-4">HÓA ĐƠN THANH TOÁN</div>
              <div className="space-y-3 text-sm">
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
            </Card>

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

  const steps: { key: CheckoutStep; label: string; number: number }[] = [
    { key: 'overview', label: 'Xem trước', number: 1 },
    { key: 'payment', label: 'Thanh toán', number: 2 },
    { key: 'processing', label: 'Xử lý', number: 3 },
    { key: 'receipt', label: 'Hoàn tất', number: 4 },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Popup - 90% dynamic viewport width and height */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-xl flex flex-col overflow-hidden max-w-none max-h-none" style={{ width: '90dvw', height: '90dvh' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b">
            <div className="flex items-center gap-4">
              {canGoBack() && (
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h2 className="text-3xl font-semibold">
                  {steps.find(s => s.key === currentStep)?.label || 'Checkout'}
                </h2>
                <p className="text-lg text-muted-foreground">
                  Checkout cho {checkInItem.customerName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Clickable Step indicators */}
              <div className="flex items-center gap-3">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer transition-colors ${
                        currentStep === step.key ? 'bg-primary text-primary-foreground' : 
                        currentStepIndex > index ? 'bg-primary/50 text-primary-foreground' : 
                        'bg-muted text-muted-foreground hover:bg-muted/80'
                      } ${step.key === 'processing' ? 'cursor-not-allowed' : ''}`}
                      onClick={() => handleStepClick(step.key)}
                      title={step.label}
                    >
                      {step.number}
                    </div>
                    {index < steps.length - 1 && <div className="w-8 h-px bg-muted mx-3" />}
                  </div>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content - 2 columns */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left sidebar - Fixed invoice info (40%) */}
            <div className="w-2/5 border-r">
              {renderFixedInvoiceInfo()}
            </div>

            {/* Right content area (60%) */}
            <div className="flex-1 flex flex-col">
              {/* Step content */}
              <div className="flex-1 overflow-y-auto p-8">
                {getStepContent()}
              </div>

              {/* Footer with navigation */}
              <div className="border-t p-8">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    {canGoBack() && (
                      <Button variant="outline" size="lg" onClick={handleBack}>
                        <ArrowLeft className="h-5 w-5 mr-3" />
                        Quay lại
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    {currentStep !== 'receipt' && currentStep !== 'processing' && (
                      <Button variant="outline" size="lg" onClick={onClose}>
                        Hủy
                      </Button>
                    )}
                    
                    {canGoNext() && (
                      <Button 
                        onClick={handleNext}
                        disabled={currentStep === 'payment' && !selectedPayment}
                        size="lg"
                      >
                        <ArrowRight className="h-5 w-5 mr-3" />
                        {currentStep === 'overview' ? 'Tiếp tục' : 'Thanh toán'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}