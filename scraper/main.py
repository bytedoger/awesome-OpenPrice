import datetime
from core.db import supabase
from engine.rule_engine import classify_offer, sync_rules_from_db, RULES_CACHE
from spiders.ldxp import LdxpSpider
from spiders.dujiao import DujiaoSpider
from spiders.lizhi import LizhiSpider

# Map string scraper_type from DB to Python classes
SPIDER_REGISTRY = {
    "ldxp": LdxpSpider,
    "dujiao": DujiaoSpider,
    "lizhi": LizhiSpider
}

def main():
    print(f"[{datetime.datetime.now()}] Booting dynamic Python scraper...")
    if not RULES_CACHE:
        print(f"[{datetime.datetime.now()}] Local rules.json not found or empty, syncing from DB...")
        sync_rules_from_db()
    else:
        print(f"[{datetime.datetime.now()}] Loaded local rules from rules.json (Manual sync required for updates).")
    
    # 1. Fetch active AND verified targets from database
    res = supabase.table('crawler_targets').select('*').eq('is_active', True).eq('is_verified', True).execute()
    targets = res.data
    
    if not targets:
        print(f"[{datetime.datetime.now()}] No active crawler targets found in database. Exiting.")
        return
        
    print(f"[{datetime.datetime.now()}] Found {len(targets)} active targets.")
    
    for target in targets:
        source_id = target['id'] 
        source_name = target['name']
        scrape_url = target['scrape_url']
        scraper_type = target['scraper_type']
        
        spider_class = SPIDER_REGISTRY.get(scraper_type)
        if not spider_class:
            print(f"[{datetime.datetime.now()}] Skipping '{source_name}': Unregistered scraper_type '{scraper_type}'")
            continue
            
        print(f"\n[{datetime.datetime.now()}] --- Scraping Target: {source_name} ({scraper_type}) ---")
        spider = spider_class(source_id, source_name, scrape_url)
        
        try:
            raw_offers = spider.crawl()
            print(f"[{datetime.datetime.now()}] Crawl finished. Found {len(raw_offers)} raw offers.")
        except Exception as e:
            print(f"[{datetime.datetime.now()}] Error crawling {source_name}: {e}")
            continue
            
        formatted_offers = []
        for ro in raw_offers:
            canonical_id = classify_offer(ro["sourceTitle"])
            
            if canonical_id != "unknown":
                formatted_offers.append({
                    "target_id": source_id,
                    "product_title": ro["sourceTitle"],
                    "price": ro["price"],
                    "status": ro["status"],
                    "url": ro["url"],
                    "canonical_product_id": canonical_id,
                    "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "last_crawled_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                })
                
        if formatted_offers:
            try:
                # 2. Upsert offers using Composite Unique Constraint
                upsert_res = supabase.table('market_offers').upsert(
                    formatted_offers, 
                    on_conflict="target_id,product_title"
                ).execute()
                print(f"[{datetime.datetime.now()}] Upserted {len(upsert_res.data)} valid offers.")
                
                # 3. Update target's last_valid_at to mark it as healthy
                supabase.table('crawler_targets').update({
                    "last_valid_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "operational_status": "healthy"
                }).eq('id', source_id).execute()
                
            except Exception as e:
                print(f"[{datetime.datetime.now()}] Error updating DB for {source_name}: {e}")
        else:
            print(f"[{datetime.datetime.now()}] No valid offers mapped for {source_name}.")

    print(f"\n[{datetime.datetime.now()}] All targets processed successfully.")

if __name__ == "__main__":
    main()
