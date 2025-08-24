import { X, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  const handlePrint = () => {
    // Print functionality placeholder - doesn't do anything as requested
    console.log("Print functionality placeholder");
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
              <div className="space-y-1">
                {checkInItem.services && checkInItem.services.length > 0 ? (
                  checkInItem.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{service}</span>
                      <span className="text-sm text-gray-500">✓</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Không có dịch vụ</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {checkInItem.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-gray-500 text-sm mb-1">Ghi chú:</p>
                  <p className="text-sm">{checkInItem.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Footer Info */}
            <div className="text-center text-xs text-gray-500">
              <p>Ngày: {currentDate}</p>
              <p className="mt-1">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
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