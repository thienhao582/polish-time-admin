
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Calendar, Users, Scissors, DollarSign, Clock, Settings, BarChart3, Receipt, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AppSidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: BarChart3,
    },
    {
      title: "Lịch hẹn",
      url: "/appointments",
      icon: Calendar,
    },
    {
      title: "Khách hàng",
      url: "/customers",
      icon: Users,
    },
    {
      title: "Dịch vụ",
      url: "/services",
      icon: Scissors,
      requiresPermission: "manage_services"
    },
    {
      title: "Hóa đơn",
      url: "/invoices",
      icon: Receipt,
    },
    {
      title: "Nhân viên",
      url: "/employees",
      icon: UserCog,
      requiresPermission: "manage_employees"
    },
    {
      title: "Chấm công",
      url: "/timetracking",
      icon: Clock,
    },
    {
      title: "Quản lý tài khoản",
      url: "/accounts",
      icon: UserCog,
      requiresPermission: "create_user"
    },
    {
      title: "Cài đặt",
      url: "/settings",
      icon: Settings,
      requiresPermission: "manage_settings"
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.requiresPermission || hasPermission(item.requiresPermission)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Scissors className="h-6 w-6 text-pink-600" />
          <span className="font-bold text-lg">Nail Salon</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-gray-500">
          © 2024 Nail Salon Management
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
