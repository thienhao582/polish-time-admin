import { format } from "date-fns";
import { X, Clock, User, Phone } from "lucide-react";
import { useSalonStore } from "@/stores/useSalonStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckInSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export function CheckInSidebar({ isOpen, onClose, selectedDate }: CheckInSidebarProps) {
  const { timeRecords } = useSalonStore();
  
  const dateString = format(selectedDate, "yyyy-MM-dd");
  
  // Filter check-ins for the selected date
  const dayCheckIns = timeRecords.filter(record => record.date === dateString);
  
  // Sort by check-in time
  const sortedCheckIns = dayCheckIns.sort((a, b) => {
    if (!a.checkIn && !b.checkIn) return 0;
    if (!a.checkIn) return 1;
    if (!b.checkIn) return -1;
    return a.checkIn.localeCompare(b.checkIn);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Đang làm</Badge>;
      case 'break':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Nghỉ giải lao</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Hoàn thành</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
            <span className="font-medium">{dayCheckIns.length}</span> nhân viên đã check-in
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
          <div className="p-4">
            {sortedCheckIns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có check-in nào trong ngày này</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedCheckIns.map((record) => (
                  <div 
                    key={record.id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    {/* Employee Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{record.employeeName}</p>
                          <p className="text-xs text-gray-500">ID: {record.employeeId}</p>
                        </div>
                      </div>
                      {getStatusBadge(record.status)}
                    </div>

                    {/* Time Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Check-in</p>
                        <p className="font-medium">
                          {record.checkIn ? (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-green-600" />
                              {record.checkIn}
                            </span>
                          ) : (
                            <span className="text-gray-400">Chưa check-in</span>
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 mb-1">Check-out</p>
                        <p className="font-medium">
                          {record.checkOut ? (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-red-600" />
                              {record.checkOut}
                            </span>
                          ) : (
                            <span className="text-gray-400">Chưa check-out</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Total Hours */}
                    {record.totalHours && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm">
                          <span className="text-gray-500">Tổng giờ làm: </span>
                          <span className="font-medium text-blue-600">{record.totalHours}h</span>
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