import { useState } from "react";
import { Plus, User, Phone, Edit, Trash2, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSalonStore } from "@/stores/useSalonStore";
import { EmployeeForm } from "@/components/EmployeeForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
export function GeneralManagement() {
  const { language } = useLanguage();
  const { employees, deleteEmployee, initializeData } = useSalonStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const translations = {
    vi: {
      title: "Thông tin Chung",
      subtitle: "Quản lý thông tin và trạng thái nhân viên",
      addEmployee: "Thêm nhân viên",
      workingEmployees: "Đang làm việc",
      totalEmployees: "Tổng nhân viên",
      mainStaff: "Thợ chính",
      assistants: "Phụ tá",
      employeeList: "Danh sách nhân viên",
      employee: "Nhân viên",
      role: "Vai trò",
      status: "Trạng thái",
      phone: "Số điện thoại",
      startDate: "Ngày bắt đầu",
      specialties: "Chuyên môn",
      actions: "Thao tác",
      editEmployee: "Chỉnh sửa nhân viên",
      addNewEmployee: "Thêm nhân viên mới",
      deleteConfirm: "Bạn có chắc chắn muốn xóa nhân viên này?",
      roles: {
        "thợ chính": "Thợ chính",
        "phụ tá": "Phụ tá", 
        "lễ tân": "Lễ tân",
        "quản lý": "Quản lý"
      },
      statuses: {
        "đang làm": "Đang làm",
        "đã nghỉ": "Đã nghỉ"
      }
    },
    en: {
      title: "General Information",
      subtitle: "Manage employee information and status",
      addEmployee: "Add Employee",
      workingEmployees: "Currently Working",
      totalEmployees: "Total Employees",
      mainStaff: "Main Staff",
      assistants: "Assistants",
      employeeList: "Employee List",
      employee: "Employee",
      role: "Role",
      status: "Status",
      phone: "Phone",
      startDate: "Start Date",
      specialties: "Specialties",
      actions: "Actions",
      editEmployee: "Edit Employee",
      addNewEmployee: "Add New Employee",
      deleteConfirm: "Are you sure you want to delete this employee?",
      roles: {
        "thợ chính": "Main Staff",
        "phụ tá": "Assistant",
        "lễ tân": "Receptionist",
        "quản lý": "Manager"
      },
      statuses: {
        "đang làm": "Working",
        "đã nghỉ": "Inactive"
      }
    }
  };

  const text = translations[language];

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(text.deleteConfirm)) {
      deleteEmployee(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      "thợ chính": { label: text.roles["thợ chính"], variant: "default" as const },
      "phụ tá": { label: text.roles["phụ tá"], variant: "secondary" as const },
      "lễ tân": { label: text.roles["lễ tân"], variant: "outline" as const },
      "quản lý": { label: text.roles["quản lý"], variant: "destructive" as const },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { 
      label: role, 
      variant: "secondary" as const 
    };
    
    return (
      <Badge variant={config.variant} className={
        role === "thợ chính" ? "bg-pink-100 text-pink-700 hover:bg-pink-100" : ""
      }>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "đang làm" ? "default" : "secondary"} 
             className={status === "đang làm" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
        {text.statuses[status as keyof typeof text.statuses]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{text.title}</h2>
          <p className="text-gray-600 mt-1">{text.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              // Reset in-memory store
              initializeData();
              
              // Clear persisted stores to avoid stale "Anyone" appointments
              try {
                // Clear IndexedDB demo data for appointments and check-ins
                const { indexedDBService } = await import("@/services/indexedDBService");
                await indexedDBService.init();
                await indexedDBService.clearStore('appointments' as any);
                await indexedDBService.clearStore('checkins' as any);
              } catch (e) {
                console.log("IndexedDB clear error (safe to ignore in non-demo):", e);
              }
              
              // Clear localStorage persisted states
              localStorage.removeItem('salon-storage');
              localStorage.removeItem('checkin-storage');
              
              // Reload to apply pristine demo data (without Anyone)
              window.location.reload();
            }}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Reset Demo Data
          </Button>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {text.addEmployee}
          </Button>
        </div>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">{text.workingEmployees}</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.status === "đang làm").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">{text.totalEmployees}</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600">{text.mainStaff}</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.role === "thợ chính").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">{text.assistants}</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.role === "phụ tá").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>{text.employeeList}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{text.employee}</TableHead>
                <TableHead>{text.role}</TableHead>
                <TableHead>{text.status}</TableHead>
                <TableHead>{text.phone}</TableHead>
                <TableHead>{text.startDate}</TableHead>
                <TableHead>{text.specialties}</TableHead>
                <TableHead>{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={(employee as any).avatar} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(employee.role)}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>
                    {(() => {
                      const dateValue = employee.start_date || employee.startDate;
                      const date = new Date(dateValue);
                      return isNaN(date.getTime()) ? "Invalid date" : format(date, "dd/MM/yyyy", { locale: vi });
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {employee.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {employee.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{employee.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? text.editEmployee : text.addNewEmployee}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <EmployeeForm 
              employee={editingEmployee}
              onClose={handleFormClose}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}