
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserAccount {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'employee' | 'cashier';
  is_active: boolean;
  pin_code: string;
  created_at: string;
}

const AccountManagement = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'employee' as 'owner' | 'employee' | 'cashier',
    pin_code: '1234',
    is_active: true
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài khoản",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAccount) {
        // Update existing account
        const { error } = await supabase
          .from('users')
          .update(formData)
          .eq('id', editingAccount.id);
        
        if (error) throw error;
        
        toast({
          title: "Thành công",
          description: "Đã cập nhật tài khoản"
        });
      } else {
        // Create new account
        const { error } = await supabase
          .from('users')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Thành công",
          description: "Đã tạo tài khoản mới"
        });
      }
      
      await fetchAccounts();
      resetForm();
      setIsCreateDialogOpen(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: editingAccount ? "Không thể cập nhật tài khoản" : "Không thể tạo tài khoản",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã xóa tài khoản"
      });
      
      await fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài khoản",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`
      });
      
      await fetchAccounts();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi trạng thái tài khoản",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'employee',
      pin_code: '1234',
      is_active: true
    });
  };

  const openEditDialog = (account: UserAccount) => {
    setEditingAccount(account);
    setFormData({
      email: account.email,
      full_name: account.full_name,
      role: account.role,
      pin_code: account.pin_code,
      is_active: account.is_active
    });
    setIsCreateDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'employee': return 'secondary';
      case 'cashier': return 'outline';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner': return 'Chủ salon';
      case 'employee': return 'Nhân viên';
      case 'cashier': return 'Thu ngân';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quản lý Tài khoản</CardTitle>
              <CardDescription>
                Quản lý tài khoản đăng nhập cho nhân viên và quản lý
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingAccount(null); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo tài khoản
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAccount ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}</DialogTitle>
                  <DialogDescription>
                    {editingAccount ? 'Cập nhật thông tin tài khoản' : 'Tạo tài khoản đăng nhập cho nhân viên'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Họ và tên</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Vai trò</Label>
                    <Select value={formData.role} onValueChange={(value: 'owner' | 'employee' | 'cashier') => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Chủ salon</SelectItem>
                        <SelectItem value="employee">Nhân viên</SelectItem>
                        <SelectItem value="cashier">Thu ngân</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pin_code">Mã PIN (4 số)</Label>
                    <Input
                      id="pin_code"
                      value={formData.pin_code}
                      onChange={(e) => setFormData({...formData, pin_code: e.target.value})}
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active">Tài khoản hoạt động</Label>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button type="submit">
                      {editingAccount ? 'Cập nhật' : 'Tạo tài khoản'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.full_name}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(account.role)}>
                      {getRoleText(account.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span className="font-mono">{account.pin_code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={account.is_active}
                        onCheckedChange={() => handleToggleStatus(account.id, account.is_active)}
                      />
                      <span className={account.is_active ? 'text-green-600' : 'text-red-600'}>
                        {account.is_active ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(account.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(account)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
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
          
          {accounts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Chưa có tài khoản nào. Hãy tạo tài khoản đầu tiên.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountManagement;
