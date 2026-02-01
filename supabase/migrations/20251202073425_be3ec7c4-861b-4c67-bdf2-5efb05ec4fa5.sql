-- Add database constraint for message length validation
ALTER TABLE public.messages 
ADD CONSTRAINT message_length_check 
CHECK (length(content) BETWEEN 1 AND 1000);