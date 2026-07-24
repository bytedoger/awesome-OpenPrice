-- Drop the existing foreign key constraint
ALTER TABLE public.market_offers DROP CONSTRAINT IF EXISTS market_offers_target_id_fkey;

-- Add the new foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.market_offers
    ADD CONSTRAINT market_offers_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.crawler_targets(id) ON DELETE CASCADE;
