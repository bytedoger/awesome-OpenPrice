from spiders.ldxp import LdxpSpider
from spiders.dujiao import DujiaoSpider
from spiders.lizhi import LizhiSpider
from spiders.jsonld import JsonLdSpider

# Map string scraper_type from DB to Python classes
SPIDER_REGISTRY = {
    "ldxp": LdxpSpider,
    "dujiao": DujiaoSpider,
    "lizhi": LizhiSpider,
    "jsonld": JsonLdSpider,
}
