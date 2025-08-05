
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import { SidebarToggle } from "@/components/SidebarToggle";

const AdminLayoutContent = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <div className="relative z-50">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b bg-white">
            <SidebarTrigger />
            <SidebarToggle />
            <Header />
          </div>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const AdminLayout = () => {
  return <AdminLayoutContent />;
};

export default AdminLayout;
