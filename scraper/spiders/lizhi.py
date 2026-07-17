from typing import List, Dict, Any
from spiders.base import BaseSpider

class LizhiSpider(BaseSpider):
    """
    Spider for Lizhi (formerly kami) sites.
    """
    
    def crawl(self) -> List[Dict[str, Any]]:
        offers = []
        base = self.base_url.rstrip('/')
        
        try:
            import requests
            import re
            
            # 尝试通过抓取首页HTML的 title 标签来获取店铺名称
            if not getattr(self, 'extracted_name', None):
                res = requests.get(base, timeout=10)
                if res.status_code == 200:
                    match = re.search(r'<title>(.*?)</title>', res.text, re.IGNORECASE)
                    if match:
                        raw_title = match.group(1).strip()
                        # 发卡站通常用 - 隔开副标题，且前缀常常是 "购物"
                        if ' - ' in raw_title:
                            parts = raw_title.split(' - ')
                            if parts[0] == '购物' and len(parts) > 1:
                                raw_title = parts[1].strip()
                            else:
                                raw_title = parts[0].strip()
                        if raw_title:
                            self.extracted_name = raw_title
        except Exception as e:
            print(f"Failed to fetch Lizhi shop name from HTML: {e}")
        
        for page in range(1, 11):
            url = f"{base}/user/api/index/commodity?limit=100&page={page}"
            try:
                res = self.fetch_json(url)
            except Exception as e:
                print(f"Failed to fetch {url}: {e}")
                break
                
            items = res.get('data', [])
            if not items or not isinstance(items, list):
                break
                
            for item in items:
                title = item.get('name')
                price_raw = item.get('user_price')
                if price_raw is None:
                    price_raw = item.get('price')
                    
                if not title or price_raw is None:
                    continue
                    
                price = float(price_raw)
                item_id = item.get('id')
                item_url = f"{base}/item/{item_id}"
                
                stock = int(item.get('stock', 0))
                hidden = int(item.get('hide', 0)) != 0
                status_val = int(item.get('status', 1))
                disabled = status_val != 1 or hidden
                
                if disabled or stock <= 0:
                    stock_status = 'out_of_stock'
                else:
                    stock_status = 'in_stock'
                    
                offer = self.format_offer(title, price, item_url, stock_status, stock)
                offers.append(offer)
                
            if len(items) < 100:
                break
                
        return offers
