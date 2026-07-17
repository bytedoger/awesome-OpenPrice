from abc import ABC, abstractmethod
from typing import List, Dict, Any
from core.http_client import session

class BaseSpider(ABC):
    """
    Abstract base class for all store spiders.
    """
    
    def __init__(self, source_id: str, source_name: str, base_url: str):
        self.source_id = source_id
        self.source_name = source_name
        self.base_url = base_url
        self.extracted_name = None
        self.session = session
        
    @abstractmethod
    def crawl(self) -> List[Dict[str, Any]]:
        """
        Executes the crawl logic.
        Returns a list of raw offer dictionaries.
        """
        pass

    def fetch_json(self, url: str, **kwargs) -> Dict:
        """Helper to fetch and parse JSON."""
        response = self.session.get(url, **kwargs)
        response.raise_for_status()
        return response.json()
        
    def format_offer(self, title: str, price: float, url: str, stock_status: str, stock_count: int = None) -> Dict[str, Any]:
        """Helper to format standard offer objects."""
        return {
            "sourceId": self.source_id,
            "sourceName": self.source_name,
            "sourceUrl": self.base_url,
            "sourceTitle": title,
            "price": price,
            "url": url,
            "status": stock_status,
            "stockCount": stock_count
        }
