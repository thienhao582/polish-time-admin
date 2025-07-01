
import { useState } from "react";
import { Filter, Users, User, Maximize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useSalonStore } from "@/stores/useSalonStore";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppointmentFiltersProps {
  displayMode: "customer" | "staff";
  setDisplayMode: (mode: "customer" | "staff") => void;
  selectedStaffIds: string[];
  setSelectedStaffIds: (ids: string[]) => void;
  filteredAppointmentsCount: number;
  onMaximize: () => void;
}

export function AppointmentFilters({
  displayMode,
  setDisplayMode,
  selectedStaffIds,
  setSelectedStaffIds,
  filteredAppointmentsCount,
  onMaximize
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Display Mode */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('appointments.display_by')}</span>
              <Select value={displayMode} onValueChange={(value: "customer" | "staff") => setDisplayMode(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t('appointments.customer_name')}
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('appointments.staff_name')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Staff Filter */}
            <Popover open={isStaffFilterOpen} onOpenChange={setIsStaffFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {t('appointments.filter_staff')}
                  {selectedStaffIds.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
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
                        Xóa tất cả
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {employees.map((employee) => (
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

            {/* Appointment Count */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{t('appointments.total')}</span>
              <Badge variant="outline" className="font-medium">
                {filteredAppointmentsCount} {t('appointments.appointments')}
              </Badge>
            </div>
          </div>

          {/* Maximize Button */}
          <Button variant="outline" size="sm" onClick={onMaximize} className="gap-2">
            <Maximize2 className="w-4 h-4" />
            {t('appointments.maximize')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
