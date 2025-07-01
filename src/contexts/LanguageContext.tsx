
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    // Appointments page
    'appointments.title': 'Quản lý Lịch Hẹn',
    'appointments.subtitle': 'Theo dõi và quản lý tất cả lịch hẹn',
    'appointments.add': 'Thêm lịch hẹn',
    'appointments.manage_staff': 'Quản lý nhân viên',
    'appointments.search_placeholder': 'Tìm kiếm lịch hẹn...',
    'appointments.display_by': 'Hiển thị theo:',
    'appointments.customer_name': 'Tên khách',
    'appointments.staff_name': 'Tên nhân viên',
    'appointments.filter_staff': 'Lọc nhân viên',
    'appointments.total': 'Tổng:',
    'appointments.appointments': 'lịch hẹn',
    'appointments.maximize': 'Phóng to',
    'appointments.month': 'Tháng',
    'appointments.week': 'Tuần',
    'appointments.day': 'Ngày',
    // Days
    'day.monday': 'Thứ 2',
    'day.tuesday': 'Thứ 3',
    'day.wednesday': 'Thứ 4',
    'day.thursday': 'Thứ 5',
    'day.friday': 'Thứ 6',
    'day.saturday': 'Thứ 7',
    'day.sunday': 'Chủ nhật',
    // Short days
    'day.mon': 'T2',
    'day.tue': 'T3',
    'day.wed': 'T4',
    'day.thu': 'T5',
    'day.fri': 'T6',
    'day.sat': 'T7',
    'day.sun': 'CN',
  },
  en: {
    // Appointments page
    'appointments.title': 'Appointment Management',
    'appointments.subtitle': 'Track and manage all appointments',
    'appointments.add': 'Add appointment',
    'appointments.manage_staff': 'Manage staff',
    'appointments.search_placeholder': 'Search appointments...',
    'appointments.display_by': 'Display by:',
    'appointments.customer_name': 'Customer name',
    'appointments.staff_name': 'Staff name',
    'appointments.filter_staff': 'Filter staff',
    'appointments.total': 'Total:',
    'appointments.appointments': 'appointments',
    'appointments.maximize': 'Maximize',
    'appointments.month': 'Month',
    'appointments.week': 'Week',
    'appointments.day': 'Day',
    // Days
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    'day.sunday': 'Sunday',
    // Short days
    'day.mon': 'Mon',
    'day.tue': 'Tue',
    'day.wed': 'Wed',
    'day.thu': 'Thu',
    'day.fri': 'Fri',
    'day.sat': 'Sat',
    'day.sun': 'Sun',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
