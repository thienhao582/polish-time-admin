import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface QRCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  customerName: string;
  customerNumber: string;
  customerPhone: string;
}

const QRCodePopup = ({ isOpen, onClose, itemId, customerName, customerNumber, customerPhone }: QRCodePopupProps) => {
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQRCode = async () => {
      if (isOpen && itemId) {
        setIsLoading(true);
        try {
          console.log('Generating QR code for ID:', itemId);
          
          // Generate QR code as data URL
          const dataUrl = await QRCode.toDataURL(itemId, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
          });
          
          console.log('QR code generated successfully');
          setQrCodeDataUrl(dataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
          toast({
            title: "Error",
            description: "Failed to generate QR code",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    generateQRCode();
  }, [isOpen, itemId, toast]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(itemId);
      toast({
        title: "Copied!",
        description: "Item ID copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy ID",
        variant: "destructive"
      });
    }
  };

  const handlePrintQR = () => {
    if (qrCodeDataUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${customerName}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 20px; 
                }
                .customer-info { 
                  margin-bottom: 20px; 
                }
                .qr-code { 
                  margin: 20px 0; 
                }
              </style>
            </head>
            <body>
              <div class="customer-info">
                <h2>${customerName}</h2>
                <p>Số khách hàng: #${customerNumber}</p>
                <p>SĐT: ${customerPhone}</p>
              </div>
              <div class="qr-code">
                <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 256px; height: 256px;" />
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast({
        title: "In thành công!",
        description: "QR code đã được gửi đến máy in"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {customerName}</DialogTitle>
          <DialogDescription>
            Scan this QR code to access customer information
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {/* Customer Info */}
          <div className="text-center">
            <p className="text-lg font-semibold">#{customerNumber}</p>
            <p className="text-sm text-muted-foreground">{customerName}</p>
            <p className="text-sm text-muted-foreground">{customerPhone}</p>
          </div>

          {/* QR Code */}
          <div className="p-4 bg-white rounded-lg border shadow-sm">
            {isLoading ? (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt={`QR Code for ${customerName}`}
                className="w-64 h-64 block"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                Failed to generate QR code
              </div>
            )}
          </div>


          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handlePrintQR}
              className="flex-1 gap-2"
              disabled={!qrCodeDataUrl}
            >
              <Printer className="h-4 w-4" />
              In QR
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodePopup;