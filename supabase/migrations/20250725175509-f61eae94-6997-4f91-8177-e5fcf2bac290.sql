-- Add commission_rate column to employees table
ALTER TABLE public.employees 
ADD COLUMN commission_rate DECIMAL(5,4) DEFAULT 0.10;

-- Add comment to explain commission rate is a percentage (e.g., 0.10 = 10%)
COMMENT ON COLUMN public.employees.commission_rate IS 'Commission rate as decimal (e.g., 0.10 = 10%)';

-- Add salary_earnings table to track individual earnings per appointment
CREATE TABLE public.salary_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  appointment_id UUID NOT NULL,
  base_service_price DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  earned_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.salary_earnings ENABLE ROW LEVEL SECURITY;

-- Create policies for salary_earnings
CREATE POLICY "Allow all operations for authenticated users" 
ON public.salary_earnings 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow read access for anonymous users" 
ON public.salary_earnings 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_salary_earnings_updated_at
BEFORE UPDATE ON public.salary_earnings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();