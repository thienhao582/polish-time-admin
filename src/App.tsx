
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import TaskManagement from "./pages/TaskManagement";
import Customers from "./pages/Customers";
import Services from "./pages/Services";
import EmployeeManagement from "./pages/EmployeeManagement";
import TimeTracking from "./pages/TimeTracking";
import Settings from "./pages/Settings";
import AccountManagement from "./pages/AccountManagement";
import NotFound from "./pages/NotFound";
import Invoices from "./pages/Invoices";
import CampaignManagement from "./pages/CampaignManagement";
import Login from "./pages/Login";
import CheckIn from "./pages/CheckIn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="tasks" element={<TaskManagement />} />
              <Route path="checkin" element={<CheckIn />} />
              <Route path="customers/*" element={<Customers />} />
              <Route path="services" element={
                <ProtectedRoute requiredPermission="manage_services">
                  <Services />
                </ProtectedRoute>
              } />
              <Route path="invoices" element={<Invoices />} />
              <Route path="campaigns" element={<CampaignManagement />} />
              <Route path="employees/*" element={
                <ProtectedRoute requiredPermission="manage_employees">
                  <EmployeeManagement />
                </ProtectedRoute>
              } />
              <Route path="timetracking" element={<TimeTracking />} />
              <Route path="accounts" element={
                <ProtectedRoute requiredPermission="create_user">
                  <AccountManagement />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute requiredPermission="manage_settings">
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
