import { format } from "date-fns";
import { X, Clock, Phone, Users, QrCode, Edit, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCheckInStore } from "@/stores/useCheckInStore";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import QRCodePopup from "@/components/QRCodePopup";
import { CheckInEditDialog } from "@/components/CheckInEditDialog";
import { useToast } from "@/hooks/use-toast";
import { ReceiptPopup } from "@/components/ReceiptPopup";

interface CheckInSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onAppointmentCreated?: () => void;
}

export function CheckInSidebar({ isOpen, onClose, selectedDate, onAppointmentCreated }: CheckInSidebarProps) {
  const { checkIns, getFilteredCheckIns, initializeWithDemoData, updateCheckIn, convertToAppointment, checkOut } = useCheckInStore();
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();
  const [selectedQRItem, setSelectedQRItem] = useState<any>(null);
  const [editDialogItem, setEditDialogItem] = useState<any>(null);
  const [receiptItem, setReceiptItem] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all"); // Changed default to show all
  const [searchTerm, setSearchTerm] = useState("");
  
  const dateString = format(selectedDate, "yyyy-MM-dd");
  
  // Initialize demo data if in demo mode and no check-ins exist
  useEffect(() => {
    if (isDemoMode && checkIns.length === 0) {
      initializeWithDemoData();
    }
  }, [isDemoMode, checkIns.length, initializeWithDemoData]);
  
  // Get filtered and sorted check-ins
  const filteredCheckIns = getFilteredCheckIns(dateString, statusFilter, searchTerm);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>;
      case 'booked':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Đã đặt lịch</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTagVariant = (tag: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (tag) {
      case "NEW":
        return "default";
      case "VIP":
        return "destructive";
      case "REGULAR":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleCheckOut = (checkInItem: any) => {
    setReceiptItem(checkInItem);
  };

  const handleConfirmCheckOut = () => {
    if (receiptItem) {
      checkOut(receiptItem.id);
      toast({
        title: "Thành công",
        description: "Khách hàng đã check out",
      });
      setReceiptItem(null);
    }
  };

  const handleConvertToAppointment = (id: string) => {
    convertToAppointment(id);
    toast({
      title: "Thành công", 
      description: "Đã chuyển thành lịch hẹn",
    });
  };

  const handleEditCheckIn = (item: any) => {
    setEditDialogItem(item);
  };

  const handleUpdateCheckIn = (updatedItem: any) => {
    updateCheckIn(updatedItem.id, updatedItem);
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime <= 10) return "text-green-600";
    if (waitTime <= 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Danh sách Check-in
              </h3>
              <p className="text-sm text-gray-600">
                {format(selectedDate, "EEEE, dd/MM/yyyy")}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-white/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Summary */}
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">{filteredCheckIns.length}</span> khách hàng đã check-in
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo tên hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="waiting">Đang chờ</SelectItem>
                <SelectItem value="booked">Đã đặt lịch</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-[calc(100vh-220px)]">
          <div className="p-4">
            {filteredCheckIns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Không tìm thấy khách hàng nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCheckIns.map((checkIn) => (
                  <div 
                    key={checkIn.id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    {/* Customer Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl font-bold text-primary">
                          #{checkIn.customerNumber}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{checkIn.customerName}</p>
                          {checkIn.phone && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {checkIn.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(checkIn.status)}
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3">
                      {checkIn.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant={getTagVariant(tag)}
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Time Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500 mb-1">Check-in</p>
                        <p className="font-medium flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-green-600" />
                          {checkIn.checkInTime}
                        </p>
                      </div>
                      
                      {checkIn.waitTime && (
                        <div>
                          <p className="text-gray-500 mb-1">Thời gian chờ</p>
                          <p className={`font-medium ${getWaitTimeColor(checkIn.waitTime)}`}>
                            {checkIn.waitTime}m
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Services */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm">
                        <span className="text-gray-500">Dịch vụ: </span>
                        <span className="font-medium">
                          {checkIn.services && checkIn.services.length > 0 
                            ? checkIn.services.filter(s => s && s.trim() !== '').join(", ") 
                            : "Chưa chọn dịch vụ"}
                        </span>
                      </p>
                    </div>

                    {/* Notes */}
                    {checkIn.notes && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="text-gray-500">Ghi chú: </span>
                          <span className="text-gray-700">{checkIn.notes}</span>
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <TooltipProvider>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedQRItem(checkIn)}
                                className="p-2"
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Show QR checkin</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditCheckIn(checkIn)}
                            className="gap-1 text-xs"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          
                          {checkIn.status === 'booked' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleCheckOut(checkIn)}
                              className="text-xs"
                            >
                              Check Out
                            </Button>
                          )}
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* QR Code Popup */}
      {selectedQRItem && (
        <QRCodePopup
          isOpen={!!selectedQRItem}
          onClose={() => setSelectedQRItem(null)}
          itemId={selectedQRItem.id}
          customerName={selectedQRItem.customerName}
          customerNumber={selectedQRItem.customerNumber}
        />
      )}

      {/* Edit Dialog */}
      {editDialogItem && (
        <CheckInEditDialog
          isOpen={!!editDialogItem}
          onClose={() => setEditDialogItem(null)}
          checkInItem={editDialogItem}
          onUpdate={handleUpdateCheckIn}
          onAppointmentCreated={onAppointmentCreated}
        />
      )}

      {/* Receipt Popup */}
      {receiptItem && (
        <ReceiptPopup
          isOpen={!!receiptItem}
          onClose={() => setReceiptItem(null)}
          checkInItem={receiptItem}
          onConfirmCheckOut={handleConfirmCheckOut}
        />
      )}
    </>
  );
}