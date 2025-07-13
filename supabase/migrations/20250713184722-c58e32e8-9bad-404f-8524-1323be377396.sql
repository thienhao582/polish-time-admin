-- Fix RLS policies for appointments table
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Allow read access for anonymous users" ON public.appointments;

-- Create new policies that allow appointments creation
CREATE POLICY "Enable read access for all users" ON public.appointments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.appointments
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.appointments
    FOR DELETE USING (true);