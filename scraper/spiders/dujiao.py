from typing import List, Dict, Any, Optional
import urllib.parse
from spiders.base import BaseSpider

def clean_text(text: Optional[str]) -> str:
    """Normalize text by stripping spaces."""
    if not text:
        return ""
    return str(text).strip()

def localized(value: Any) -> str:
    """Extract localized string, matching JS behavior."""
    if not value:
        return ""
    if isinstance(value, str):
        return clean_text(value)
    if isinstance(value, dict):
        return clean_text(
            value.get("zh-CN") or 
            value.get("zh-TW") or 
            value.get("en-US") or 
            next(iter(value.values()), "")
        )
    return clean_text(str(value))

def number_or_none(value: Any) -> Optional[float]:
    """Parse numeric value safely."""
    try:
        if value is None:
            return None
        return float(value)
    except (ValueError, TypeError):
        return None

class DujiaoSpider(BaseSpider):
    """
    Spider for Dujiao shops that use /api/v1/public/products endpoints.
    """
    
    def crawl(self) -> List[Dict[str, Any]]:
        offers = []
        api_url = f"{self.base_url.rstrip('/')}/api/v1/public/products"
        
        try:
            import requests
            import re
            
            # 1. 优先尝试请求 API 的 config 接口 (适用于前后端分离的版本)
            config_url = f"{self.base_url.rstrip('/')}/api/v1/public/config"
            config_res = self.session.get(config_url, timeout=10)
            if config_res.status_code == 200:
                config_data = config_res.json()
                if isinstance(config_data, dict):
                    site_name = config_data.get("data", {}).get("brand", {}).get("site_name")
                    if site_name:
                        self.extracted_name = str(site_name).strip()
            
            # 2. 如果没获取到，则尝试请求首页 HTML (适用于传统模板版本)
            if not self.extracted_name:
                res = self.session.get(self.base_url, timeout=10)
                if res.status_code == 200:
                    match = re.search(r'<title>(.*?)</title>', res.text, re.IGNORECASE)
                    if match:
                        raw_title = match.group(1).strip()
                        if ' - ' in raw_title:
                            raw_title = raw_title.split(' - ')[0].strip()
                        self.extracted_name = raw_title
        except Exception as e:
            print(f"Failed to fetch Dujiao shop name: {e}")

        try:
            payload = self.fetch_json(api_url)
        except Exception as e:
            print(f"Failed to fetch {api_url}: {e}")
            return offers
            
        products = payload.get("data", [])
        if not isinstance(products, list):
            products = []
            
        for product in products:
            product_title = localized(product.get("title")) or clean_text(product.get("slug"))
            skus = product.get("skus")
            if not isinstance(skus, list) or not skus:
                skus = [None]
                
            for index, sku in enumerate(skus):
                sku_title = ""
                if sku:
                    sku_title = localized(sku.get("title") or sku.get("name") or sku.get("label") or sku.get("spec"))
                
                title = product_title
                if sku_title and sku_title != product_title:
                    title = f"{product_title} / {sku_title}"
                elif len(skus) > 1 and sku:
                    title = f"{product_title} / 规格{index + 1}"
                    
                title = clean_text(title)
                
                price_val = None
                if sku:
                    price_val = sku.get("price_amount")
                if price_val is None:
                    price_val = product.get("price_amount")
                price = number_or_none(price_val)
                
                if not title or price is None:
                    continue
                    
                # Determine stock count
                stock_count = None
                stock_fields = []
                if sku:
                    stock_fields.extend([sku.get("auto_stock_available"), sku.get("manual_stock_available")])
                stock_fields.extend([product.get("auto_stock_available"), product.get("manual_stock_available")])
                
                for field in stock_fields:
                    val = number_or_none(field)
                    if val is not None:
                        stock_count = int(val)
                        break
                        
                # Determine status
                is_sold_out = False
                if sku and sku.get("is_sold_out"):
                    is_sold_out = True
                elif product.get("is_sold_out"):
                    is_sold_out = True
                    
                stock_status = ""
                if sku:
                    stock_status = str(sku.get("stock_status") or "")
                if not stock_status:
                    stock_status = str(product.get("stock_status") or "")
                    
                if is_sold_out or stock_status == "out_of_stock" or (stock_count is not None and stock_count <= 0):
                    status = "out_of_stock"
                else:
                    status = "in_stock"
                    
                slug = str(product.get("slug") or product.get("id"))
                url = f"{self.base_url.rstrip('/')}/products/{urllib.parse.quote(slug)}"
                
                offer = self.format_offer(title, price, url, status, stock_count)
                offers.append(offer)
                
        return offers
