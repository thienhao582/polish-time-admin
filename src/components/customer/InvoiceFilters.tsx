import { useState } from "react";
import { Search, Calendar, User, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSalonStore } from "@/stores/useSalonStore";

export interface InvoiceFiltersState {
  searchTerm: string;
  selectedServiceId: string;
  selectedPeriod: string;
}

interface InvoiceFiltersProps {
  filters: InvoiceFiltersState;
  onFiltersChange: (filters: InvoiceFiltersState) => void;
}

export const InvoiceFilters = ({ filters, onFiltersChange }: InvoiceFiltersProps) => {
  const { language } = useLanguage();
  const { services, employees } = useSalonStore();
  
  const translations = {
    vi: {
      search_placeholder: "Tìm kiếm theo số hóa đơn, dịch vụ, nhân viên...",
      all_services: "Tất cả dịch vụ",
      all_periods: "Tất cả thời gian",
      last_week: "7 ngày qua",
      last_month: "30 ngày qua",
      last_3_months: "3 tháng qua",
      last_6_months: "6 tháng qua",
      last_year: "1 năm qua"
    },
    en: {
      search_placeholder: "Search by invoice number, service, employee...",
      all_services: "All services",
      all_periods: "All time",
      last_week: "Last 7 days",
      last_month: "Last 30 days",
      last_3_months: "Last 3 months",
      last_6_months: "Last 6 months",
      last_year: "Last year"
    }
  };

  const text = translations[language];

  const handleFilterChange = (key: keyof InvoiceFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={text.search_placeholder}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Service Filter */}
          <Select 
            value={filters.selectedServiceId} 
            onValueChange={(value) => handleFilterChange('selectedServiceId', value)}
          >
            <SelectTrigger>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder={text.all_services} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{text.all_services}</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Time Period Filter */}
          <Select 
            value={filters.selectedPeriod} 
            onValueChange={(value) => handleFilterChange('selectedPeriod', value)}
          >
            <SelectTrigger>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder={text.all_periods} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{text.all_periods}</SelectItem>
              <SelectItem value="7">{text.last_week}</SelectItem>
              <SelectItem value="30">{text.last_month}</SelectItem>
              <SelectItem value="90">{text.last_3_months}</SelectItem>
              <SelectItem value="180">{text.last_6_months}</SelectItem>
              <SelectItem value="365">{text.last_year}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};