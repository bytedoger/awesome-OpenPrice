import sys
import unittest
from pathlib import Path
from unittest import mock


SCRAPER_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SCRAPER_DIR))

from spiders.jsonld import JsonLdSpider


class JsonLdSpiderTests(unittest.TestCase):
    def crawl(self, html: str):
        response = mock.Mock(text=html)
        spider = JsonLdSpider("source-id", "自建商城", "https://shop.example/catalog")
        spider.session = mock.Mock()
        spider.session.get.return_value = response
        offers = spider.crawl()
        response.raise_for_status.assert_called_once()
        return spider, offers

    def test_parses_guide_array_contract(self):
        spider, offers = self.crawl("""
        <html><head><title>示例商城 - 商品列表</title></head><body>
        <script type="application/ld+json">
        [{
          "@context": "https://schema.org/", "@type": "Product",
          "name": "ChatGPT Plus 独享账号",
          "offers": {"@type": "Offer", "url": "/product/chatgpt-plus",
            "priceCurrency": "CNY", "price": "145.00",
            "availability": "https://schema.org/InStock",
            "inventoryLevel": {"@type": "QuantitativeValue", "value": 50}}
        }]
        </script></body></html>
        """)

        self.assertEqual(spider.extracted_name, "示例商城")
        self.assertEqual(len(offers), 1)
        self.assertEqual(offers[0]["sourceTitle"], "ChatGPT Plus 独享账号")
        self.assertEqual(offers[0]["price"], 145.0)
        self.assertEqual(offers[0]["url"], "https://shop.example/product/chatgpt-plus")
        self.assertEqual(offers[0]["status"], "in_stock")
        self.assertEqual(offers[0]["stockCount"], 50)

    def test_supports_graph_item_list_and_multiple_offers(self):
        _, offers = self.crawl("""
        <script type="application/ld+json">{
          "@context": "https://schema.org", "@graph": [{
            "@type": "ItemList", "itemListElement": [{"@type": "ListItem", "item": {
              "@type": "Product", "name": "Claude Pro", "url": "/claude",
              "offers": [
                {"@type": "Offer", "name": "月付", "price": 99,
                 "priceCurrency": "CNY", "availability": "OutOfStock"},
                {"@type": "Offer", "name": "年付", "price": 999,
                 "priceCurrency": "CNY", "availability": "InStock"}
              ]
            }}]
          }]
        }</script>
        """)

        self.assertEqual([offer["sourceTitle"] for offer in offers], ["Claude Pro / 月付", "Claude Pro / 年付"])
        self.assertEqual([offer["status"] for offer in offers], ["out_of_stock", "in_stock"])

    def test_skips_malformed_and_incomplete_entries(self):
        _, offers = self.crawl("""
        <script type="application/ld+json">not-json</script>
        <script type="application/ld+json">[
          {"@type":"Product","name":"无币种","offers":{"@type":"Offer","url":"/1","price":1,"availability":"InStock"}},
          {"@type":"Product","name":"未知库存","offers":{"@type":"Offer","url":"/2","price":2,"priceCurrency":"CNY","availability":"BackOrder"}},
          {"@type":"Product","name":"零库存","offers":{"@type":"Offer","url":"/3","price":3,"priceCurrency":"CNY","availability":"InStock","inventoryLevel":{"value":0}}}
        ]</script>
        """)

        self.assertEqual(len(offers), 1)
        self.assertEqual(offers[0]["sourceTitle"], "零库存")
        self.assertEqual(offers[0]["status"], "out_of_stock")


if __name__ == "__main__":
    unittest.main()
