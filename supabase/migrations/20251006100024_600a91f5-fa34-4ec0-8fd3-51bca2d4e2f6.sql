-- Create alerts table to store alert history
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('safe', 'warning', 'danger')),
  confidence INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  camera_id TEXT,
  camera_name TEXT,
  action_taken TEXT NOT NULL,
  contacts_notified JSONB DEFAULT '[]'::jsonb,
  alert_results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for alerts
CREATE POLICY "Users can view their own alerts" 
ON public.alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts" 
ON public.alerts 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);