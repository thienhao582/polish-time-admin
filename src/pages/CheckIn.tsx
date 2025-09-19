import { useState, useEffect } from "react";
import { Clock, Users, Search, Plus, QrCode, Edit, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QRCodePopup from "@/components/QRCodePopup";
import { CheckInEditDialog } from "@/components/CheckInEditDialog";
import { useCheckInStore } from "@/stores/useCheckInStore";
import { useDemoMode } from "@/contexts/DemoModeContext";

const CheckIn = () => {
  const { toast } = useToast();
  const { checkIns, getFilteredCheckIns, initializeWithDemoData, updateCheckIn, convertToAppointment, checkOut } = useCheckInStore();
  const { isDemoMode } = useDemoMode();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // Changed default to show all
  const [selectedQRItem, setSelectedQRItem] = useState<any>(null);
  const [editDialogItem, setEditDialogItem] = useState<any>(null);
  
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize demo data if in demo mode and no check-ins exist
  useEffect(() => {
    if (isDemoMode && checkIns.length === 0) {
      initializeWithDemoData();
    }
  }, [isDemoMode, checkIns.length, initializeWithDemoData]);

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

  const filteredItems = getFilteredCheckIns(today, statusFilter, searchTerm);

  const handleCheckOut = (id: string) => {
    checkOut(id);
    toast({
      title: "Thành công",
      description: "Khách hàng đã check out",
    });
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

  const todayCheckIns = checkIns.filter(item => item.date === today);
  const stats = {
    total: todayCheckIns.length,
    waiting: todayCheckIns.filter(item => item.status === "waiting").length,
    booked: todayCheckIns.filter(item => item.status === "booked").length,
    completed: todayCheckIns.filter(item => item.status === "completed").length,
    avgWaitTime: todayCheckIns.length > 0 ? Math.round(todayCheckIns.reduce((acc, item) => acc + (item.waitTime || 0), 0) / todayCheckIns.length) : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Check In Management</h1>
          <p className="text-muted-foreground mt-1">Manage customer check-ins and queue</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Check-in
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Checked In</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground">Waiting</p>
                 <p className="text-2xl font-bold">{stats.waiting}</p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground">Đã đặt lịch</p>
                 <p className="text-2xl font-bold">{stats.booked}</p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground">Hoàn thành</p>
                 <p className="text-2xl font-bold">{stats.completed}</p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Wait Time</p>
                <p className="text-2xl font-bold">{stats.avgWaitTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in Queue</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
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

          {/* Check-in List */}
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-primary">
                          #{item.customerNumber}
                        </span>
                        <div>
                          <h3 className="font-semibold text-lg">{item.customerName}</h3>
                          {item.phone && (
                            <p className="text-sm text-muted-foreground">{item.phone}</p>
                          )}
                        </div>
                      </div>
                      
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${
                              item.status === 'waiting' ? 'text-yellow-600' : 
                              item.status === 'booked' ? 'text-blue-600' : 'text-green-600'
                            }`}>
                              {item.status === 'waiting' ? 'Đang chờ' :
                               item.status === 'booked' ? 'Đã đặt lịch' : 'Hoàn thành'}
                            </span>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{item.checkInTime}</span>
                          </div>
                        </div>
                        
                        {item.waitTime && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">Wait:</span>
                            <span className={`text-sm font-medium ${getWaitTimeColor(item.waitTime)}`}>
                              {item.waitTime}m
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {item.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant={getTagVariant(tag)}
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                       <div className="text-sm text-muted-foreground">
                         <strong>Dịch vụ:</strong> {
                           item.services && item.services.length > 0 
                             ? item.services.filter(s => s && s.trim() !== '').join(", ") 
                             : "Chưa chọn dịch vụ"
                         }
                       </div>
                    </div>
                    
                     <div className="flex flex-col gap-2 ml-6">
                       <Button 
                         size="sm" 
                         className="gap-2"
                         onClick={() => setSelectedQRItem(item)}
                       >
                         <QrCode className="h-4 w-4" />
                         Show QR
                       </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditCheckIn(item)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                         {item.status === 'waiting' && (
                           <Button 
                             size="sm" 
                             variant="secondary"
                             onClick={() => handleConvertToAppointment(item.id)}
                             className="gap-2"
                           >
                             <Calendar className="h-4 w-4" />
                             Đặt lịch
                           </Button>
                         )}
                         {item.status !== 'completed' && (
                           <Button 
                             size="sm" 
                             variant="destructive"
                             onClick={() => handleCheckOut(item.id)}
                           >
                             Check Out
                           </Button>
                         )}
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p>No customers match your current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Popup */}
      {selectedQRItem && (
        <QRCodePopup
          isOpen={!!selectedQRItem}
          onClose={() => setSelectedQRItem(null)}
          itemId={selectedQRItem.id}
          customerName={selectedQRItem.customerName}
          customerNumber={selectedQRItem.customerNumber}
          customerPhone={selectedQRItem.customerPhone || "N/A"}
        />
      )}

      {/* Edit Dialog */}
      {editDialogItem && (
        <CheckInEditDialog
          isOpen={!!editDialogItem}
          onClose={() => setEditDialogItem(null)}
          checkInItem={editDialogItem}
          onUpdate={handleUpdateCheckIn}
        />
      )}
    </div>
  );
};

export default CheckIn;