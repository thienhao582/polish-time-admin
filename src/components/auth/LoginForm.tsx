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
import { useDemoMode } from "@/contexts/DemoModeContext";
import { indexedDBService } from "@/services/indexedDBService";

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
  const { isDemoMode } = useDemoMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isDemoMode) {
        // Demo mode login
        if (email !== 'admin@example.com' || pin !== '1234') {
          setError('Demo mode: Sử dụng admin@example.com / 1234');
          setIsLoading(false);
          return;
        }

        // Initialize demo data
        await indexedDBService.initDemoData();

        const demoUser = {
          id: 'demo-user-1',
          email: 'admin@example.com',
          full_name: 'Demo Admin',
          role: 'owner' as const,
          is_active: true
        };

        // Create session token
        const sessionToken = btoa(JSON.stringify({
          userId: demoUser.id,
          email: demoUser.email,
          timestamp: Date.now(),
          isDemoMode: true
        }));

        localStorage.setItem('nail_salon_session', JSON.stringify({
          sessionToken,
          user: demoUser,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          isDemoMode: true
        }));

        login(demoUser);

        toast({
          title: "Đăng nhập demo thành công",
          description: `Chào mừng ${demoUser.full_name}! (Demo Mode)`,
        });

        onLoginSuccess(demoUser);
        return;
      }

      // Original Supabase login logic
      console.log('Attempting login with:', { email: email.toLowerCase().trim(), pin });

      // Validate PIN format
      if (!/^\d{4}$/.test(pin)) {
        setError("Mã PIN phải có đúng 4 chữ số");
        setIsLoading(false);
        return;
      }

      const trimmedEmail = email.toLowerCase().trim();

      // Try multiple query approaches
      console.log('Querying with trimmed email:', trimmedEmail);

      // First try with exact match
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', trimmedEmail)
        .eq('is_active', true)
        .maybeSingle();

      console.log('Exact match result:', { userData, userError });

      // If no result, try with ilike
      if (!userData && !userError) {
        console.log('Trying with ilike...');
        const result = await supabase
          .from('users')
          .select('*')
          .ilike('email', trimmedEmail)
          .eq('is_active', true)
          .maybeSingle();
        
        userData = result.data;
        userError = result.error;
        console.log('ilike result:', { userData, userError });
      }

      // If still no result, try without is_active filter
      if (!userData && !userError) {
        console.log('Trying without is_active filter...');
        const result = await supabase
          .from('users')
          .select('*')
          .eq('email', trimmedEmail)
          .maybeSingle();
        
        userData = result.data;
        userError = result.error;
        console.log('Without is_active filter result:', { userData, userError });
      }

      if (userError) {
        console.error('Database error:', userError);
        setError("Lỗi kết nối database: " + userError.message);
        setIsLoading(false);
        return;
      }

      if (!userData) {
        setError("Email không tồn tại trong hệ thống hoặc tài khoản chưa được kích hoạt");
        setIsLoading(false);
        return;
      }

      console.log('Found user:', { id: userData.id, email: userData.email, is_active: userData.is_active });

      // Check if account is active
      if (!userData.is_active) {
        setError("Tài khoản đã bị vô hiệu hóa");
        setIsLoading(false);
        return;
      }

      // Check PIN
      console.log('Checking PIN:', { provided: pin, stored: userData.pin_code });
      if (userData.pin_code !== pin) {
        setError("Mã PIN không đúng");
        setIsLoading(false);
        return;
      }

      // Create session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      console.log('Creating session for user:', userData.id);

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

      console.log('Login successful for user:', userData.email);

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
        </form>
      </CardContent>
    </Card>
  );
}