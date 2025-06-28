
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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
        
        <LoginForm 
          onLoginSuccess={() => navigate('/')} 
        />
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Tài khoản demo: admin@example.com / PIN: 1234</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
