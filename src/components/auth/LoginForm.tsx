
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email: email.toLowerCase(), pin });

      // Validate PIN format
      if (!/^\d{4}$/.test(pin)) {
        setError("Mã PIN phải có đúng 4 chữ số");
        setIsLoading(false);
        return;
      }

      // Query user with exact email match
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      console.log('User query result:', { userData, userError });

      if (userError) {
        console.error('Database error:', userError);
        if (userError.code === 'PGRST116') {
          setError("Email không tồn tại trong hệ thống");
        } else {
          setError("Lỗi kết nối database: " + userError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!userData) {
        setError("Email không tồn tại trong hệ thống");
        setIsLoading(false);
        return;
      }

      // Check PIN
      if (userData.pin_code !== pin) {
        setError("Mã PIN không đúng");
        setIsLoading(false);
        return;
      }

      // Create session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      console.log('Creating session...');

      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        setError("Lỗi tạo phiên đăng nhập: " + sessionError.message);
        setIsLoading(false);
        return;
      }

      // Store session in localStorage
      localStorage.setItem('nail_salon_session', JSON.stringify({
        sessionToken,
        user: userData,
        expiresAt: expiresAt.toISOString()
      }));

      console.log('Login successful!');

      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${userData.full_name}`,
      });

      // Update auth context
      login(userData);
      onLoginSuccess(userData);

    } catch (error) {
      console.error('Login error:', error);
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center">
          Nhập email và mã PIN để truy cập hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">Mã PIN (4 số)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="pin"
                type="password"
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="pl-9"
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Tài khoản demo:</p>
            <p className="text-sm text-blue-600">Email: admin@example.com</p>
            <p className="text-sm text-blue-600">PIN: 1234</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
