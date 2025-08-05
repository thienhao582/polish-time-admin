
import { useState } from "react";
import { Filter, Users, User, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSalonStore } from "@/stores/useSalonStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { AvailableStaffSidebar } from "./AvailableStaffSidebar";

interface AppointmentFiltersProps {
  displayMode: "customer" | "staff" | "both";
  setDisplayMode: (mode: "customer" | "staff" | "both") => void;
  selectedStaffIds: string[];
  setSelectedStaffIds: (ids: string[]) => void;
  filteredAppointmentsCount: number;
  onMaximize: () => void;
  showFullView: boolean;
  setShowFullView: (show: boolean) => void;
  viewMode?: string;
  selectedDate?: Date;
  filteredAppointments?: any[];
  showAvailableStaffSidebar?: boolean;
  setShowAvailableStaffSidebar?: (show: boolean) => void;
}

export function AppointmentFilters({
  displayMode,
  setDisplayMode,
  selectedStaffIds,
  setSelectedStaffIds,
  filteredAppointmentsCount,
  onMaximize,
  showFullView,
  setShowFullView,
  viewMode,
  selectedDate,
  filteredAppointments,
  showAvailableStaffSidebar,
  setShowAvailableStaffSidebar
}: AppointmentFiltersProps) {
  const { employees } = useSalonStore();
  const { t } = useLanguage();
  const [isStaffFilterOpen, setIsStaffFilterOpen] = useState(false);

  const handleStaffSelection = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaffIds([...selectedStaffIds, staffId]);
    } else {
      setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffId));
    }
  };

  const clearStaffFilter = () => {
    setSelectedStaffIds([]);
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 gap-4">
        {/* Left side filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Hiển thị:</span>
            <Select value={displayMode} onValueChange={(value: "customer" | "staff" | "both") => setDisplayMode(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Cả hai</SelectItem>
                <SelectItem value="customer">KH</SelectItem>
                <SelectItem value="staff">NV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Popover open={isStaffFilterOpen} onOpenChange={setIsStaffFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={selectedStaffIds.length > 0 ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Lọc NV
                {selectedStaffIds.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {selectedStaffIds.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Chọn nhân viên</h4>
                  {selectedStaffIds.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearStaffFilter}>
                      Xóa hết
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {employees
                    .filter(employee => {
                      // Only show service staff
                      const role = employee.role?.toLowerCase() || '';
                      return !role.includes('quản lý') && !role.includes('lễ tân') && 
                             !role.includes('manager') && !role.includes('reception');
                    })
                    .map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={employee.id}
                        checked={selectedStaffIds.includes(employee.id)}
                        onCheckedChange={(checked) => 
                          handleStaffSelection(employee.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={employee.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {employee.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <Checkbox
              id="show-full-view"
              checked={showFullView}
              onCheckedChange={(checked) => setShowFullView(checked as boolean)}
            />
            <label htmlFor="show-full-view" className="text-sm text-gray-600">
              Hiện đầy đủ
            </label>
          </div>

          <span className="text-sm text-gray-600">
            Tổng: <span className="font-medium">{filteredAppointmentsCount}</span> lịch
          </span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Available Staff Sidebar Toggle */}
          {viewMode === "day" && selectedDate && filteredAppointments && setShowAvailableStaffSidebar && (
            <Button
              variant={showAvailableStaffSidebar ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAvailableStaffSidebar(!showAvailableStaffSidebar)}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              NV sẵn sàng
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onMaximize}
            className="gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            Phóng to
          </Button>
        </div>
      </div>
    </div>
  );
}
