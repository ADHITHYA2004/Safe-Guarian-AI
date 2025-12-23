-- Create settings table for user preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Detection Settings
  detection_sensitivity TEXT NOT NULL DEFAULT 'high',
  confidence_threshold INTEGER NOT NULL DEFAULT 75,
  realtime_processing BOOLEAN NOT NULL DEFAULT true,
  
  -- Camera Settings
  video_quality TEXT NOT NULL DEFAULT 'hd',
  frame_rate INTEGER NOT NULL DEFAULT 30,
  auto_start_detection BOOLEAN NOT NULL DEFAULT false,
  
  -- Alert Settings
  audio_alerts BOOLEAN NOT NULL DEFAULT true,
  alert_volume INTEGER NOT NULL DEFAULT 85,
  auto_notify_contacts BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();