
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar";
import { Calendar, Users, Scissors, DollarSign, Clock, Settings, BarChart3, Receipt, UserCog, ChevronRight, User, Calculator, CalendarDays, UserIcon, History } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const AppSidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { state } = useSidebar();
  const { t, language } = useLanguage();
  const isCollapsed = state === "collapsed";
  
  const isEmployeeSectionActive = location.pathname.startsWith('/employees');
  const isCustomerSectionActive = location.pathname.startsWith('/customers');

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

  const customerSubMenuItems = [
    {
      titleKey: "customer.general",
      title: { vi: "Thông tin chung", en: "General Information" },
      url: "/customers/general",
      icon: UserIcon,
    },
    {
      titleKey: "customer.history",
      title: { vi: "Lịch sử làm nail", en: "Service History" },
      url: "/customers/history",
      icon: History,
    }
  ];

  // Employee submenu items definition
  const employeeSubMenuItems = [
    {
      titleKey: "employee.general",
      title: { vi: "Thông tin chung", en: "General Information" },
      url: "/employees/general",
      icon: User,
    },
    {
      titleKey: "employee.salary",
      title: { vi: "Tính lương", en: "Salary Management" },
      url: "/employees/salary",
      icon: Calculator,
    },
    {
      titleKey: "employee.schedule", 
      title: { vi: "Lịch làm việc", en: "Work Schedule" },
      url: "/employees/schedule",
      icon: CalendarDays,
    }
  ];

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
              {/* First 2 items: Dashboard and Appointments */}
              {filteredMenuItems.slice(0, 2).map((item) => (
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
              
              {/* Customer Management Accordion - Position 3 */}
              <Collapsible defaultOpen={isCustomerSectionActive}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {!isCollapsed && <span>{t("sidebar.customers")}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {customerSubMenuItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.titleKey}>
                          <SidebarMenuSubButton 
                            asChild
                            isActive={location.pathname === subItem.url}
                          >
                            <Link to={subItem.url} className="flex items-center gap-2">
                              <subItem.icon className="h-4 w-4" />
                              <span>{subItem.title[language]}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Employee Management Accordion - Position 4 */}
              {hasPermission("manage_employees") && (
                <Collapsible defaultOpen={isEmployeeSectionActive}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          {!isCollapsed && <span>{t("sidebar.employees")}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {employeeSubMenuItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.titleKey}>
                            <SidebarMenuSubButton 
                              asChild
                              isActive={location.pathname === subItem.url}
                            >
                              <Link to={subItem.url} className="flex items-center gap-2">
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title[language]}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Remaining menu items (skip customers which is now position 3) */}
              {filteredMenuItems.slice(2).map((item) => (
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
