import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppointmentCalendarHeaderProps {
  viewMode: "month" | "week" | "day";
  setViewMode: (mode: "month" | "week" | "day") => void;
  selectedDate: Date;
  handleDateNavigation: (direction: "prev" | "next") => void;
  setSelectedDate: (date: Date) => void;
}

export function AppointmentCalendarHeader({
  viewMode,
  setViewMode,
  selectedDate,
  handleDateNavigation,
  setSelectedDate
}: AppointmentCalendarHeaderProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          onClick={() => setViewMode("month")}
          className={viewMode === "month" ? "bg-pink-600 hover:bg-pink-700" : ""}
        >
          {t('appointments.month')}
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          onClick={() => setViewMode("week")}
          className={viewMode === "week" ? "bg-pink-600 hover:bg-pink-700" : ""}
        >
          {t('appointments.week')}
        </Button>
        <Button
          variant={viewMode === "day" ? "default" : "outline"}
          onClick={() => setViewMode("day")}
          className={viewMode === "day" ? "bg-pink-600 hover:bg-pink-700" : ""}
        >
          {t('appointments.day')}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleDateNavigation("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium min-w-[200px] text-center">
            {viewMode === "month" && format(selectedDate, "MMMM yyyy", { locale: vi })}
            {viewMode === "week" && `Tuần ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "dd/MM")} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "dd/MM/yyyy")}`}
            {viewMode === "day" && format(selectedDate, "dd MMMM yyyy", { locale: vi })}
          </span>
          <Button variant="outline" size="sm" onClick={() => handleDateNavigation("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
          {t('appointments.today')}
        </Button>
      </div>
    </div>
  );
}