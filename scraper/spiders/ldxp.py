from typing import List, Dict, Any
from urllib.parse import urlparse
from spiders.base import BaseSpider

class LdxpSpider(BaseSpider):
    """
    Spider for ldxp-style sites that use /shopApi/Shop/info endpoints.
    """
    
    def __init__(self, source_id: str, source_name: str, base_url: str):
        super().__init__(source_id, source_name, base_url)
        path = urlparse(base_url).path
        self.token = path.split('/')[-1] if '/' in path else ''
        self.api_base = self.base_url.split('/shop/')[0]

    def crawl(self) -> List[Dict[str, Any]]:
        offers = []
        
        # 0. Fetch shop info to get nickname
        try:
            info_url = f"{self.api_base}/shopApi/Shop/info"
            info_payload = {"token": self.token}
            info_res = self.session.post(info_url, json=info_payload).json()
            if info_res.get('code') == 1 and info_res.get('data'):
                nickname = info_res['data'].get('nickname')
                if nickname:
                    self.extracted_name = nickname
        except Exception as e:
            print(f"Failed to fetch shop info for {self.source_id}: {e}")
        
        # 1. Fetch categories
        cat_url = f"{self.api_base}/shopApi/Shop/categoryList"
        cat_payload = {"token": self.token, "goods_type": "card", "category_key": ""}
        
        cat_res = self.session.post(cat_url, json=cat_payload).json()
        if cat_res.get('code') != 1:
            print(f"Failed to fetch categories for {self.source_id}")
            return offers
            
        categories = cat_res.get('data', [])
        
        # 2. Fetch goods for each category
        for category in categories:
            cat_id = category.get('id')
            if not cat_id:
                continue
                
            for page in range(1, 11):
                goods_url = f"{self.api_base}/shopApi/Shop/goodsList"
                goods_payload = {
                    "token": self.token,
                    "keywords": "",
                    "category_id": cat_id,
                    "goods_type": "card",
                    "current": page,
                    "pageSize": 100
                }
                
                goods_res = self.session.post(goods_url, json=goods_payload).json()
                if goods_res.get('code') != 1:
                    break
                    
                items = goods_res.get('data', {}).get('list', [])
                if not items:
                    break
                    
                for item in items:
                    title = item.get('name')
                    price = float(item.get('price') or item.get('real_price') or 0)
                    item_url = item.get('link') or f"{self.api_base}/item/{item.get('goods_key')}"
                    
                    status_val = int(item.get('status', 1))
                    stock = int(item.get('extend', {}).get('stock_count', 0))
                    
                    if status_val != 1 or stock <= 0:
                        stock_status = 'out_of_stock'
                    else:
                        stock_status = 'in_stock'
                        
                    offer = self.format_offer(title, price, item_url, stock_status, stock)
                    offers.append(offer)
                    
                if len(items) < 100:
                    break
                    
        return offers
