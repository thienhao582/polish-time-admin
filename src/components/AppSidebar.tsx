
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Calendar, Users, Scissors, DollarSign, Clock, Settings, BarChart3, Receipt, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const AppSidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { state } = useSidebar();
  const { t } = useLanguage();
  const isCollapsed = state === "collapsed";

  const menuItems = [
    {
      titleKey: "sidebar.dashboard",
      url: "/",
      icon: BarChart3,
    },
    {
      titleKey: "sidebar.appointments",
      url: "/appointments",
      icon: Calendar,
    },
    {
      titleKey: "sidebar.customers",
      url: "/customers",
      icon: Users,
    },
    {
      titleKey: "sidebar.services",
      url: "/services",
      icon: Scissors,
      requiresPermission: "manage_services"
    },
    {
      titleKey: "sidebar.invoices",
      url: "/invoices",
      icon: Receipt,
    },
    {
      titleKey: "sidebar.employees",
      url: "/employees",
      icon: UserCog,
      requiresPermission: "manage_employees"
    },
    {
      titleKey: "sidebar.timetracking",
      url: "/timetracking",
      icon: Clock,
    },
    {
      titleKey: "sidebar.accounts",
      url: "/accounts",
      icon: UserCog,
      requiresPermission: "create_user"
    },
    {
      titleKey: "sidebar.settings",
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
          {!isCollapsed && <span className="font-bold text-lg">Nail Salon</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{t(item.titleKey)}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!isCollapsed && (
          <div className="px-4 py-2 text-xs text-gray-500">
            © 2025 Nail Salon Management
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
