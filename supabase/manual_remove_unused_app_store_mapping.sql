-- Run this manually in the Supabase SQL Editor for the intended project.
-- This keeps apple_store_apps and the core apple_store_prices columns.
-- No CASCADE is used: unexpected external dependencies will abort the transaction.

BEGIN;

DROP FUNCTION IF EXISTS public.replace_apple_store_country_prices(
    text,
    text,
    jsonb
);

DROP TABLE IF EXISTS public.apple_store_plan_aliases;

ALTER TABLE public.apple_store_prices
    DROP COLUMN IF EXISTS plan_id,
    DROP COLUMN IF EXISTS mapping_status,
    DROP COLUMN IF EXISTS raw_subscription_name,
    DROP COLUMN IF EXISTS source_occurrence_index,
    DROP COLUMN IF EXISTS source_occurrence_count;

DROP TABLE IF EXISTS public.apple_store_plans;

COMMIT;

-- Verification: both table values should be NULL, the function count should be 0,
-- and only the core price columns should remain.
SELECT
    to_regclass('public.apple_store_plans') AS plans_table,
    to_regclass('public.apple_store_plan_aliases') AS aliases_table;

SELECT count(*) AS replace_function_count
FROM pg_proc AS procedure
JOIN pg_namespace AS namespace
    ON namespace.oid = procedure.pronamespace
WHERE namespace.nspname = 'public'
    AND procedure.proname = 'replace_apple_store_country_prices';

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'apple_store_prices'
ORDER BY ordinal_position;
