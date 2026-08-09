import json
import math
from html.parser import HTMLParser
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import urljoin

from spiders.base import BaseSpider


class _StructuredDataParser(HTMLParser):
    """Collect JSON-LD blocks and the document title without HTML dependencies."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.jsonld_blocks: List[str] = []
        self.title_parts: List[str] = []
        self._in_jsonld = False
        self._in_title = False
        self._script_parts: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[tuple]) -> None:
        attributes = {str(key).lower(): value for key, value in attrs}
        if tag.lower() == "script" and str(attributes.get("type") or "").lower().split(";")[0].strip() == "application/ld+json":
            self._in_jsonld = True
            self._script_parts = []
        elif tag.lower() == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "script" and self._in_jsonld:
            self.jsonld_blocks.append("".join(self._script_parts).strip())
            self._in_jsonld = False
            self._script_parts = []
        elif tag.lower() == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_jsonld:
            self._script_parts.append(data)
        elif self._in_title:
            self.title_parts.append(data)


def _schema_type(value: Any) -> List[str]:
    values = value if isinstance(value, list) else [value]
    return [str(item).rsplit("/", 1)[-1].lower() for item in values if item]


def _walk_entities(value: Any) -> Iterable[Dict[str, Any]]:
    if isinstance(value, list):
        for item in value:
            yield from _walk_entities(item)
    elif isinstance(value, dict):
        if "@graph" in value:
            yield from _walk_entities(value["@graph"])
        if "itemListElement" in value:
            yield from _walk_entities(value["itemListElement"])
        if "item" in value and "listitem" in _schema_type(value.get("@type")):
            yield from _walk_entities(value["item"])
        yield value


def _number(value: Any) -> Optional[float]:
    try:
        if value is None or isinstance(value, bool):
            return None
        number = float(str(value).strip())
        return number if math.isfinite(number) and number >= 0 else None
    except (TypeError, ValueError):
        return None


def _stock_count(offer: Dict[str, Any]) -> Optional[int]:
    inventory = offer.get("inventoryLevel")
    if isinstance(inventory, dict):
        inventory = inventory.get("value")
    value = _number(inventory)
    return int(value) if value is not None else None


def _stock_status(availability: Any, stock_count: Optional[int]) -> Optional[str]:
    if not availability:
        return None
    status = str(availability).rstrip("/").rsplit("/", 1)[-1].lower()
    if status in {"outofstock", "soldout", "discontinued"}:
        return "out_of_stock"
    if stock_count is not None and stock_count <= 0:
        return "out_of_stock"
    if status in {"instock", "limitedavailability", "onlineonly", "preorder", "presale"}:
        return "in_stock"
    return None


class JsonLdSpider(BaseSpider):
    """Spider for self-built stores following OpenPrice's Schema.org contract."""

    def crawl(self) -> List[Dict[str, Any]]:
        response = self.session.get(self.base_url, timeout=20)
        response.raise_for_status()

        parser = _StructuredDataParser()
        parser.feed(response.text)
        parser.close()

        documents: List[Any] = []
        for block in parser.jsonld_blocks:
            if not block:
                continue
            try:
                documents.append(json.loads(block))
            except (json.JSONDecodeError, TypeError):
                # One malformed third-party block must not hide a valid product block.
                continue

        entities = [entity for document in documents for entity in _walk_entities(document)]
        for entity in entities:
            if any(item in _schema_type(entity.get("@type")) for item in ("website", "organization")):
                name = str(entity.get("name") or "").strip()
                if name:
                    self.extracted_name = name
                    break
        if not self.extracted_name:
            title = " ".join("".join(parser.title_parts).split())
            if title:
                self.extracted_name = title.split(" - ", 1)[0].strip()

        offers: List[Dict[str, Any]] = []
        for product in entities:
            if "product" not in _schema_type(product.get("@type")):
                continue
            product_name = str(product.get("name") or "").strip()
            if not product_name:
                continue

            raw_offers = product.get("offers")
            if isinstance(raw_offers, dict):
                raw_offers = [raw_offers]
            if not isinstance(raw_offers, list):
                continue

            for offer in raw_offers:
                if not isinstance(offer, dict) or "offer" not in _schema_type(offer.get("@type")):
                    continue
                price = _number(offer.get("price"))
                currency = str(offer.get("priceCurrency") or "").strip().upper()
                url = str(offer.get("url") or product.get("url") or "").strip()
                stock_count = _stock_count(offer)
                status = _stock_status(offer.get("availability"), stock_count)
                if price is None or not currency or not url or status is None:
                    continue

                offer_name = str(offer.get("name") or "").strip()
                title = product_name
                if offer_name and offer_name != product_name:
                    title = f"{product_name} / {offer_name}"
                offers.append(self.format_offer(
                    title,
                    price,
                    urljoin(self.base_url, url),
                    status,
                    stock_count,
                ))

        return offers
