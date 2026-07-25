import sys
from engine.rule_engine import sync_rules_from_db, classify_offer_with_name
from test_worker import strip_display_id

print("1. Syncing rules to fetch display_ids...")
sync_rules_from_db()

print("\n2. Testing classification and stripping...")
test_cases = [
    "Claude Pro ｜成品号 [#017]",
    "ChatGPT Plus 【#034】",
    "Grok Super <#022>"
]

for title in test_cases:
    canonical_id, product_name, matched_d_id = classify_offer_with_name(title)
    final_title = strip_display_id(title, matched_d_id) if matched_d_id else title
    
    print(f"\n原标题: '{title}'")
    print(f"匹配到的 display_id: {matched_d_id}")
    print(f"匹配到的系统类目: {product_name} (ID: {canonical_id})")
    print(f"最终存入数据库的标题: '{final_title}'")
