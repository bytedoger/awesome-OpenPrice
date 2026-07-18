import time
import datetime
from core.db import supabase
from engine.rule_engine import classify_offer, sync_rules_from_db
from main import SPIDER_REGISTRY
import random
import os

# 默认每次抓取完后，在一个时间区间内随机休眠（例如 15秒 到 45秒 之间）
MIN_SLEEP_SECONDS = int(os.environ.get('MIN_SLEEP_SECONDS', 30))
MAX_SLEEP_SECONDS = int(os.environ.get('MAX_SLEEP_SECONDS', 90))

def run_production_worker():
    print(f"[{datetime.datetime.now()}] Booting Production Worker... Polling dynamically...")
    last_sync_time = 0
    
    while True:
        try:
            # Sync rules periodically (e.g. every 5 minutes) to avoid stale mapping IDs
            if time.time() - last_sync_time > 300:
                print(f"[{datetime.datetime.now()}] Performing periodic rule sync from DB...")
                sync_rules_from_db()
                last_sync_time = time.time()
                
            # 1. Fetch the oldest unattempted/least recently attempted target
            res = supabase.table('crawler_targets') \
                .select('*') \
                .eq('is_active', True) \
                .eq('is_verified', True) \
                .order('last_attempt_at', desc=False, nullsfirst=True) \
                .limit(1) \
                .execute()
                
            targets = res.data
            
            if not targets:
                # If there are no active/verified targets at all, sleep for a while and check again
                print(f"[{datetime.datetime.now()}] No active and verified targets found. Sleeping...")
                time.sleep(60)
                continue
                
            target = targets[0]
            source_id = target['id']
            source_name = target['name']
            scrape_url = target['scrape_url']
            scraper_type = target['scraper_type']
            
            print(f"\n[{datetime.datetime.now()}] --- Picking Target: {source_name} ({scraper_type}) ---")
            
            # Immediately update last_attempt_at so we don't pick it up again on the next loop
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            supabase.table('crawler_targets').update({
                'last_attempt_at': now_iso,
                'updated_at': now_iso
            }).eq('id', source_id).execute()
            
            spider_class = SPIDER_REGISTRY.get(scraper_type)
            if not spider_class:
                error_msg = f"Unregistered scraper_type '{scraper_type}'"
                print(f"[{datetime.datetime.now()}] Skipping '{source_name}': {error_msg}")
                supabase.table('crawler_targets').update({
                    'operational_status': 'degraded',
                    'error_streak': target.get('error_streak', 0) + 1,
                    'latest_error_msg': error_msg
                }).eq('id', source_id).execute()
                
                sleep_time = random.randint(MIN_SLEEP_SECONDS, MAX_SLEEP_SECONDS)
                print(f"[{datetime.datetime.now()}] Pacing: Sleeping randomly for {sleep_time} seconds...")
                time.sleep(sleep_time)
                continue
                
            spider = spider_class(source_id, source_name, scrape_url)
            
            crawl_start_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            try:
                raw_offers = spider.crawl()
                print(f"[{datetime.datetime.now()}] Crawl finished. Found {len(raw_offers)} raw offers.")
                
                formatted_offers = []
                for ro in raw_offers:
                    canonical_id = classify_offer(ro["sourceTitle"])
                    
                    db_canonical_id = canonical_id if canonical_id != "unknown" else None
                    
                    formatted_offers.append({
                        "target_id": source_id,
                        "product_title": ro["sourceTitle"],
                        "price": ro["price"],
                        "status": ro["status"],
                        "url": ro["url"],
                        "inventory_level": ro.get("stockCount"),
                        "canonical_product_id": db_canonical_id,
                        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                        "last_crawled_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                    })
                
                if formatted_offers:
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
                    
                    # Upsert offers using Composite Unique Constraint
                    upsert_res = supabase.table('market_offers').upsert(
                        deduped_offers, 
                        on_conflict="target_id,product_title"
                    ).execute()
                    print(f"[{datetime.datetime.now()}] Upserted {len(upsert_res.data)} valid offers.")
                    
                    # Mark products that were not seen in this crawl as offline
                    supabase.table('market_offers').update({
                        'status': 'offline',
                        'last_crawled_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
                    }).eq('target_id', source_id).lt('updated_at', crawl_start_time).execute()
                    
                    
                # Update target's last_valid_at to mark it as healthy
                update_payload = {
                    "last_valid_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "operational_status": "healthy",
                    "error_streak": 0,
                    "latest_error_msg": None
                }
                
                # If the spider dynamically resolved a real name and the current name is exactly '未命名', update it
                # (Removed per user request: production_worker should NEVER touch crawler_targets.name)

                supabase.table('crawler_targets').update(update_payload).eq('id', source_id).execute()
                
            except Exception as e:
                error_msg = str(e)
                print(f"[{datetime.datetime.now()}] Error crawling {source_name}: {error_msg}")
                supabase.table('crawler_targets').update({
                    'operational_status': 'degraded',
                    'error_streak': target.get('error_streak', 0) + 1,
                    'latest_error_msg': error_msg
                }).eq('id', source_id).execute()
                
            sleep_time = random.randint(MIN_SLEEP_SECONDS, MAX_SLEEP_SECONDS)
            print(f"[{datetime.datetime.now()}] Pacing: Sleeping randomly for {sleep_time} seconds before next target...")
            time.sleep(sleep_time)
                
        except Exception as global_e:
            print(f"[{datetime.datetime.now()}] Global Worker Error: {global_e}")
            time.sleep(5)

if __name__ == "__main__":
    run_production_worker()
