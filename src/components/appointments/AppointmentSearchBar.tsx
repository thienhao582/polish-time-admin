
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AppointmentSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AppointmentSearchBar({ searchQuery, setSearchQuery }: AppointmentSearchBarProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên khách hàng hoặc nhân viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
