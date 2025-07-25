
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4 relative">
      {/* Demo Mode Toggle - Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200">
        <Label htmlFor="demo-mode" className="text-xs font-medium text-gray-700">
          Demo Flow
        </Label>
        <Switch
          id="demo-mode"
          checked={isDemoMode}
          onCheckedChange={toggleDemoMode}
          className="scale-75"
        />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Tiệm Nail
          </h1>
          <p className="text-gray-600">
            Hệ thống quản lý chuyên nghiệp
          </p>
        </div>
        
        <LoginForm 
          onLoginSuccess={() => navigate('/')} 
        />
      </div>
    </div>
  );
};

export default Login;
