
import React, { createContext, useContext, useState } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    'appointments.title': 'Quản lý lịch hẹn',
    'appointments.subtitle': 'Xem và quản lý tất cả các lịch hẹn',
    'appointments.add': 'Thêm lịch hẹn',
    'appointments.manage_staff': 'Quản lý nhân viên',
    'appointments.display_by': 'Hiển thị theo',
    'appointments.customer_name': 'Tên khách hàng',
    'appointments.staff_name': 'Tên nhân viên',
    'appointments.filter_staff': 'Lọc nhân viên',
    'appointments.total': 'Tổng',
    'appointments.appointments': 'lịch hẹn',
    'appointments.maximize': 'Phóng to',
    'appointments.show_full_view': 'Hiển thị đầy đủ',
    'day.monday': 'T2',
    'day.tuesday': 'T3',
    'day.wednesday': 'T4',
    'day.thursday': 'T5',
    'day.friday': 'T6',
    'day.saturday': 'T7',
    'day.sunday': 'CN',
    'day.mon': 'T2',
    'day.tue': 'T3',
    'day.wed': 'T4',
    'day.thu': 'T5',
    'day.fri': 'T6',
    'day.sat': 'T7',
    'day.sun': 'CN'
  },
  en: {
    'appointments.title': 'Appointment Management',
    'appointments.subtitle': 'View and manage all appointments',
    'appointments.add': 'Add Appointment',
    'appointments.manage_staff': 'Manage Staff',
    'appointments.display_by': 'Display by',
    'appointments.customer_name': 'Customer Name',
    'appointments.staff_name': 'Staff Name',
    'appointments.filter_staff': 'Filter Staff',
    'appointments.total': 'Total',
    'appointments.appointments': 'appointments',
    'appointments.maximize': 'Maximize',
    'appointments.show_full_view': 'Show Full View',
    'day.monday': 'Mon',
    'day.tuesday': 'Tue',
    'day.wednesday': 'Wed',
    'day.thursday': 'Thu',
    'day.friday': 'Fri',
    'day.saturday': 'Sat',
    'day.sunday': 'Sun',
    'day.mon': 'Mon',
    'day.tue': 'Tue',
    'day.wed': 'Wed',
    'day.thu': 'Thu',
    'day.fri': 'Fri',
    'day.sat': 'Sat',
    'day.sun': 'Sun'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['vi']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
