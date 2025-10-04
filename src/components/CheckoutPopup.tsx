import { X, ArrowLeft, ArrowRight, CreditCard, Banknote, Gift, ArrowRightLeft, Clock, Printer, CheckCircle, Loader2, Edit3, ChevronRight, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { ServiceStaffSelector } from "@/components/appointments/ServiceStaffSelector";

interface ServiceStaffItem {
  id: string;
  serviceId: string;
  serviceName: string;
  staffIds: string[];
  staffNames: string[];
  price: number;
  duration: number;
  staffSalaryInfo?: Array<{
    staffId: string;
    staffName: string;
    commissionRate?: number;
    fixedAmount?: number;
  }>;
}

interface CheckoutPopupProps {
  isOpen: boolean;
  onClose: () => void;
  checkInItem: {
    id: string;
    customerNumber: string;
    customerName: string;
    checkInTime: string;
    services?: string[];
    staffAssignments?: Array<{
      serviceName: string;
      staffId: string;
      staffName: string;
    }>;
    tags: string[];
    waitTime?: number;
    phone?: string;
    notes?: string;
  };
  onConfirmCheckOut: () => void;
}

type CheckoutStep = 'overview' | 'payment' | 'processing' | 'receipt';
type PaymentMethod = 'card' | 'cash' | 'gift-card' | 'other' | null;

interface PaymentRecord {
  method: PaymentMethod;
  amount: number;
}

export function CheckoutPopup({ isOpen, onClose, checkInItem, onConfirmCheckOut }: CheckoutPopupProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('overview');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [editableDiscount, setEditableDiscount] = useState(0); // percentage - default 0%
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountAmount, setDiscountAmount] = useState(0); // specific amount in VND
  const [editableTip, setEditableTip] = useState(0); // default 0
  const [tipType, setTipType] = useState<'percentage' | 'amount'>('amount');
  const [tipAmount, setTipAmount] = useState(0); // specific amount in VND
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [disabledMethods, setDisabledMethods] = useState<Set<PaymentMethod>>(new Set());
  const [customAmountInput, setCustomAmountInput] = useState<number | ''>('');
  const [showCustomInput, setShowCustomInput] = useState<PaymentMethod | null>(null);
  const [selectedServiceItems, setSelectedServiceItems] = useState<ServiceStaffItem[]>([]);
  const [customStaffTips, setCustomStaffTips] = useState<Map<string, number>>(new Map());
  const [showCardHistory, setShowCardHistory] = useState(true);
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [cashPaymentAmount, setCashPaymentAmount] = useState(0);
  const [cashReceived, setCashReceived] = useState<number | ''>('');

  const currentTime = format(new Date(), "HH:mm");
  const currentDate = format(new Date(), "dd/MM/yyyy");
  
  // Calculate pricing - use selectedServiceItems if available, otherwise fall back to checkInItem
  const serviceTotal = selectedServiceItems.length > 0
    ? selectedServiceItems.reduce((sum, item) => sum + item.price, 0)
    : (checkInItem.services?.length ? checkInItem.services.length * 50000 : 0);
  
  const discount = discountType === 'percentage' 
    ? Math.floor(serviceTotal * (editableDiscount / 100))
    : discountAmount;
  const tip = tipType === 'percentage'
    ? Math.floor(serviceTotal * (editableTip / 100))
    : tipAmount;
  const tax = Math.floor(serviceTotal * 0.08); // 8% VAT
  const subtotal = serviceTotal;
  const totalDue = subtotal - discount + tip + tax;
  const totalPaid = paymentRecords.reduce((sum, record) => sum + record.amount, 0);
  const remainingDue = Math.max(0, totalDue - totalPaid);

  // Calculate tip distribution for each staff member
  const calculateTipDistribution = () => {
    if (tip <= 0 || selectedServiceItems.length === 0) return [];

    // Create a map of staff revenue
    const staffRevenue = new Map<string, { name: string; revenue: number }>();
    
    selectedServiceItems.forEach(item => {
      item.staffIds.forEach((staffId, index) => {
        const staffName = item.staffNames[index];
        const currentRevenue = staffRevenue.get(staffId) || { name: staffName, revenue: 0 };
        // Divide service price equally among staff working on it
        const revenueShare = item.price / item.staffIds.length;
        staffRevenue.set(staffId, {
          name: staffName,
          revenue: currentRevenue.revenue + revenueShare
        });
      });
    });

    // Calculate tip distribution based on revenue percentage or custom values
    const tipDistribution: Array<{ staffId: string; staffName: string; revenue: number; tipAmount: number; percentage: number }> = [];
    
    staffRevenue.forEach((data, staffId) => {
      const percentage = (data.revenue / serviceTotal) * 100;
      // Use custom tip if set, otherwise use calculated tip
      const staffTip = customStaffTips.has(staffId) 
        ? customStaffTips.get(staffId)! 
        : Math.floor((data.revenue / serviceTotal) * tip);
      tipDistribution.push({
        staffId,
        staffName: data.name,
        revenue: data.revenue,
        tipAmount: staffTip,
        percentage
      });
    });

    return tipDistribution;
  };

  const tipDistribution = calculateTipDistribution();
  
  // Calculate total custom tips
  const totalCustomTips = tipDistribution.reduce((sum, dist) => sum + dist.tipAmount, 0);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('overview');
      setSelectedPayment(null);
      setIsProcessing(false);
      setPaymentCompleted(false);
      setEditableDiscount(0);
      setDiscountType('percentage');
      setDiscountAmount(0);
      setEditableTip(0);
      setTipType('amount');
      setTipAmount(0);
      setPaymentRecords([]);
      setDisabledMethods(new Set());
      setCustomAmountInput('');
      setShowCustomInput(null);
      setCustomStaffTips(new Map());
      setShowCardHistory(true);
      setShowCashDialog(false);
      setCashPaymentAmount(0);
      setCashReceived('');
      
      // Initialize selected services from checkInItem with staff information
      if (checkInItem.services && checkInItem.services.length > 0) {
        const initialServices: ServiceStaffItem[] = checkInItem.services.map((serviceName, index) => {
          // Find staff assignments for this service
          const staffForService = checkInItem.staffAssignments?.filter(
            assignment => assignment.serviceName === serviceName
          ) || [];
          
          return {
            id: `initial-${index}`,
            serviceId: `service-${index}`,
            serviceName: serviceName,
            staffIds: staffForService.map(s => s.staffId),
            staffNames: staffForService.map(s => s.staffName),
            price: 50000, // Default price
            duration: 60, // Default duration
          };
        });
        setSelectedServiceItems(initialServices);
      } else {
        setSelectedServiceItems([]);
      }
      
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when popup is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, checkInItem.services, checkInItem.staffAssignments]);

  if (!isOpen) return null;

  const handlePaymentSelect = (method: PaymentMethod, amount: number) => {
    const newPaymentRecord: PaymentRecord = { method, amount };
    const newPaymentRecords = [...paymentRecords, newPaymentRecord];
    setPaymentRecords(newPaymentRecords);
    
    const newTotalPaid = newPaymentRecords.reduce((sum, record) => sum + record.amount, 0);
    const newRemaining = totalDue - newTotalPaid;
    
    if (method === 'card') {
      setCurrentStep('processing');
      setIsProcessing(true);
      setSelectedPayment('card');
      // Simulate POS connection and processing with the actual amount
      setTimeout(() => {
        setIsProcessing(false);
        if (newRemaining <= 0) {
          setPaymentCompleted(true);
          setCurrentStep('receipt');
        } else {
          setCurrentStep('payment');
          setSelectedPayment(null);
          setShowCustomInput(null);
          setCustomAmountInput('');
          setShowCardHistory(true);
        }
      }, 3000);
    } else {
      if (newRemaining <= 0) {
        setPaymentCompleted(true);
        setCurrentStep('receipt');
      } else {
        setSelectedPayment(null);
        setShowCustomInput(null);
        setCustomAmountInput('');
      }
    }
  };

  const handlePayFullClick = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setShowCustomInput(null);
    handlePaymentSelect(method, remainingDue);
  };

  const handleCustomClick = (method: PaymentMethod) => {
    setShowCustomInput(method);
    setCustomAmountInput(remainingDue);
  };

  const handleCustomPayment = (method: PaymentMethod) => {
    const amount = typeof customAmountInput === 'number' ? customAmountInput : 0;
    if (amount > 0 && amount <= remainingDue) {
      // Only disable non-card methods after custom payment
      if (method !== 'card') {
        setDisabledMethods(new Set([...disabledMethods, method]));
      }
      handlePaymentSelect(method, amount);
    }
  };

  // Get card payment history
  const cardPayments = paymentRecords.filter(record => record.method === 'card');

  const handlePrint = () => {
    // Create a hidden iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-10000px';
    printFrame.style.left = '-10000px';
    document.body.appendChild(printFrame);

    const printDoc = printFrame.contentWindow?.document;
    if (printDoc) {
      printDoc.open();
      printDoc.write(`
        <html>
          <head>
            <title>Hóa đơn - ${checkInItem.customerName}</title>
            <style>
              @media print {
                @page { margin: 0; }
                body { margin: 1cm; }
              }
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                max-width: 300px; 
                margin: 0 auto; 
              }
              .header { 
                text-align: center; 
                border-bottom: 1px dashed #333; 
                padding-bottom: 10px; 
                margin-bottom: 10px; 
              }
              .service-line {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                padding: 5px 0;
              }
              .total-line { 
                display: flex; 
                justify-content: space-between; 
                margin: 5px 0; 
              }
              .total-due { 
                font-weight: bold; 
                border-top: 1px solid #333; 
                padding-top: 5px; 
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>HOÁ ĐƠN THANH TOÁN</h2>
              <p>${currentDate} ${currentTime}</p>
            </div>
            <p><strong>Khách hàng:</strong> ${checkInItem.customerName} (#${checkInItem.customerNumber})</p>
            ${checkInItem.phone ? `<p><strong>SĐT:</strong> ${checkInItem.phone}</p>` : ''}
            <hr style="border: 1px dashed #ccc; margin: 10px 0;">
            <h3>Dịch vụ:</h3>
            ${checkInItem.services?.map(service => `
              <div class="service-line">
                <span>${service}</span>
                <span>50,000₫</span>
              </div>
            `).join('') || '<p>Không có dịch vụ</p>'}
            <hr style="border: 1px dashed #ccc; margin: 10px 0;">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div class="total-line">
              <span>Discount:</span>
              <span>-${discount.toLocaleString('vi-VN')}₫</span>
            </div>
            <div class="total-line">
              <span>VAT (8%):</span>
              <span>${tax.toLocaleString('vi-VN')}₫</span>
            </div>
            <div class="total-line">
              <span>Tip:</span>
              <span>${tip.toLocaleString('vi-VN')}₫</span>
            </div>
            <div class="total-line total-due">
              <span>Tổng cộng:</span>
              <span>${totalDue.toLocaleString('vi-VN')}₫</span>
            </div>
            <p style="margin-top: 10px;"><strong>Thanh toán:</strong> ${selectedPayment === 'card' ? 'Credit/Debit Card' : selectedPayment === 'cash' ? 'Tiền mặt' : selectedPayment === 'gift-card' ? 'Gift Card' : 'Other (Chuyển khoản)'}</p>
            <p style="text-align: center; margin-top: 20px;">Cảm ơn quý khách!</p>
          </body>
        </html>
      `);
      printDoc.close();

      // Wait for content to load then print
      printFrame.contentWindow?.focus();
      setTimeout(() => {
        printFrame.contentWindow?.print();
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 100);
      }, 250);
    }
  };

  const handleStepClick = (step: CheckoutStep) => {
    // Allow navigation to any step except processing
    if (step !== 'processing') {
      setCurrentStep(step);
    }
  };

  const canGoNext = () => {
    if (currentStep === 'overview') {
      return selectedServiceItems.length > 0;
    }
    return false;
  };

  const canGoBack = () => {
    return currentStep === 'payment' || currentStep === 'receipt';
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'overview':
        setCurrentStep('payment');
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
    <div className="bg-muted/30 h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Customer Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Số thứ tự</Label>
            <h3 className="text-xl font-bold text-primary">#{checkInItem.customerNumber}</h3>
          </div>
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Tên khách hàng</Label>
            <p className="text-sm font-medium">{checkInItem.customerName}</p>
          </div>
          {checkInItem.phone && (
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
              <p className="text-sm">{checkInItem.phone}</p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Ngày giờ</Label>
            <p className="text-sm">{currentDate} {currentTime}</p>
          </div>
        </div>

        <Separator />

        {/* Services */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Dịch vụ đã sử dụng</h4>
          <div className="space-y-1.5">
            {selectedServiceItems.length > 0 ? (
              selectedServiceItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-2 bg-background rounded-lg">
                  <div className="flex-1">
                    <div className="text-xs font-medium">{item.serviceName}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      NV: {item.staffNames.join(", ")} • {item.duration} phút
                    </div>
                  </div>
                  <span className="text-xs font-semibold">{item.price.toLocaleString('vi-VN')}₫</span>
                </div>
              ))
            ) : checkInItem.services && checkInItem.services.length > 0 ? (
              checkInItem.services.map((service, index) => {
                // Find staff for this service
                const staffForService = checkInItem.staffAssignments?.filter(
                  assignment => assignment.serviceName === service
                ) || [];
                
                return (
                  <div key={index} className="flex justify-between items-start p-2 bg-background rounded-lg">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{service}</div>
                      {staffForService.length > 0 && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          NV: {staffForService.map(s => s.staffName).join(", ")} • 60 phút
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold">50,000₫</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">Chưa chọn dịch vụ</p>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        {serviceTotal > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-lg font-semibold">Tổng kết thanh toán</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                
                {/* Editable Discount */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Discount:</span>
                    <div className="flex items-center gap-1">
                      {discountType === 'percentage' ? (
                        <>
                          <Input
                            type="number"
                            value={editableDiscount}
                            onChange={(e) => setEditableDiscount(Number(e.target.value) || 0)}
                            className="w-12 h-6 text-xs text-center"
                            min="0"
                            max="100"
                          />
                          <span className="text-xs">%</span>
                        </>
                      ) : (
                        <Input
                          type="number"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                          className="w-20 h-6 text-xs text-center"
                          min="0"
                          placeholder="₫"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setDiscountType(discountType === 'percentage' ? 'amount' : 'percentage');
                          if (discountType === 'percentage') {
                            setDiscountAmount(discount);
                          } else {
                            setEditableDiscount(0);
                          }
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
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
                      {tipType === 'percentage' ? (
                        <>
                          <Input
                            type="number"
                            value={editableTip}
                            onChange={(e) => setEditableTip(Number(e.target.value) || 0)}
                            className="w-12 h-6 text-xs text-center"
                            min="0"
                            max="100"
                          />
                          <span className="text-xs">%</span>
                        </>
                      ) : (
                        <Input
                          type="number"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(Number(e.target.value) || 0)}
                          className="w-20 h-6 text-xs text-center"
                          min="0"
                          placeholder="₫"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setTipType(tipType === 'percentage' ? 'amount' : 'percentage');
                          if (tipType === 'percentage') {
                            setTipAmount(tip);
                          } else {
                            setEditableTip(0);
                          }
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <span>{tip.toLocaleString('vi-VN')}₫</span>
                </div>

                {/* Tip Distribution for Staff */}
                {tip > 0 && tipDistribution.length > 0 && (
                  <div className="mt-2 p-3 bg-background rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs font-medium text-muted-foreground">Phân chia tip cho nhân viên:</div>
                      {totalCustomTips > tip && (
                        <span className="text-xs text-destructive font-medium">Vượt quá {(totalCustomTips - tip).toLocaleString('vi-VN')}₫</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {tipDistribution.map((dist, idx) => (
                        <div key={idx} className="flex justify-between items-center gap-2 text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{dist.staffName}</div>
                            <div className="text-muted-foreground text-[10px]">
                              ({dist.percentage.toFixed(1)}% - {dist.revenue.toLocaleString('vi-VN')}₫)
                            </div>
                          </div>
                          <Input
                            type="number"
                            value={customStaffTips.get(dist.staffId) ?? dist.tipAmount}
                            onChange={(e) => {
                              const newValue = Number(e.target.value) || 0;
                              const newMap = new Map(customStaffTips);
                              newMap.set(dist.staffId, newValue);
                              setCustomStaffTips(newMap);
                            }}
                            className={`w-24 h-7 text-xs text-right ${
                              totalCustomTips > tip ? 'border-destructive' : ''
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-border text-xs">
                      <span className="font-medium">Tổng tip phân chia:</span>
                      <span className={`font-semibold ${totalCustomTips > tip ? 'text-destructive' : 'text-green-600'}`}>
                        {totalCustomTips.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                )}
                
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{totalDue.toLocaleString('vi-VN')}₫</span>
                </div>
                {totalPaid > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Đã thanh toán:</span>
                      <span>-{totalPaid.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                      <span>Còn lại:</span>
                      <span className="text-orange-600">{remainingDue.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Payment Records */}
        {paymentRecords.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Lịch sử thanh toán</h4>
              <div className="space-y-2">
                {paymentRecords.map((record, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2 bg-background rounded">
                    <span className="text-muted-foreground">
                      {record.method === 'card' ? 'Thẻ' : record.method === 'cash' ? 'Tiền mặt' : record.method === 'gift-card' ? 'Gift Card' : 'Chuyển khoản'}
                    </span>
                    <span className="font-medium">{record.amount.toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
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
              <h3 className="text-lg font-semibold mb-2">Chọn dịch vụ và nhân viên</h3>
              <p className="text-xs text-muted-foreground">
                Vui lòng chọn chính xác dịch vụ khách hàng đã sử dụng và nhân viên thực hiện
              </p>
            </div>
            

            {checkInItem.notes && (
              <Card className="p-3">
                <h4 className="text-sm font-semibold mb-1">Ghi chú</h4>
                <p className="text-xs text-muted-foreground">{checkInItem.notes}</p>
              </Card>
            )}

            {/* Service and Staff Selection */}
            <Card className="p-3">
              <h4 className="text-sm font-semibold mb-2">Chọn dịch vụ và nhân viên</h4>
              <ServiceStaffSelector
                selectedItems={selectedServiceItems}
                onItemsChange={setSelectedServiceItems}
              />
            </Card>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Tổng cộng:</span>
                <span className="text-sm font-bold">{totalDue.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Tiền cần thanh toán:</span>
                <span className="text-base font-bold text-primary">{remainingDue.toLocaleString('vi-VN')}₫</span>
              </div>
              {totalPaid > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Đã thanh toán:</span>
                  <span className="text-sm font-semibold text-green-600">{totalPaid.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <h3 className="text-lg font-semibold pt-3">Chọn phương thức thanh toán</h3>
            </div>

            <div className="grid gap-4">
              {/* Card Payment */}
              <Card className="border-2 border-border">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Credit/Debit Card</h4>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, Credit/Debit</p>
                    </div>
                    <div className="flex gap-2">
                      {showCustomInput === 'card' ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value ? Number(e.target.value) : '')}
                            className="w-32"
                            placeholder="Số tiền"
                            max={remainingDue}
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleCustomPayment('card')}
                            disabled={!customAmountInput || customAmountInput <= 0 || customAmountInput > remainingDue}
                          >
                            OK
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCustomInput(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePayFullClick('card')}
                          >
                            Pay {remainingDue.toLocaleString('vi-VN')}₫
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCustomClick('card')}
                          >
                            Custom
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Payment History */}
                  {cardPayments.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <button
                        onClick={() => setShowCardHistory(!showCardHistory)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCardHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        <span>Lịch sử thanh toán thẻ ({cardPayments.length})</span>
                      </button>
                      
                      {showCardHistory && (
                        <div className="mt-2 space-y-1">
                          {cardPayments.map((payment, index) => (
                            <div key={index} className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Charged lần {index + 1}</span>
                              <span className="font-medium">{payment.amount.toLocaleString('vi-VN')}₫</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Cash Payment */}
              <Card 
                className={`p-6 border-2 transition-all ${
                  disabledMethods.has('cash') 
                    ? 'opacity-50 cursor-not-allowed border-border' 
                    : 'hover:shadow-md border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Cash</h4>
                    <p className="text-sm text-muted-foreground">Tiền mặt</p>
                  </div>
                  {!disabledMethods.has('cash') && (
                    <div className="flex gap-2">
                      {showCustomInput === 'cash' ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value ? Number(e.target.value) : '')}
                            className="w-32"
                            placeholder="Số tiền"
                            max={remainingDue}
                          />
                          <Button 
                            size="sm"
                            onClick={() => {
                              const amount = typeof customAmountInput === 'number' ? customAmountInput : 0;
                              if (amount > 0 && amount <= remainingDue) {
                                setCashPaymentAmount(amount);
                                setShowCashDialog(true);
                              }
                            }}
                            disabled={!customAmountInput || customAmountInput <= 0 || customAmountInput > remainingDue}
                          >
                            OK
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCustomInput(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setCashPaymentAmount(remainingDue);
                              setShowCashDialog(true);
                            }}
                          >
                            Pay {remainingDue.toLocaleString('vi-VN')}₫
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCustomClick('cash')}
                          >
                            Custom
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Gift Card */}
              <Card 
                className={`p-6 border-2 transition-all ${
                  disabledMethods.has('gift-card') 
                    ? 'opacity-50 cursor-not-allowed border-border' 
                    : 'hover:shadow-md border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Gift className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Gift Card</h4>
                    <p className="text-sm text-muted-foreground">Gift card payment</p>
                  </div>
                  {!disabledMethods.has('gift-card') && (
                    <div className="flex gap-2">
                      {showCustomInput === 'gift-card' ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value ? Number(e.target.value) : '')}
                            className="w-32"
                            placeholder="Số tiền"
                            max={remainingDue}
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleCustomPayment('gift-card')}
                            disabled={!customAmountInput || customAmountInput <= 0 || customAmountInput > remainingDue}
                          >
                            OK
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCustomInput(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePayFullClick('gift-card')}
                          >
                            Pay {remainingDue.toLocaleString('vi-VN')}₫
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCustomClick('gift-card')}
                          >
                            Custom
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Other - Transfer */}
              <Card 
                className={`p-6 border-2 transition-all ${
                  disabledMethods.has('other') 
                    ? 'opacity-50 cursor-not-allowed border-border' 
                    : 'hover:shadow-md border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <ArrowRightLeft className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Other</h4>
                    <p className="text-sm text-muted-foreground">Chuyển khoản - Transfer</p>
                  </div>
                  {!disabledMethods.has('other') && (
                    <div className="flex gap-2">
                      {showCustomInput === 'other' ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value ? Number(e.target.value) : '')}
                            className="w-32"
                            placeholder="Số tiền"
                            max={remainingDue}
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleCustomPayment('other')}
                            disabled={!customAmountInput || customAmountInput <= 0 || customAmountInput > remainingDue}
                          >
                            OK
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCustomInput(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePayFullClick('other')}
                          >
                            Pay {remainingDue.toLocaleString('vi-VN')}₫
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCustomClick('other')}
                          >
                            Custom
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'processing':
        // Get the most recent card payment amount for POS simulation
        const currentCardPayment = paymentRecords.length > 0 
          ? paymentRecords[paymentRecords.length - 1].amount 
          : remainingDue;
        
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
              <p className="text-2xl font-bold text-primary">{currentCardPayment.toLocaleString('vi-VN')}₫</p>
              <p className="text-sm text-muted-foreground">Số tiền đang thanh toán</p>
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

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Overlay */}
        <div
        className="absolute inset-0 bg-black/50 z-0"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      
      {/* Popup Container - Full viewport with padding */}
      <div 
        className="relative z-10 w-[90vw] h-[90vh] max-w-none max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-background rounded-xl shadow-2xl flex h-full overflow-hidden">
          {/* Close button - Positioned absolutely at top right */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 right-2 z-10 w-8 h-8 p-0 hover:bg-muted/80"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Left sidebar - Steps and invoice info */}
          <div className="w-2/5 border-r flex flex-col min-h-0">
            {/* Steps section */}
            <div className="p-6 border-b bg-muted/20 shrink-0">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Xem trước</h2>
              <p className="text-sm text-muted-foreground">Checkout cho {checkInItem.customerName}</p>
            </div>
            </div>

            {/* Invoice info */}
            <div className="flex-1 min-h-0">
              {renderFixedInvoiceInfo()}
            </div>
          </div>

          {/* Right content area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Step indicators - Fixed header */}
            <div className="p-4 border-b bg-muted/10 shrink-0">
              {/* Horizontal step indicators with individual connecting lines */}
              <div className="flex items-center justify-center w-full max-w-md mx-auto">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    {/* Step circle and label */}
                    <div 
                      className="flex flex-col items-center cursor-pointer relative z-10"
                      onClick={() => handleStepClick(step.key)}
                      title={step.label}
                    >
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors mb-2 ${
                          currentStep === step.key 
                            ? 'bg-background text-foreground border-primary border-[3px]' 
                            : currentStepIndex > index 
                            ? 'bg-green-500 text-white border-2 border-green-500' 
                            : 'bg-background text-muted-foreground border-2 border-gray-300'
                        } ${step.key === 'processing' ? 'cursor-not-allowed' : ''}`}
                      >
                        {currentStepIndex > index ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{step.label}</span>
                    </div>
                    
                    {/* Connecting line - only if not the last step */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 h-0.5 mx-4 -mt-6">
                        <div 
                          className={`h-full w-16 transition-colors ${
                            currentStepIndex > index 
                              ? 'bg-green-500' 
                              : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {getStepContent()}
            </div>

            {/* Footer with navigation - Fixed height */}
            <div className="border-t p-6 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  {canGoBack() && (
                    <Button variant="outline" size="lg" onClick={handleBack}>
                      <ArrowLeft className="h-5 w-5 mr-2" />
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
                      size="lg"
                    >
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Tiếp tục
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Cash Payment Dialog */}
      <Dialog open={showCashDialog} onOpenChange={setShowCashDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán tiền mặt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-muted-foreground">Số tiền cần thanh toán:</span>
                <span className="text-lg font-bold text-primary">
                  {cashPaymentAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Số tiền khách đưa</Label>
              <Input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value ? Number(e.target.value) : '')}
                placeholder="Nhập số tiền..."
                autoFocus
              />
            </div>

            {cashReceived !== '' && cashReceived >= cashPaymentAmount && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Khách đưa:</span>
                  <span className="font-medium">{(cashReceived as number).toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Cần thanh toán:</span>
                  <span className="font-medium">{cashPaymentAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-700">Tiền thối lại:</span>
                  <span className="text-xl font-bold text-green-700">
                    {((cashReceived as number) - cashPaymentAmount).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            )}

            {cashReceived !== '' && cashReceived < cashPaymentAmount && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  Số tiền chưa đủ. Còn thiếu: {(cashPaymentAmount - (cashReceived as number)).toLocaleString('vi-VN')}₫
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCashDialog(false);
                  setCashReceived('');
                  setShowCustomInput(null);
                  setCustomAmountInput('');
                }}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  handlePaymentSelect('cash', cashPaymentAmount);
                  setShowCashDialog(false);
                  setCashReceived('');
                  setShowCustomInput(null);
                  setCustomAmountInput('');
                }}
                disabled={cashReceived === '' || (cashReceived as number) < cashPaymentAmount}
                className="flex-1"
              >
                Hoàn thành
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>,
    document.body
  );
}