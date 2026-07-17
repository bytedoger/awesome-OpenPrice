import json
import os
import re

RULES_FILE = os.path.join(os.path.dirname(__file__), 'rules.json')

RULES_CACHE = []

def load_local_rules():
    global RULES_CACHE
    if os.path.exists(RULES_FILE):
        with open(RULES_FILE, 'r', encoding='utf-8') as f:
            RULES_CACHE = json.load(f)

# Initial load
load_local_rules()

def sync_rules_from_db():
    """
    Fetch the product_catalog from Supabase, group them by platform, 
    and save them as a 2-level tree in rules.json.
    """
    from core.db import supabase
    print("Syncing classification rules from Supabase...")
    try:
        # Fetch platforms and their associated active products using Supabase Foreign Key join
        res = supabase.table('product_platforms') \
            .select('id, name, rule_include, rule_exclude, sort_order, product_catalog(id, name, rule_include, rule_exclude, is_active, is_catch_all, sort_order)') \
            .eq('is_active', True) \
            .execute()
            
        platforms_data = res.data
        platforms_data.sort(key=lambda x: (x.get('sort_order') if x.get('sort_order') is not None else 100, x.get('id')))
        
        tree = []
        for plat in platforms_data:
            products = plat.get('product_catalog', [])
            active_products = [p for p in products if p.get('is_active', True)]
            active_products.sort(key=lambda x: (x.get('sort_order') if x.get('sort_order') is not None else 100, x.get('id')))
            
            tree.append({
                "platform": plat['name'],
                "platform_id": plat['id'],
                "platform_include": plat.get('rule_include') or [],
                "platform_exclude": plat.get('rule_exclude') or [],
                "sort_order": plat.get('sort_order', 100),
                "products": [
                    {
                        "product_name": p.get('name'),
                        "canonicalId": p['id'],
                        "includeAny": p.get('rule_include') or [],
                        "exclude": p.get('rule_exclude') or [],
                        "is_catch_all": p.get('is_catch_all', False),
                        "sort_order": p.get('sort_order', 100)
                    }
                    for p in active_products
                ]
            })
        
        with open(RULES_FILE, 'w', encoding='utf-8') as f:
            json.dump(tree, f, ensure_ascii=False, indent=2)
            
        load_local_rules()
        print(f"[Sync] Successfully updated rules cache with {len(tree)} platforms.")
    except Exception as e:
        print(f"[Sync Error] Failed to fetch or write rules: {e}")


