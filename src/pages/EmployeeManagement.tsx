
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { GeneralManagement } from "@/components/employee/GeneralManagement";
import { SalaryManagement } from "@/components/employee/SalaryManagement";
import { WorkScheduleManagement } from "@/components/employee/WorkScheduleManagement";

const EmployeeManagement = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const translations = {
    vi: {
      title: "Quản lý Nhân viên",
      subtitle: "Quản lý thông tin, lương và lịch làm việc nhân viên"
    },
    en: {
      title: "Employee Management", 
      subtitle: "Manage employee information, salary and work schedule"
    }
  };

  const text = translations[language];

  // Redirect from /employees to /employees/general
  useEffect(() => {
    if (location.pathname === '/employees') {
      navigate('/employees/general', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{text.title}</h1>
          <p className="text-gray-600 mt-1">{text.subtitle}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="general" replace />} />
            <Route path="general" element={<GeneralManagement />} />
            <Route path="salary" element={<SalaryManagement />} />
            <Route path="schedule" element={<WorkScheduleManagement />} />
          </Routes>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
