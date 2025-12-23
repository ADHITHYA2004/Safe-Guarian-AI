-- Add quiet hours settings to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS quiet_hours_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_hours_start text NOT NULL DEFAULT '22:00',
ADD COLUMN IF NOT EXISTS quiet_hours_end text NOT NULL DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS quiet_hours_days text[] NOT NULL DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

COMMENT ON COLUMN public.user_settings.quiet_hours_enabled IS 'Enable/disable quiet hours feature';
COMMENT ON COLUMN public.user_settings.quiet_hours_start IS 'Start time for quiet hours in HH:MM format';
COMMENT ON COLUMN public.user_settings.quiet_hours_end IS 'End time for quiet hours in HH:MM format';
COMMENT ON COLUMN public.user_settings.quiet_hours_days IS 'Days of week when quiet hours apply';