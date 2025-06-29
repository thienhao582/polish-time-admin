
-- Tạo bảng dịch vụ
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- thời gian tính bằng phút
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng khách hàng
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  birthday DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng khách hàng nâng cao (cho hệ thống tích điểm)
CREATE TABLE public.enhanced_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  birthday DATE,
  notes TEXT,
  points INTEGER DEFAULT 0,
  member_level TEXT DEFAULT 'Mới' CHECK (member_level IN ('Mới', 'Thành viên', 'VIP', 'VVIP')),
  total_spent DECIMAL(12,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  join_date DATE DEFAULT CURRENT_DATE,
  last_visit DATE,
  visit_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng nhân viên
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'thợ chính' CHECK (role IN ('thợ chính', 'thợ phụ', 'receptionist', 'manager')),
  status TEXT DEFAULT 'đang làm' CHECK (status IN ('đang làm', 'tạm nghỉ', 'đã nghỉ')),
  assigned_services TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng lịch hẹn
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name TEXT,
  duration_minutes INTEGER,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng chấm công
CREATE TABLE public.time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  employee_name TEXT NOT NULL,
  work_date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  total_hours DECIMAL(4,2),
  status TEXT DEFAULT 'working' CHECK (status IN ('working', 'completed', 'absent')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng hóa đơn
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  services JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật Row Level Security cho tất cả bảng
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Tạo policies cho services
CREATE POLICY "Allow all operations for authenticated users" ON public.services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access for anonymous users" ON public.services
  FOR SELECT TO anon USING (true);

-- Tạo policies cho customers
CREATE POLICY "Allow all operations for authenticated users" ON public.customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access for anonymous users" ON public.customers
  FOR SELECT TO anon USING (true);

-- Tạo policies cho enhanced_customers
CREATE POLICY "Allow all operations for authenticated users" ON public.enhanced_customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access for anonymous users" ON public.enhanced_customers
  FOR SELECT TO anon USING (true);

-- Tạo policies cho employees
CREATE POLICY "Allow all operations for authenticated users" ON public.employees
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access for anonymous users" ON public.employees
  FOR SELECT TO anon USING (true);

-- Tạo policies cho appointments
CREATE POLICY "Allow all operations for authenticated users" ON public.appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access for anonymous users" ON public.appointments
  FOR SELECT TO anon USING (true);

-- Tạo policies cho time_records
CREATE POLICY "Allow all operations for authenticated users" ON public.time_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access for anonymous users" ON public.time_records
  FOR SELECT TO anon USING (true);

-- Tạo policies cho invoices
CREATE POLICY "Allow all operations for authenticated users" ON public.invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access for anonymous users" ON public.invoices
  FOR SELECT TO anon USING (true);

-- Tạo indexes để tối ưu performance
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX idx_appointments_employee ON public.appointments(employee_id);
CREATE INDEX idx_time_records_employee_date ON public.time_records(employee_id, work_date);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_enhanced_customers_phone ON public.enhanced_customers(phone);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_date ON public.invoices(created_at);

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo triggers cho tất cả bảng
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enhanced_customers_updated_at BEFORE UPDATE ON public.enhanced_customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_records_updated_at BEFORE UPDATE ON public.time_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
