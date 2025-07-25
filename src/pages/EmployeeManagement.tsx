
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { GeneralManagement } from "@/components/employee/GeneralManagement";
import { SalaryManagement } from "@/components/employee/SalaryManagement";

const EmployeeManagement = () => {
  const { language } = useLanguage();

  const translations = {
    vi: {
      title: "Quản lý Nhân viên",
      subtitle: "Quản lý thông tin và lương nhân viên",
      general: "Thông tin chung",
      salary: "Tính lương"
    },
    en: {
      title: "Employee Management",
      subtitle: "Manage employee information and salary",
      general: "General",
      salary: "Salary"
    }
  };

  const text = translations[language];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{text.title}</h1>
          <p className="text-gray-600 mt-1">{text.subtitle}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">{text.general}</TabsTrigger>
              <TabsTrigger value="salary">{text.salary}</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-6">
              <GeneralManagement />
            </TabsContent>
            <TabsContent value="salary" className="p-6">
              <SalaryManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
