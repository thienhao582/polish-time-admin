
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex-1 flex items-center justify-end gap-4">
      <LanguageSelector />
      
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <div className="flex flex-col">
              <span className="font-medium">{user?.full_name}</span>
              <span className="text-sm text-gray-500">{user?.email}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;
