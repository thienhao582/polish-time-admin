
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar";
import { Calendar, Users, Scissors, DollarSign, Clock, Settings, BarChart3, Receipt, UserCog, ChevronRight, User, Calculator, CalendarDays, UserIcon, History, ClipboardList, LogIn } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckInItem {
  id: string;
  customerNumber: string;
  customerName: string;
  status: 'Walk In' | 'Appointment';
  checkInTime: string;
  tags: string[];
  services: string[];
}

const AppSidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { state } = useSidebar();
  const { t, language } = useLanguage();
  const isCollapsed = state === "collapsed";
  
  const isEmployeeSectionActive = location.pathname.startsWith('/employees');
  const isCustomerSectionActive = location.pathname.startsWith('/customers');

  // Mock check-in data
  const [checkInItems] = useState<CheckInItem[]>([
    {
      id: "1",
      customerNumber: "3760",
      customerName: "Misteri Crowder",
      status: "Walk In",
      checkInTime: "10:23 AM",
      tags: ["NEW"],
      services: ["Haircut", "Wash"]
    },
    {
      id: "2", 
      customerNumber: "3141",
      customerName: "Sophie",
      status: "Walk In",
      checkInTime: "09:08 AM",
      tags: ["VIP"],
      services: ["Color", "Style"]
    },
    {
      id: "3",
      customerNumber: "2895",
      customerName: "John Doe",
      status: "Appointment",
      checkInTime: "11:15 AM",
      tags: ["REGULAR"],
      services: ["Trim"]
    }
  ]);

  const getTagVariant = (tag: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (tag) {
      case "NEW":
        return "default";
      case "VIP":
        return "destructive";
      case "REGULAR":
        return "secondary";
      default:
        return "outline";
    }
  };

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
      titleKey: "sidebar.tasks",
      url: "/tasks",
      icon: ClipboardList,
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
          {!isCollapsed && <span className="font-bold text-lg">Nails Salon</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* First 3 items: Dashboard, Appointments, and Tasks */}
              {filteredMenuItems.slice(0, 3).map((item) => (
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

              {/* Check-in Section */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/checkin"}
                >
                  <Link to="/checkin" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <span>Check In</span>
                        {checkInItems.length > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {checkInItems.length}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
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

              {/* Remaining menu items (skip first 3 items and customers) */}
              {filteredMenuItems.slice(3).map((item) => (
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