def clean_text(text: str) -> str:
    """Normalize text by lowercasing and standardizing spaces."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[\r\n\t]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def matches_any(text: str, keywords: list) -> bool:
    """Check if the text contains any of the given keywords."""
    if not keywords:
        return False
    for kw in keywords:
        if isinstance(kw, str):
            if kw.lower() in text:
                return True
        elif isinstance(kw, list):
            if matches_any(text, kw):
                return True
    return False

def matches_cnf(text: str, groups: list) -> bool:
    """
    Check if the text matches the CNF logic: (A or B) AND (C or D).
    `groups` is expected to be a list of lists of strings, e.g. [['A', 'B'], ['C', 'D']].
    If `groups` is an empty list or contains no groups, return False.
    If any group is empty (no keywords), it is skipped (Wait, actually if a group is empty, should it fail? If empty group, it means nothing to match. Let's just say empty groups are ignored, or we assume groups are well-formed).
    """
    if not groups:
        return False
        
    for group in groups:
        # Backward compatibility: if it's a 1D array of strings, treat the whole array as one group (Wait, `groups` is the top level. If `group` is a string, it means `groups` is a 1D array).
        if isinstance(group, str):
            # If we encounter a string, it means `groups` is actually a 1D array `['A', 'B']` (OR logic).
            # So we just fall back to `matches_any(text, groups)` and return its result for the whole thing.
            return matches_any(text, groups)
            
        if isinstance(group, list) and group:
            if not matches_any(text, group):
                return False
                
    return True

def classify_offer(title: str) -> str:
    """
    Given a raw product title, returns the matching canonical product ID
    using a 2-level (Platform -> Product) filtering logic.
    Returns 'unknown' if no rules match.
    """
    normalized_title = clean_text(title)
    
    other_platform = None
    
    for platform in RULES_CACHE:
        if platform.get('platform_id') == 'eb007f92-c7ca-445e-ab79-785307e6bcb5':
            other_platform = platform
            
        p_include = platform.get('platform_include', [])
        p_exclude = platform.get('platform_exclude', [])
        
        # Level 1: Platform Match
        is_platform_match = False
        
        if not p_include:
            # If no platform include rules, assume match
            is_platform_match = True
        elif matches_cnf(normalized_title, p_include):
            # Must NOT match any platform exclude keywords
            if not p_exclude or not matches_any(normalized_title, p_exclude):
                is_platform_match = True
                
        if is_platform_match:
            # Level 2: Product Match
            catch_all_id = None
            
            for rule in platform.get('products', []):
                if rule.get('is_catch_all'):
                    catch_all_id = rule.get('canonicalId')
                    continue
                    
                prod_include = rule.get('includeAny', [])
                prod_exclude = rule.get('exclude', [])
                
                if matches_cnf(normalized_title, prod_include):
                    # Must NOT match any exclude keywords
                    if not prod_exclude or not matches_any(normalized_title, prod_exclude):
                        return rule.get('canonicalId')
            
            # If no standard product matched but we have a catch-all, return it
            if catch_all_id:
                return catch_all_id
                
    # Fallback: if data does not match any platform, try to match with products in 'other' platform
    if other_platform:
        catch_all_id = None
        for rule in other_platform.get('products', []):
            if rule.get('is_catch_all'):
                catch_all_id = rule.get('canonicalId')
                continue
                
            prod_include = rule.get('includeAny', [])
            prod_exclude = rule.get('exclude', [])
            
            if matches_cnf(normalized_title, prod_include):
                if not prod_exclude or not matches_any(normalized_title, prod_exclude):
                    return rule.get('canonicalId')
                    
        if catch_all_id:
            return catch_all_id

    return "unknown"

def classify_offer_with_name(title: str):
    """
    Returns (canonicalId, product_name). Useful for admin testing.
    """
    if not title or not RULES_CACHE:
        return "unknown", "未知"
        
    normalized_title = clean_text(title)
    
    other_platform = None
    
    for platform in RULES_CACHE:
        if platform.get('platform_id') == 'eb007f92-c7ca-445e-ab79-785307e6bcb5':
            other_platform = platform
            
        p_include = platform.get('platform_include', [])
        p_exclude = platform.get('platform_exclude', [])
        
        is_platform_match = False
        if not p_include:
            is_platform_match = True
        elif matches_cnf(normalized_title, p_include):
            if not p_exclude or not matches_any(normalized_title, p_exclude):
                is_platform_match = True
                
        if is_platform_match:
            catch_all_id = None
            catch_all_name = None
            
            for rule in platform.get('products', []):
                if rule.get('is_catch_all'):
                    catch_all_id = rule.get('canonicalId')
                    catch_all_name = rule.get('product_name', '未知')
                    continue
                    
                prod_include = rule.get('includeAny', [])
                prod_exclude = rule.get('exclude', [])
                
                if matches_cnf(normalized_title, prod_include):
                    if not prod_exclude or not matches_any(normalized_title, prod_exclude):
                        return rule.get('canonicalId'), rule.get('product_name', '未知')
                        
            if catch_all_id:
                return catch_all_id, catch_all_name
                
    # Fallback to 'other' platform products
    if other_platform:
        catch_all_id = None
        catch_all_name = None
        
        for rule in other_platform.get('products', []):
            if rule.get('is_catch_all'):
                catch_all_id = rule.get('canonicalId')
                catch_all_name = rule.get('product_name', '未知')
                continue
                
            prod_include = rule.get('includeAny', [])
            prod_exclude = rule.get('exclude', [])
            
            if matches_cnf(normalized_title, prod_include):
                if not prod_exclude or not matches_any(normalized_title, prod_exclude):
                    return rule.get('canonicalId'), rule.get('product_name', '未知')
                    
        if catch_all_id:
            return catch_all_id, catch_all_name
            
    return "unknown", "未知"
