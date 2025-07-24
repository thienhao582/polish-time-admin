
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Tiệm Nail
          </h1>
          <p className="text-gray-600">
            Hệ thống quản lý chuyên nghiệp
          </p>
        </div>

        {/* Demo Mode Toggle */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="demo-mode" className="text-sm font-medium text-yellow-800">
                Demo Flow
              </Label>
              <p className="text-xs text-yellow-600 mt-1">
                {isDemoMode ? 'Sử dụng dữ liệu demo (admin@example.com / 1234)' : 'Kết nối với Supabase'}
              </p>
            </div>
            <Switch
              id="demo-mode"
              checked={isDemoMode}
              onCheckedChange={toggleDemoMode}
            />
          </div>
        </div>
        
        <LoginForm 
          onLoginSuccess={() => navigate('/')} 
        />
      </div>
    </div>
  );
};

export default Login;
