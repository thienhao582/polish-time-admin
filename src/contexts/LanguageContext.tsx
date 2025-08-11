import React, { createContext, useContext, useState } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    // Sidebar menu
    'sidebar.dashboard': 'Dashboard',
    'sidebar.appointments': 'Lịch hẹn',
    'sidebar.tasks': 'Quản lý công việc',
    'sidebar.customers': 'Khách hàng',
    'sidebar.services': 'Dịch vụ',
    'sidebar.invoices': 'Hóa đơn',
    'sidebar.employees': 'Nhân viên',
    'sidebar.timetracking': 'Chấm công',
    'sidebar.accounts': 'Quản lý tài khoản',
    'sidebar.settings': 'Cài đặt',
    
    // Login page
    'login.title': 'Quản lý Tiệm Nail',
    'login.subtitle': 'Hệ thống quản lý chuyên nghiệp',
    'login.form.title': 'Đăng nhập',
    'login.form.subtitle': 'Nhập email và mã PIN để truy cập hệ thống',
    'login.loading': 'Đang kiểm tra phiên đăng nhập...',
    'login.email': 'Email',
    'login.pin': 'Mã PIN (4 số)',
    'login.email_placeholder': 'Nhập email của bạn',
    'login.button': 'Đăng nhập',
    'login.button_loading': 'Đang đăng nhập...',
    'login.success': 'Đăng nhập thành công!',
    'login.demo_success': 'Đăng nhập demo thành công',

    // Dashboard
    'dashboard.title': 'Tổng quan',
    'dashboard.subtitle': 'Chào mừng trở lại! Đây là tổng quan về tiệm nail của bạn.',
    'dashboard.total_customers': 'Tổng khách hàng',
    'dashboard.today_appointments': 'Lịch hẹn hôm nay',
    'dashboard.revenue_30_days': 'Doanh thu 30 ngày',
    'dashboard.employees': 'Nhân viên',
    'dashboard.vs_last_month': 'so với tháng trước',
    'dashboard.recent_appointments': 'Lịch hẹn gần đây',
    'dashboard.quick_stats': 'Thống kê nhanh',
    'dashboard.most_popular_service': 'Dịch vụ phổ biến nhất',
    'dashboard.average_time': 'Thời gian trung bình',
    'dashboard.returning_customers': 'Khách hàng quay lại',
    'dashboard.average_rating': 'Đánh giá trung bình',

    // Customers
    'customers.title': 'Quản lý Khách Hàng',
    'customers.general-info': 'Thông tin chung',
    'customers.subtitle': 'Theo dõi thông tin, tích điểm và gửi SMS khách hàng',
    'customers.add_customer': 'Thêm khách hàng',
    'customers.total_customers': 'Tổng khách hàng',
    'customers.members': 'Thành viên',
    'customers.new_customers': 'Khách mới',
    'customers.search_placeholder': 'Tìm kiếm theo tên, SĐT, email...',
    'customers.filter_level': 'Lọc theo cấp độ',
    'customers.all_levels': 'Tất cả cấp độ',
    'customers.new': 'Khách mới',
    'customers.member': 'Thành viên',
    'customers.selected_customers': 'Đã chọn {count} khách hàng',
    'customers.send_bulk_sms': 'Gửi SMS hàng loạt',
    'customers.customer_list': 'Danh sách khách hàng',
    'customers.customer': 'Khách hàng',
    'customers.contact': 'Liên hệ',
    'customers.birthday': 'Sinh nhật',
    'customers.points': 'Điểm tích lũy',
    'customers.level': 'Cấp độ',
    'customers.last_visit': 'Lần cuối',
    'customers.total_spent': 'Tổng chi tiêu',
    'customers.actions': 'Thao tác',
    'customers.visits_count': '{count} lần đến',
    'customers.no_birthday': 'Chưa có',
    'customers.no_last_visit': 'Chưa có',
    
    // Appointments
    'appointments.title': 'Quản lý lịch hẹn',
    'appointments.subtitle': 'Xem và quản lý tất cả các lịch hẹn',
    'appointments.add': 'Thêm lịch hẹn',
    'appointments.manage_staff': 'Quản lý nhân viên',
    'appointments.display_by': 'Hiển thị theo',
    'appointments.customer_name': 'Tên khách hàng',
    'appointments.staff_name': 'Tên nhân viên',
    'appointments.both': 'Cả hai',
    'appointments.filter_staff': 'Lọc nhân viên',
    'appointments.total': 'Tổng',
    'appointments.appointments': 'lịch hẹn',
    'appointments.maximize': 'Phóng to',
    'appointments.show_full_view': 'Hiển thị đầy đủ',
    'appointments.select_staff': 'Chọn nhân viên',
    'appointments.clear_all': 'Xóa tất cả',
    'appointments.search_placeholder': 'Tìm kiếm theo tên khách hàng hoặc nhân viên...',
    'appointments.month': 'Tháng',
    'appointments.week': 'Tuần',
    'appointments.day': 'Ngày',
    'appointments.today': 'Hôm nay',
    
    // Days
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
    // Sidebar menu
    'sidebar.dashboard': 'Dashboard',
    'sidebar.appointments': 'Appointments',
    'sidebar.tasks': 'Task Management',
    'sidebar.customers': 'Customers',
    'sidebar.services': 'Services',
    'sidebar.invoices': 'Invoices',
    'sidebar.employees': 'Employees',
    'sidebar.timetracking': 'Time Tracking',
    'sidebar.accounts': 'Account Management',
    'sidebar.settings': 'Settings',
    
    // Login page
    'login.title': 'Nail Salon Management',
    'login.subtitle': 'Professional management system',
    'login.form.title': 'Login',
    'login.form.subtitle': 'Enter email and PIN to access the system',
    'login.loading': 'Checking login session...',
    'login.email': 'Email',
    'login.pin': 'PIN Code (4 digits)',
    'login.email_placeholder': 'Enter your email',
    'login.button': 'Login',
    'login.button_loading': 'Logging in...',
    'login.success': 'Login successful!',
    'login.demo_success': 'Demo login successful',

    // Dashboard
    'dashboard.title': 'Overview',
    'dashboard.subtitle': 'Welcome back! Here\'s an overview of your nail salon.',
    'dashboard.total_customers': 'Total Customers',
    'dashboard.today_appointments': 'Today\'s Appointments',
    'dashboard.revenue_30_days': '30-Day Revenue',
    'dashboard.employees': 'Employees',
    'dashboard.vs_last_month': 'vs last month',
    'dashboard.recent_appointments': 'Recent Appointments',
    'dashboard.quick_stats': 'Quick Stats',
    'dashboard.most_popular_service': 'Most Popular Service',
    'dashboard.average_time': 'Average Duration',
    'dashboard.returning_customers': 'Returning Customers',
    'dashboard.average_rating': 'Average Rating',

    // Customers
    'customers.title': 'Customer Management',
    'customers.general-info': 'General Information',
    'customers.subtitle': 'Track information, loyalty points and send SMS to customers',
    'customers.add_customer': 'Add Customer',
    'customers.total_customers': 'Total Customers',
    'customers.members': 'Members',
    'customers.new_customers': 'New Customers',
    'customers.search_placeholder': 'Search by name, phone, email...',
    'customers.filter_level': 'Filter by level',
    'customers.all_levels': 'All Levels',
    'customers.new': 'New',
    'customers.member': 'Member',
    'customers.selected_customers': 'Selected {count} customers',
    'customers.send_bulk_sms': 'Send Bulk SMS',
    'customers.customer_list': 'Customer List',
    'customers.customer': 'Customer',
    'customers.contact': 'Contact',
    'customers.birthday': 'Birthday',
    'customers.points': 'Points',
    'customers.level': 'Level',
    'customers.last_visit': 'Last Visit',
    'customers.total_spent': 'Total Spent',
    'customers.actions': 'Actions',
    'customers.visits_count': '{count} visits',
    'customers.no_birthday': 'No data',
    'customers.no_last_visit': 'No data',
    
    // Appointments
    'appointments.title': 'Appointment Management',
    'appointments.subtitle': 'View and manage all appointments',
    'appointments.add': 'Add Appointment',
    'appointments.manage_staff': 'Manage Staff',
    'appointments.display_by': 'Display by',
    'appointments.customer_name': 'Customer Name',
    'appointments.staff_name': 'Staff Name',
    'appointments.both': 'Both',
    'appointments.filter_staff': 'Filter Staff',
    'appointments.total': 'Total',
    'appointments.appointments': 'appointments',
    'appointments.maximize': 'Maximize',
    'appointments.show_full_view': 'Show Full View',
    'appointments.select_staff': 'Select Staff',
    'appointments.clear_all': 'Clear All',
    'appointments.search_placeholder': 'Search by customer or staff name...',
    'appointments.month': 'Month',
    'appointments.week': 'Week',
    'appointments.day': 'Day',
    'appointments.today': 'Today',
    
    // Days
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
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize from localStorage if available, otherwise default to 'en'
    const savedLanguage = localStorage.getItem('nail_salon_language') as Language;
    return savedLanguage || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('nail_salon_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['vi']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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