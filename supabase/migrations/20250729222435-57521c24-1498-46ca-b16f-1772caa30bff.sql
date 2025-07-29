-- First, let's clean up duplicate accounts for each user
DELETE FROM accounts a1 
WHERE EXISTS (
    SELECT 1 FROM accounts a2 
    WHERE a2.user_id = a1.user_id 
    AND a2.name = a1.name 
    AND a2.type = a1.type 
    AND a2.id < a1.id
);

-- Add unique constraint to prevent duplicate accounts per user
ALTER TABLE accounts 
ADD CONSTRAINT unique_user_account_name_type 
UNIQUE (user_id, name, type);

-- Update the create_default_accounts function to check for existing accounts
CREATE OR REPLACE FUNCTION public.create_default_accounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only create default accounts if none exist for this user
    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE user_id = NEW.id) THEN
        INSERT INTO public.accounts (user_id, name, type, balance, initial_balance, show_in_dashboard) VALUES
        (NEW.id, 'Conta Corrente', 'checking', 0.00, 0.00, true),
        (NEW.id, 'Poupança', 'savings', 0.00, 0.00, true),
        (NEW.id, 'Carteira', 'cash', 0.00, 0.00, true);
    END IF;
    
    RETURN NEW;
END;
$$;