
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { GeneralManagement } from "@/components/customer/GeneralManagement";
import { ServiceHistory } from "@/components/customer/ServiceHistory";

const Customers = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const translations = {
    vi: {
      title: "Quản lý Khách hàng",
      subtitle: "Quản lý thông tin và lịch sử dịch vụ của khách hàng"
    },
    en: {
      title: "Customer Management", 
      subtitle: "Manage customer information and service history"
    }
  };

  const text = translations[language];

  // Redirect from /customers to /customers/general
  useEffect(() => {
    if (location.pathname === '/customers') {
      navigate('/customers/general', { replace: true });
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
            <Route path="history" element={<ServiceHistory />} />
          </Routes>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
