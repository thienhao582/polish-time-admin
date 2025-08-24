-- Create checkins table for storing customer check-in data
CREATE TABLE public.checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'booked', 'completed')),
  check_in_time TEXT NOT NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  wait_time INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Create policies for checkins table
CREATE POLICY "Allow read access for all users" 
ON public.checkins 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert for all users" 
ON public.checkins 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update for all users" 
ON public.checkins 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete for all users" 
ON public.checkins 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_checkins_updated_at
  BEFORE UPDATE ON public.checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_checkins_date ON public.checkins(check_in_date);
CREATE INDEX idx_checkins_status ON public.checkins(status);
CREATE INDEX idx_checkins_customer_phone ON public.checkins(customer_phone);
CREATE INDEX idx_checkins_created_at ON public.checkins(created_at);