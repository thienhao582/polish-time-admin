import { useState } from "react";
import { Clock, Users, Search, Plus, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QRCodePopup from "@/components/QRCodePopup";

interface CheckInItem {
  id: string;
  customerNumber: string;
  customerName: string;
  status: 'Walk In' | 'Appointment';
  checkInTime: string;
  tags: string[];
  services: string[];
  phone?: string;
  waitTime?: number;
}

const CheckIn = () => {
  const { toast } = useToast();
  const [checkInItems, setCheckInItems] = useState<CheckInItem[]>([
    {
      id: "1",
      customerNumber: "3760",
      customerName: "Misteri Crowder",
      status: "Walk In",
      checkInTime: "10:23 AM",
      tags: ["NEW"],
      services: ["Haircut", "Wash"],
      phone: "0123456789",
      waitTime: 15
    },
    {
      id: "2", 
      customerNumber: "3141",
      customerName: "Sophie",
      status: "Walk In",
      checkInTime: "09:08 AM",
      tags: ["VIP"],
      services: ["Color", "Style"],
      phone: "0987654321",
      waitTime: 45
    },
    {
      id: "3",
      customerNumber: "2895",
      customerName: "John Doe",
      status: "Appointment",
      checkInTime: "11:15 AM",
      tags: ["REGULAR"],
      services: ["Trim"],
      phone: "0555123456",
      waitTime: 5
    },
    {
      id: "4",
      customerNumber: "2701",
      customerName: "Maria Garcia",
      status: "Walk In",
      checkInTime: "11:30 AM",
      tags: ["NEW"],
      services: ["Manicure", "Pedicure"],
      phone: "0444987654",
      waitTime: 20
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQRItem, setSelectedQRItem] = useState<CheckInItem | null>(null);

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

  const filteredItems = checkInItems.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.customerNumber.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCheckOut = (id: string) => {
    setCheckInItems(items => items.filter(item => item.id !== id));
  };

  const stats = {
    total: checkInItems.length,
    walkIn: checkInItems.filter(item => item.status === "Walk In").length,
    appointments: checkInItems.filter(item => item.status === "Appointment").length,
    avgWaitTime: Math.round(checkInItems.reduce((acc, item) => acc + (item.waitTime || 0), 0) / checkInItems.length)
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
                <p className="text-sm font-medium text-muted-foreground">Walk-ins</p>
                <p className="text-2xl font-bold">{stats.walkIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                <p className="text-2xl font-bold">{stats.appointments}</p>
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
                placeholder="Search by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Walk In">Walk In</SelectItem>
                <SelectItem value="Appointment">Appointment</SelectItem>
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
                            item.status === 'Walk In' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {item.status}
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
                        <strong>Services:</strong> {item.services.join(", ")}
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
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleCheckOut(item.id)}
                      >
                        Check Out
                      </Button>
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
        />
      )}
    </div>
  );
};

export default CheckIn;