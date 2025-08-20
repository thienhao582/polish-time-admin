import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface QRCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  customerName: string;
  customerNumber: string;
}

const QRCodePopup = ({ isOpen, onClose, itemId, customerName, customerNumber }: QRCodePopupProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    const generateQRCode = async () => {
      if (canvasRef.current && isOpen) {
        try {
          // Generate QR code with item ID
          await QRCode.toCanvas(canvasRef.current, itemId, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });

          // Also generate data URL for download
          const dataUrl = await QRCode.toDataURL(itemId, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          setQrCodeDataUrl(dataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
          toast({
            title: "Error",
            description: "Failed to generate QR code",
            variant: "destructive"
          });
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

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `qr-code-${customerNumber}-${customerName}.png`;
      link.href = qrCodeDataUrl;
      link.click();
      
      toast({
        title: "Downloaded!",
        description: "QR code saved to downloads"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {customerName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {/* Customer Info */}
          <div className="text-center">
            <p className="text-lg font-semibold">#{customerNumber}</p>
            <p className="text-sm text-muted-foreground">{customerName}</p>
          </div>

          {/* QR Code */}
          <div className="p-4 bg-white rounded-lg border">
            <canvas 
              ref={canvasRef}
              className="block"
            />
          </div>

          {/* Item ID */}
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <span className="text-sm font-mono">{itemId}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyId}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleDownloadQR}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Download QR
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