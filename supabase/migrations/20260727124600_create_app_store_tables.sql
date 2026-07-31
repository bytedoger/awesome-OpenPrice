CREATE TABLE public.apple_store_apps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    apple_app_id text NOT NULL UNIQUE,
    name text NOT NULL,
    target_countries text[] DEFAULT '{"us", "cn", "jp", "hk", "tw", "gb", "de", "fr", "it", "au", "ca", "kr", "tr"}'::text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.apple_store_prices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    apple_app_id text NOT NULL REFERENCES public.apple_store_apps(apple_app_id) ON DELETE CASCADE,
    country text NOT NULL,
    subscription_name text NOT NULL,
    original_price_str text NOT NULL,
    price_rmb numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (apple_app_id, country, subscription_name)
);

-- RLS Policies
ALTER TABLE public.apple_store_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apple_store_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin all on apple_store_apps" ON public.apple_store_apps USING (true);
CREATE POLICY "Allow public read access on apple_store_apps" ON public.apple_store_apps FOR SELECT USING (true);

CREATE POLICY "Allow admin all on apple_store_prices" ON public.apple_store_prices USING (true);
CREATE POLICY "Allow public read access on apple_store_prices" ON public.apple_store_prices FOR SELECT USING (true);
