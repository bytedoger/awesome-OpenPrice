DROP POLICY IF EXISTS "Allow public read access on crawler_targets" ON public.crawler_targets;

DROP POLICY IF EXISTS "Allow admin all on scraper_test_jobs" ON public.scraper_test_jobs;

DROP POLICY IF EXISTS "Allow admin all on user_feedbacks" ON public.user_feedbacks;

DROP POLICY IF EXISTS "Allow admin all on user_target_submissions" ON public.user_target_submissions;
DROP POLICY IF EXISTS "Allow public read on user_target_submissions" ON public.user_target_submissions;
