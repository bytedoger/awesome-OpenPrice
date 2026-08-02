ALTER TABLE public.apple_store_apps
    ADD COLUMN slug text;

INSERT INTO public.apple_store_apps (apple_app_id, slug, name)
VALUES
    ('6448311069', 'chatgpt', 'ChatGPT'),
    ('6473753684', 'claude', 'Claude'),
    ('6670324846', 'grok', 'Grok AI')
ON CONFLICT (apple_app_id) DO NOTHING;

UPDATE public.apple_store_apps
SET slug = CASE apple_app_id
    WHEN '6448311069' THEN 'chatgpt'
    WHEN '6473753684' THEN 'claude'
    WHEN '6670324846' THEN 'grok'
    ELSE lower(trim(BOTH '-' FROM regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')))
END;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.apple_store_apps
        WHERE slug IS NULL OR slug = ''
    ) THEN
        RAISE EXCEPTION 'Could not generate a slug for every apple_store_apps row';
    END IF;

    IF EXISTS (
        SELECT slug
        FROM public.apple_store_apps
        GROUP BY slug
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Generated duplicate slugs in apple_store_apps';
    END IF;
END $$;

ALTER TABLE public.apple_store_apps
    ALTER COLUMN slug SET NOT NULL,
    ADD CONSTRAINT apple_store_apps_slug_key UNIQUE (slug),
    ADD CONSTRAINT apple_store_apps_slug_format_check
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
