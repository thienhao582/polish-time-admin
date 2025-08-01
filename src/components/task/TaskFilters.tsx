import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  X,
  Scissors,
  Palette,
  Sparkles
} from "lucide-react";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  serviceFilter: string;
  onServiceChange: (service: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const TaskFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  serviceFilter,
  onServiceChange,
  onClearFilters,
  activeFiltersCount
}: TaskFiltersProps) => {
  const serviceTypes = [
    { value: "all", label: "Tất cả dịch vụ", icon: null },
    { value: "MANI", label: "Manicure", icon: Scissors },
    { value: "PEDI", label: "Pedicure", icon: Sparkles },
    { value: "BGS", label: "Bôi gel set", icon: Palette },
    { value: "OTHER", label: "Khác", icon: null }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search and basic filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-[280px]"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="available">🟢 Rảnh</SelectItem>
              <SelectItem value="busy">🔴 Đang bận</SelectItem>
              <SelectItem value="finished">🔵 Hoàn thành</SelectItem>
              <SelectItem value="break">🟡 Nghỉ giải lao</SelectItem>
            </SelectContent>
          </Select>

          <Select value={serviceFilter} onValueChange={onServiceChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Sparkles className="h-4 w-4" />
              <SelectValue placeholder="Dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  <div className="flex items-center gap-2">
                    {service.icon && <service.icon className="h-4 w-4" />}
                    {service.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear filters button */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Xóa bộ lọc ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Tìm kiếm: "{searchQuery}"
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onSearchChange("")}
              />
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Trạng thái: {statusFilter === "available" ? "Rảnh" : 
                           statusFilter === "busy" ? "Đang bận" : 
                           statusFilter === "finished" ? "Hoàn thành" : "Nghỉ giải lao"}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onStatusChange("all")}
              />
            </Badge>
          )}
          {serviceFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Dịch vụ: {serviceTypes.find(s => s.value === serviceFilter)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onServiceChange("all")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};