-- Step 1: Create a temporary table to map duplicate accounts to the account we want to keep
WITH oldest_accounts AS (
    SELECT DISTINCT ON (user_id, name, type) 
           id as keep_id, 
           user_id, 
           name, 
           type
    FROM accounts 
    ORDER BY user_id, name, type, created_at ASC
),
duplicate_mapping AS (
    SELECT a.id as duplicate_id, oa.keep_id
    FROM accounts a
    JOIN oldest_accounts oa ON a.user_id = oa.user_id 
                           AND a.name = oa.name 
                           AND a.type = oa.type
    WHERE a.id != oa.keep_id
)
-- Step 2: Update transactions to reference the account we're keeping
UPDATE transactions 
SET account_id = dm.keep_id
FROM duplicate_mapping dm
WHERE transactions.account_id = dm.duplicate_id;

-- Step 3: Delete duplicate accounts
WITH oldest_accounts AS (
    SELECT DISTINCT ON (user_id, name, type) 
           id as keep_id, 
           user_id, 
           name, 
           type
    FROM accounts 
    ORDER BY user_id, name, type, created_at ASC
)
DELETE FROM accounts 
WHERE id NOT IN (SELECT keep_id FROM oldest_accounts);

-- Step 4: Add unique constraint
ALTER TABLE accounts 
ADD CONSTRAINT unique_user_account_name_type 
UNIQUE (user_id, name, type);

-- Step 5: Update the create_default_accounts function
CREATE OR REPLACE FUNCTION public.create_default_accounts(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Use INSERT ... ON CONFLICT DO NOTHING to prevent duplicates
    INSERT INTO public.accounts (user_id, name, type, balance, initial_balance, show_in_dashboard) VALUES
    (create_default_accounts.user_id, 'Conta Corrente', 'checking', 0.00, 0.00, true),
    (create_default_accounts.user_id, 'Poupança', 'savings', 0.00, 0.00, true),
    (create_default_accounts.user_id, 'Carteira', 'cash', 0.00, 0.00, true)
    ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$;