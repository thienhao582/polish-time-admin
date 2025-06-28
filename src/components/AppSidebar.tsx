import {
  LayoutDashboard,
  Calendar,
  User,
  Settings,
  Users,
  BarChart,
  Clock,
  Scissors,
  Receipt
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Lịch hẹn", href: "/appointments", icon: Calendar },
  { name: "Khách hàng", href: "/customers", icon: Users },
  { name: "Dịch vụ", href: "/services", icon: Scissors },
  { name: "Hóa đơn", href: "/invoices", icon: Receipt },
  { name: "Nhân viên", href: "/employees", icon: User },
  { name: "Chấm công", href: "/timetracking", icon: Clock },
  { name: "Báo cáo", href: "/reports", icon: BarChart },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

const AppSidebar = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-6 py-3">
        <h1 className="text-lg font-bold">Quản lý Tiệm Nail</h1>
      </div>
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                    isActive ? "bg-gray-100 font-medium text-gray-900" : ""
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t py-4 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Nail Salon
        </p>
      </div>
    </div>
  );
};

export default AppSidebar;
