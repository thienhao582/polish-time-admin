
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const EmployeeManagement = () => {
  const { employees, deleteEmployee } = useSalonStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      deleteEmployee(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      "thợ chính": { label: "Thợ chính", variant: "default" as const },
      "phụ tá": { label: "Phụ tá", variant: "secondary" as const },
      "lễ tân": { label: "Lễ tân", variant: "outline" as const },
      "quản lý": { label: "Quản lý", variant: "destructive" as const },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
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
        {status === "đang làm" ? "Đang làm" : "Đã nghỉ"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Nhân viên</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin và trạng thái nhân viên</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Đang làm việc</p>
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
                <p className="text-sm text-gray-600">Tổng nhân viên</p>
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
                <p className="text-sm text-gray-600">Thợ chính</p>
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
                <p className="text-sm text-gray-600">Phụ tá</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.role === "phụ tá").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Chuyên môn</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(employee.role)}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{format(new Date(employee.startDate), "dd/MM/yyyy", { locale: vi })}</TableCell>
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
              {editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
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
};

export default EmployeeManagement;
