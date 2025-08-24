-- Add appointment_id column to checkins table to link check-ins with appointments
ALTER TABLE public.checkins 
ADD COLUMN appointment_id UUID REFERENCES public.appointments(id);