import time
import datetime
from core.db import supabase
from core.db import supabase
from engine.rule_engine import classify_offer, classify_offer_with_name, sync_rules_from_db, RULES_CACHE
from main import SPIDER_REGISTRY

def run_test_worker():
    print(f"[{datetime.datetime.now()}] Booting Test Worker...")
    if not RULES_CACHE:
        print(f"[{datetime.datetime.now()}] Local rules.json not found or empty, syncing from DB...")
        sync_rules_from_db()
    else:
        print(f"[{datetime.datetime.now()}] Loaded local rules from rules.json (Manual sync required for updates).")
    print(f"[{datetime.datetime.now()}] Listening for jobs...")
    
    while True:
        try:
            # 1. Fetch one pending job
            res = supabase.table('scraper_test_jobs').select('*').eq('status', 'pending').limit(1).execute()
            jobs = res.data
            
            if not jobs:
                time.sleep(2)
                continue
                
            job = jobs[0]
            job_id = job['id']
            scrape_url = job['scrape_url']
            scraper_type = job['scraper_type']
            
            print(f"\n[{datetime.datetime.now()}] Found test job {job_id} for {scrape_url}")
            
            # Mark as processing
            supabase.table('scraper_test_jobs').update({
                'status': 'processing',
                'updated_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
            }).eq('id', job_id).execute()
            
            # Check if auto-detect
            if scraper_type == 'auto':
                candidates = list(SPIDER_REGISTRY.items())
            else:
                spider_class = SPIDER_REGISTRY.get(scraper_type)
                if not spider_class:
                    error_msg = f"Unregistered scraper_type '{scraper_type}'"
                    print(f"[{datetime.datetime.now()}] Error: {error_msg}")
                    supabase.table('scraper_test_jobs').update({
                        'status': 'failed',
                        'error_message': error_msg,
                        'updated_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
                    }).eq('id', job_id).execute()
                    continue
                candidates = [(scraper_type, spider_class)]
                
            success = False
            last_error = None
            
            for stype, sclass in candidates:
                print(f"[{datetime.datetime.now()}] Trying engine: {stype}...")
                spider = sclass("00000000-0000-0000-0000-000000000000", "Test Mode", scrape_url)
                
                try:
                    raw_offers = spider.crawl()
                    if len(raw_offers) > 0:
                        print(f"[{datetime.datetime.now()}] Crawl finished with engine {stype}. Found {len(raw_offers)} raw offers.")
                        
                        formatted_offers = []
                        for ro in raw_offers:
                            canonical_id, product_name = classify_offer_with_name(ro["sourceTitle"])
                            formatted_offers.append({
                                "product_title": ro["sourceTitle"],
                                "price": ro["price"],
                                "status": ro["status"],
                                "url": ro["url"],
                                "canonical_product_id": canonical_id,
                                "canonical_product_name": product_name,
                            })
                        
                        # Deduplicate by product_title, keeping the lowest price
                        unique_offers = {}
                        for offer in formatted_offers:
                            key = offer["product_title"]
                            if key not in unique_offers:
                                unique_offers[key] = offer
                            else:
                                curr_price = unique_offers[key].get("price")
                                new_price = offer.get("price")
                                if curr_price is None or (new_price is not None and new_price < curr_price):
                                    unique_offers[key] = offer
                        deduped_offers = list(unique_offers.values())
                        
                        # Write mapped results back to job, and update scraper_type if it was 'auto'
                        extracted_name = getattr(spider, 'extracted_name', None)
                        supabase.table('scraper_test_jobs').update({
                            'scraper_type': stype,
                            'status': 'completed',
                            'result_data': {
                                "offers": deduped_offers,
                                "extracted_name": extracted_name
                            },
                            'updated_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
                        }).eq('id', job_id).execute()
                        
                        # 补充需求：将抓取到的名字直接写回提报表，方便后台列表里直接展示和手动批准
                        if extracted_name:
                            # 这里仅更新 site_url 匹配，并且原名字包含“未命名”的记录，防止覆盖用户自己填写的名字
                            supabase.table('user_target_submissions').update({
                                'name': extracted_name
                            }).eq('site_url', scrape_url).like('name', '%未命名%').execute()
                        
                        success = True
                        break
                except Exception as e:
                    last_error = str(e)
                    print(f"[{datetime.datetime.now()}] Error crawling with {stype}: {last_error}")
            
            if not success:
                error_msg = "自动探测失败，所有可用引擎均未能提取到数据。" if scraper_type == 'auto' else (last_error or "未提取到数据")
                supabase.table('scraper_test_jobs').update({
                    'status': 'failed',
                    'error_message': error_msg,
                    'updated_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
                }).eq('id', job_id).execute()
                
        except Exception as global_e:
            print(f"[{datetime.datetime.now()}] Global Worker Error: {global_e}")
            time.sleep(5)

if __name__ == "__main__":
    run_test_worker()
