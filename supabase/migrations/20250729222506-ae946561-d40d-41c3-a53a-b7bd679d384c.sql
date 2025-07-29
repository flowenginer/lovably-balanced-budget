-- Step 1: Consolidate transactions to use the oldest account for each (user_id, name, type) combination
UPDATE transactions 
SET account_id = (
    SELECT MIN(a.id) 
    FROM accounts a 
    WHERE a.user_id = (SELECT user_id FROM accounts WHERE id = transactions.account_id)
    AND a.name = (SELECT name FROM accounts WHERE id = transactions.account_id)
    AND a.type = (SELECT type FROM accounts WHERE id = transactions.account_id)
)
WHERE account_id IN (
    SELECT a1.id 
    FROM accounts a1 
    WHERE EXISTS (
        SELECT 1 FROM accounts a2 
        WHERE a2.user_id = a1.user_id 
        AND a2.name = a1.name 
        AND a2.type = a1.type 
        AND a2.id < a1.id
    )
);

-- Step 2: Now delete the duplicate accounts
DELETE FROM accounts a1 
WHERE EXISTS (
    SELECT 1 FROM accounts a2 
    WHERE a2.user_id = a1.user_id 
    AND a2.name = a1.name 
    AND a2.type = a1.type 
    AND a2.id < a1.id
);

-- Step 3: Add unique constraint to prevent future duplicates
ALTER TABLE accounts 
ADD CONSTRAINT unique_user_account_name_type 
UNIQUE (user_id, name, type);

-- Step 4: Update the create_default_accounts function to check for existing accounts
CREATE OR REPLACE FUNCTION public.create_default_accounts(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only create default accounts if none exist for this user
    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE user_id = create_default_accounts.user_id) THEN
        INSERT INTO public.accounts (user_id, name, type, balance, initial_balance, show_in_dashboard) VALUES
        (create_default_accounts.user_id, 'Conta Corrente', 'checking', 0.00, 0.00, true),
        (create_default_accounts.user_id, 'Poupança', 'savings', 0.00, 0.00, true),
        (create_default_accounts.user_id, 'Carteira', 'cash', 0.00, 0.00, true);
    END IF;
END;
$$;