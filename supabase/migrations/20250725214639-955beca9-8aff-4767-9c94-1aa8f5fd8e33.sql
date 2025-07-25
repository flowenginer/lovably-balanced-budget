-- Remove duplicate banks that don't have logos
DELETE FROM public.banks WHERE icon_url IS NULL;