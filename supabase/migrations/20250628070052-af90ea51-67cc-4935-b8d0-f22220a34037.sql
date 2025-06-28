
-- Tạo policy cho phép anonymous users đọc thông tin users để đăng nhập
CREATE POLICY "Allow anonymous login access" ON public.users
  FOR SELECT TO anon
  USING (true);

-- Tạo policy cho phép anonymous users tạo sessions
CREATE POLICY "Allow anonymous session creation" ON public.user_sessions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Tạo policy cho phép anonymous users đọc sessions để verify
CREATE POLICY "Allow anonymous session verification" ON public.user_sessions
  FOR SELECT TO anon
  USING (true);
