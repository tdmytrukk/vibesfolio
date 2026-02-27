-- Add trial_started_at to profiles to track 14-day free trial
ALTER TABLE public.profiles
ADD COLUMN trial_started_at timestamp with time zone NOT NULL DEFAULT now();