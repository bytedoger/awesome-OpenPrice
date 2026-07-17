import datetime
from core.db import supabase

OFFLINE_THRESHOLD_HOURS = 24

def run_cleanup():
    print(f"Starting cleanup job... looking for offers not updated in the last {OFFLINE_THRESHOLD_HOURS} hours.")
    
    threshold_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=OFFLINE_THRESHOLD_HOURS)
    threshold_iso = threshold_time.isoformat()
    
    # 1. Fetch stale offers
    res = supabase.table('market_offers').select('id, target_name, product_title, status, updated_at') \
        .lt('updated_at', threshold_iso) \
        .neq('status', 'out_of_stock') \
        .execute()
        
    stale_offers = res.data
    
    if not stale_offers:
        print("No stale offers found. Everything is up to date.")
        return
        
    print(f"Found {len(stale_offers)} stale offers. Marking them as 'out_of_stock'...")
    
    # 2. Update to out_of_stock
    update_res = supabase.table('market_offers').update({
        "status": "out_of_stock",
        "last_crawled_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }) \
        .lt('updated_at', threshold_iso) \
        .neq('status', 'out_of_stock') \
        .execute()
        
    print("Cleanup job completed successfully!")
    
    for offer in stale_offers:
        print(f" - [Offline]: {offer['target_name']} - {offer['product_title']} (Last seen: {offer['updated_at']})")

if __name__ == "__main__":
    run_cleanup()
