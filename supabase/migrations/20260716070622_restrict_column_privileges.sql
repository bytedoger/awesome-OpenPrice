REVOKE SELECT ON public.product_catalog FROM public, anon, authenticated;
GRANT SELECT (id, slug, name, short_desc, search_keywords, is_active, platform_id, sort_order, display_id) 
ON public.product_catalog TO public, anon, authenticated;

REVOKE SELECT ON public.market_offers FROM public, anon, authenticated;
GRANT SELECT (id, target_id, product_title, price, status, url, tags, inventory_level, updated_at, canonical_product_id) 
ON public.market_offers TO public, anon, authenticated;

REVOKE SELECT ON public.crawler_targets FROM public, anon, authenticated;
GRANT SELECT (id, name, scraper_type, created_at) 
ON public.crawler_targets TO public, anon, authenticated;
DROP POLICY IF EXISTS "Allow public read access on crawler_targets" ON public.crawler_targets;
CREATE POLICY "Allow public read access on crawler_targets" ON public.crawler_targets FOR SELECT USING (true);

REVOKE SELECT ON public.product_platforms FROM public, anon, authenticated;
GRANT SELECT (id, name, is_active) 
ON public.product_platforms TO public, anon, authenticated;
