import { useState } from "react";
import { Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckInItem {
  id: string;
  customerNumber: string;
  customerName: string;
  status: 'Walk In' | 'Appointment';
  checkInTime: string;
  tags: string[];
  services: string[];
}

const CheckInMenu = () => {
  // Mock data - replace with actual data from your store
  const [checkInItems] = useState<CheckInItem[]>([
    {
      id: "1",
      customerNumber: "3760",
      customerName: "Misteri Crowder",
      status: "Walk In",
      checkInTime: "10:23 AM",
      tags: ["NEW"],
      services: ["Haircut", "Wash"]
    },
    {
      id: "2", 
      customerNumber: "3141",
      customerName: "Sophie",
      status: "Walk In",
      checkInTime: "09:08 AM",
      tags: ["VIP"],
      services: ["Color", "Style"]
    },
    {
      id: "3",
      customerNumber: "2895",
      customerName: "John Doe",
      status: "Appointment",
      checkInTime: "11:15 AM",
      tags: ["REGULAR"],
      services: ["Trim"]
    }
  ]);

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Users className="h-4 w-4" />
          {checkInItems.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {checkInItems.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Check In List</h3>
          <p className="text-sm text-muted-foreground">
            {checkInItems.length} customers checked in
          </p>
        </div>
        
        <ScrollArea className="max-h-96">
          <div className="p-2 space-y-2">
            {checkInItems.map((item) => (
              <Card key={item.id} className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">
                          {item.customerNumber}
                        </span>
                        <span className="font-medium">
                          {item.customerName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="text-green-600 font-medium">
                          {item.status}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{item.checkInTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant={getTagVariant(tag)}
                            className="text-xs px-2 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {item.services.join(", ")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 h-7 text-xs"
                      >
                        Pay
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="px-3 py-1 h-7 text-xs"
                      >
                        Service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {checkInItems.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No customers checked in</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default CheckInMenu;