
import { Bell, Search, User, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Chủ tiệm';
      case 'employee': return 'Nhân viên';
      case 'cashier': return 'Thu ngân';
      default: return 'Người dùng';
    }
  };

  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-10 w-80 bg-gray-50 border-gray-200"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-pink-600" />
              </div>
              <div className="text-sm text-left">
                <p className="font-medium text-gray-800">{user?.full_name}</p>
                <p className="text-gray-500 text-xs">{getRoleLabel(user?.role || '')}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
