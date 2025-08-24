import { format } from "date-fns";
import { X, Clock, User, Phone, Users } from "lucide-react";
import { useCheckInStore } from "@/stores/useCheckInStore";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

interface CheckInSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export function CheckInSidebar({ isOpen, onClose, selectedDate }: CheckInSidebarProps) {
  const { checkIns, getCheckInsByDate, initializeWithDemoData } = useCheckInStore();
  const { isDemoMode } = useDemoMode();
  
  const dateString = format(selectedDate, "yyyy-MM-dd");
  
  // Initialize demo data if in demo mode and no check-ins exist
  useEffect(() => {
    if (isDemoMode && checkIns.length === 0) {
      initializeWithDemoData();
    }
  }, [isDemoMode, checkIns.length, initializeWithDemoData]);
  
  // Filter check-ins for the selected date
  const dayCheckIns = getCheckInsByDate(dateString);
  
  // Sort by check-in time
  const sortedCheckIns = dayCheckIns.sort((a, b) => {
    return a.checkInTime.localeCompare(b.checkInTime);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>;
      case 'in_service':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Đang phục vụ</Badge>;
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
            <span className="font-medium">{dayCheckIns.length}</span> khách hàng đã check-in
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
          <div className="p-4">
            {sortedCheckIns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có khách hàng check-in trong ngày này</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedCheckIns.map((checkIn) => (
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
                    {checkIn.services && checkIn.services.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm">
                          <span className="text-gray-500">Dịch vụ: </span>
                          <span className="font-medium">{checkIn.services.join(", ")}</span>
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {checkIn.notes && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="text-gray-500">Ghi chú: </span>
                          <span className="text-gray-700">{checkIn.notes}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}