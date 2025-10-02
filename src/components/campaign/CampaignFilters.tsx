import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface CampaignFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function CampaignFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: CampaignFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Label htmlFor="search" className="sr-only">Tìm kiếm</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Tìm kiếm theo tên campaign..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="sm:w-48">
        <Label htmlFor="status-filter" className="sr-only">Lọc theo trạng thái</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
            <SelectItem value="active">Đang diễn ra</SelectItem>
            <SelectItem value="expired">Đã kết thúc</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
