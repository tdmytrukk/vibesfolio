
-- Add is_public column to profiles (default false = private)
ALTER TABLE public.profiles ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Create follow_requests table
CREATE TABLE public.follow_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL,
  target_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(requester_id, target_id)
);

-- Enable RLS
ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;

-- Requester can see their own outgoing requests
CREATE POLICY "Users can read own outgoing requests"
  ON public.follow_requests FOR SELECT
  USING (auth.uid() = requester_id);

-- Target can see incoming requests
CREATE POLICY "Users can read incoming requests"
  ON public.follow_requests FOR SELECT
  USING (auth.uid() = target_id);

-- Users can create follow requests
CREATE POLICY "Users can create follow requests"
  ON public.follow_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Requester can cancel their own request
CREATE POLICY "Users can delete own requests"
  ON public.follow_requests FOR DELETE
  USING (auth.uid() = requester_id);

-- Target can also delete (decline) requests
CREATE POLICY "Target can delete requests"
  ON public.follow_requests FOR DELETE
  USING (auth.uid() = target_id);

-- Target can update request status (accept/decline)
CREATE POLICY "Target can update request status"
  ON public.follow_requests FOR UPDATE
  USING (auth.uid() = target_id);
