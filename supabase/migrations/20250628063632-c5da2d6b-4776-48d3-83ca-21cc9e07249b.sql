
-- Tạo enum cho các quyền
CREATE TYPE public.user_role AS ENUM ('owner', 'employee', 'cashier');

-- Tạo bảng users để lưu thông tin đăng nhập
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  pin_code TEXT NOT NULL CHECK (LENGTH(pin_code) = 4 AND pin_code ~ '^[0-9]{4}$'),
  role user_role NOT NULL DEFAULT 'employee',
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho users
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only owners can create users" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Only owners can update users" ON public.users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Only owners can delete users" ON public.users
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Tạo bảng sessions để quản lý phiên đăng nhập
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật RLS cho sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Tạo user owner mặc định
INSERT INTO public.users (email, pin_code, role, full_name) 
VALUES ('admin@example.com', '1234', 'owner', 'Administrator');
