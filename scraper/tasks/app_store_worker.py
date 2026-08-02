import argparse
import csv
import datetime
import gzip
import html as html_module
import json
import logging
import os
import random
import re
import sys
import time
import urllib.request
from dataclasses import asdict, dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Optional

from curl_cffi import requests


SCRAPER_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SCRAPER_DIR))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TARGET_COUNTRIES = (
    "ph", "pk", "ca", "jp", "vn", "id", "br", "eg", "ar", "us", "kr",
    "au", "th", "in", "kz", "tr", "tw", "cl", "ae", "il", "mx", "ng",
    "sg", "za", "sa", "my", "ch", "no", "de", "gb", "dk", "co",
)

APP_CONFIGS = (
    ("6448311069", "ChatGPT"),
    ("6473753684", "Claude"),
    ("6670324846", "Grok AI"),
)

COUNTRY_CURRENCY_MAP = {
    "ae": "AED", "ar": "ARS", "au": "AUD", "br": "BRL", "ca": "CAD",
    "ch": "CHF", "cl": "CLP", "co": "COP", "de": "EUR", "dk": "DKK",
    "eg": "EGP", "gb": "GBP", "id": "IDR", "il": "ILS", "in": "INR",
    "jp": "JPY", "kr": "KRW", "kz": "KZT", "mx": "MXN", "my": "MYR",
    "ng": "NGN", "no": "NOK", "ph": "PHP", "pk": "PKR", "sa": "SAR",
    "sg": "SGD", "th": "THB", "tr": "TRY", "tw": "TWD", "us": "USD",
    "vn": "VND", "za": "ZAR",
}

_CURRENCY_MARKERS = {
    "US$": "USD", "CA$": "CAD", "A$": "AUD", "AU$": "AUD",
    "NT$": "TWD", "S$": "SGD", "MX$": "MXN", "R$": "BRL",
    "₺": "TRY", "₦": "NGN", "₱": "PHP", "₹": "INR", "₫": "VND",
    "₩": "KRW", "￦": "KRW", "£": "GBP", "€": "EUR", "₪": "ILS",
}

_ZERO_DECIMAL_CURRENCIES = {"CLP", "JPY", "KRW", "VND"}
_THREE_DECIMAL_CURRENCIES = {"BHD", "JOD", "KWD"}
_INDONESIAN_UNITS = {
    "ribu": Decimal("1000"), "rb": Decimal("1000"),
    "juta": Decimal("1000000"), "jt": Decimal("1000000"),
}

_DIRECT_PLANS = {
    "6448311069": {
        "chatgpt go": "ChatGPT Go（月付）",
        "chatgpt pro 5x": "ChatGPT Pro 5x（月付）",
        "chatgpt pro 20x": "ChatGPT Pro 20x（月付）",
    },
    "6473753684": {
        "claude pro - monthly": "Claude Pro（月付）",
        "claude pro - annual": "Claude Pro（年付）",
        "claude max 5x - monthly": "Claude Max 5x（月付）",
        "claude max 20x - monthly": "Claude Max 20x（月付）",
    },
    "6670324846": {
        "supergrok heavy": "SuperGrok Heavy（月付）",
    },
}

_PRICE_GROUPS = {
    "6448311069": {"chatgpt plus": "ChatGPT Plus"},
    "6670324846": {
        "supergrok": "SuperGrok",
        "supergrok lite": "SuperGrok Lite",
        "supergrok plus": "SuperGrok Plus",
    },
}

_SINGLE_PERIOD_OVERRIDES = {
    ("6670324846", "ng", "supergrok lite"): "monthly",
    ("6670324846", "ph", "supergrok plus"): "annual",
    ("6670324846", "za", "supergrok plus"): "annual",
    ("6670324846", "co", "supergrok plus"): "annual",
}

_PLAN_ORDER = {
    "ChatGPT Plus（月付）": 10, "ChatGPT Plus（年付）": 20,
    "ChatGPT Go（月付）": 30, "ChatGPT Pro 5x（月付）": 40,
    "ChatGPT Pro 20x（月付）": 50,
    "Claude Pro（月付）": 10, "Claude Pro（年付）": 20,
    "Claude Max 5x（月付）": 30, "Claude Max 20x（月付）": 40,
    "SuperGrok Lite（月付）": 10, "SuperGrok Lite（年付）": 20,
    "SuperGrok（月付）": 30, "SuperGrok（年付）": 40,
    "SuperGrok Plus（月付）": 50, "SuperGrok Plus（年付）": 60,
    "SuperGrok Heavy（月付）": 70,
}

_TEXT_PAIR_PATTERN = re.compile(
    r"""
    <li\b[^>]*>
    (?:(?!</li>).)*?
    <div\b[^>]*class=["'][^"']*\btext-pair\b[^"']*["'][^>]*>
    \s*<span\b[^>]*>(.*?)</span>
    \s*<span\b[^>]*>(.*?)</span>
    (?:(?!</div>).)*?</div>
    (?:(?!</li>).)*?</li>
    """,
    re.IGNORECASE | re.DOTALL | re.VERBOSE,
)


@dataclass(frozen=True)
class ParsedPurchase:
    raw_name: str
    display_name: str
    price_text: str
    occurrence_index: int
    occurrence_count: int


@dataclass(frozen=True)
class FetchResult:
    status: str
    purchases: list[ParsedPurchase]
    source_url: str
    error: Optional[str] = None
    html: str = ""
    http_status: Optional[int] = None
    attempts: int = 0


@dataclass(frozen=True)
class PricedPurchase:
    purchase: ParsedPurchase
    currency: str
    amount: Decimal


@dataclass(frozen=True)
class MappedPurchase:
    subscription_name: str
    priced_purchase: PricedPurchase


@dataclass(frozen=True)
class MappingResult:
    purchases: tuple[MappedPurchase, ...]
    ignored_names: tuple[str, ...]
    unknown_names: tuple[str, ...]


def _plain_text(value: str) -> str:
    return " ".join(html_module.unescape(re.sub(r"<[^>]+>", "", value)).split())


def parse_in_app_purchases(page_html: str) -> list[ParsedPurchase]:
    raw_rows = []
    for raw_name, raw_price in _TEXT_PAIR_PATTERN.findall(page_html):
        name = _plain_text(raw_name)
        price = _plain_text(raw_price)
        if name and re.search(r"\d", price):
            raw_rows.append((name, price))

    totals: dict[str, int] = {}
    for name, _ in raw_rows:
        totals[name] = totals.get(name, 0) + 1

    occurrences: dict[str, int] = {}
    purchases = []
    for name, price in raw_rows:
        occurrences[name] = occurrences.get(name, 0) + 1
        display_name = name if totals[name] == 1 else (
            f"{name} · 选项 {occurrences[name]}"
        )
        purchases.append(ParsedPurchase(
            raw_name=name,
            display_name=display_name,
            price_text=price,
            occurrence_index=occurrences[name],
            occurrence_count=totals[name],
        ))
    return purchases


def extract_numeric_price(
    price_text: str,
    currency: Optional[str] = None,
) -> Optional[Decimal]:
    currency = (currency or "").upper()
    if currency == "IDR":
        abbreviated = re.search(
            r"([\d][\d\s\u00a0\u202f.,']*)\s*(ribu|rb|juta|jt)\b",
            price_text,
            re.IGNORECASE,
        )
        if abbreviated:
            number_text = re.sub(
                r"[\s\u00a0\u202f'.]", "", abbreviated.group(1)
            ).replace(",", ".")
            try:
                return Decimal(number_text) * _INDONESIAN_UNITS[
                    abbreviated.group(2).lower()
                ]
            except InvalidOperation:
                return None

    match = re.search(r"([\d][\d\s\u00a0\u202f.,']*)", price_text)
    if not match:
        return None
    value = re.sub(r"[\s\u00a0\u202f']", "", match.group(1)).rstrip(".,")
    if not value:
        return None

    minor_units = 0 if currency in _ZERO_DECIMAL_CURRENCIES else (
        3 if currency in _THREE_DECIMAL_CURRENCIES else 2
    )
    separator_pos = max(value.rfind("."), value.rfind(","))
    if separator_pos >= 0:
        fractional_digits = len(value) - separator_pos - 1
        separator = value[separator_pos]
        is_decimal = (
            minor_units > 0
            and fractional_digits == minor_units
            and value.count(separator) == 1
        )
        if is_decimal:
            integer_part = re.sub(r"[.,]", "", value[:separator_pos]) or "0"
            normalized = f"{integer_part}.{value[separator_pos + 1:]}"
        else:
            normalized = re.sub(r"[.,]", "", value)
    else:
        normalized = value
    try:
        amount = Decimal(normalized)
    except InvalidOperation:
        return None
    return amount if amount >= 0 else None


def detect_currency(price_text: str, country: str) -> Optional[str]:
    upper_price = price_text.upper()
    for marker, currency in sorted(
        _CURRENCY_MARKERS.items(), key=lambda item: len(item[0]), reverse=True
    ):
        if marker.upper() in upper_price:
            return currency
    iso_match = re.search(r"\b([A-Z]{3})\b", upper_price)
    return iso_match.group(1) if iso_match else COUNTRY_CURRENCY_MAP.get(country)


def _normalize_name(value: str) -> str:
    return " ".join(value.split()).casefold()


def _is_credit(app_id: str, name: str) -> bool:
    if app_id == "6448311069":
        return name == "100 credits"
    if app_id == "6473753684":
        return name.startswith("usage credits (")
    if app_id == "6670324846":
        return name.startswith("extra usage credits ")
    return False


def map_local_prices(
    app_id: str,
    country: str,
    purchases: list[PricedPurchase],
) -> MappingResult:
    direct_plans = _DIRECT_PLANS.get(app_id, {})
    price_groups = _PRICE_GROUPS.get(app_id, {})
    grouped: dict[str, list[PricedPurchase]] = {}
    mapped: dict[str, MappedPurchase] = {}
    ignored_names: set[str] = set()
    unknown_names: set[str] = set()

    for priced in purchases:
        raw_name = priced.purchase.raw_name
        normalized_name = _normalize_name(raw_name)
        if _is_credit(app_id, normalized_name):
            display_name = " ".join(raw_name.split())
            existing = mapped.get(display_name)
            if existing and existing.priced_purchase.amount != priced.amount:
                unknown_names.add(raw_name)
            elif not existing:
                mapped[display_name] = MappedPurchase(display_name, priced)
        elif normalized_name in direct_plans:
            display_name = direct_plans[normalized_name]
            existing = mapped.get(display_name)
            if existing and existing.priced_purchase.amount != priced.amount:
                unknown_names.add(raw_name)
            elif not existing:
                mapped[display_name] = MappedPurchase(display_name, priced)
        elif normalized_name in price_groups:
            grouped.setdefault(normalized_name, []).append(priced)
        else:
            unknown_names.add(raw_name)

    for normalized_name, group in grouped.items():
        by_amount: dict[Decimal, PricedPurchase] = {}
        for priced in group:
            by_amount.setdefault(priced.amount, priced)
        amounts = sorted(by_amount)
        periods = []
        if len(amounts) == 2:
            periods = [("monthly", amounts[0]), ("annual", amounts[1])]
        elif len(amounts) == 1:
            period = _SINGLE_PERIOD_OVERRIDES.get(
                (app_id, country, normalized_name)
            )
            if period:
                periods = [(period, amounts[0])]
        if not periods:
            unknown_names.add(group[0].purchase.raw_name)
            continue

        for period, amount in periods:
            label = "月付" if period == "monthly" else "年付"
            name = f"{price_groups[normalized_name]}（{label}）"
            mapped[name] = MappedPurchase(name, by_amount[amount])

    ordered = tuple(sorted(
        mapped.values(),
        key=lambda item: (_PLAN_ORDER.get(item.subscription_name, 999), item.subscription_name),
    ))
    return MappingResult(
        purchases=ordered,
        ignored_names=tuple(sorted(ignored_names)),
        unknown_names=tuple(sorted(unknown_names)),
    )


class ExchangeRateFetcher:
    RATES_FILE = Path(__file__).with_name("rates.json")

    @classmethod
    def _read_cached_rates(cls) -> dict[str, Any]:
        if not cls.RATES_FILE.exists():
            return {}
        try:
            rates = json.loads(cls.RATES_FILE.read_text(encoding="utf-8"))
            return rates if isinstance(rates, dict) else {}
        except Exception:
            logger.exception("Failed to read cached exchange rates")
            return {}

    @classmethod
    def load_rates(cls) -> dict[str, Any]:
        try:
            logger.info("Fetching latest exchange rates")
            response = requests.get(
                "https://api.exchangerate-api.com/v4/latest/CNY",
                timeout=15,
                impersonate="chrome110",
            )
            response.raise_for_status()
            rates = response.json().get("rates", {})
            if not isinstance(rates, dict) or not rates:
                raise ValueError("Exchange-rate response contains no rates")
            cls.RATES_FILE.write_text(
                json.dumps(rates, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            logger.info("Saved latest exchange rates to %s", cls.RATES_FILE)
            return rates
        except Exception as error:
            logger.exception("Failed to fetch exchange rates")
            cached_rates = cls._read_cached_rates()
            if cached_rates:
                logger.warning("Using cached exchange rates as a fallback")
                return cached_rates
            raise RuntimeError(
                "Could not fetch exchange rates and no local cache is available"
            ) from error

    @classmethod
    def rates_to_cny(cls) -> dict[str, Decimal]:
        rates = cls.load_rates()
        converted = {"CNY": Decimal("1")}
        for currency, value in rates.items():
            try:
                converted[currency.upper()] = Decimal("1") / Decimal(str(value))
            except (ArithmeticError, InvalidOperation, ValueError):
                continue
        return converted


def fetch_app_store_page(app_id: str, country: str) -> FetchResult:
    url = f"https://apps.apple.com/{country}/app/id{app_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    last_html = ""
    last_url = url
    last_status = None
    for attempt in range(1, 3):
        time.sleep(random.uniform(0.5, 1.5) if attempt == 1 else random.uniform(4, 8))
        try:
            response = requests.get(
                url, headers=headers, timeout=20, impersonate="chrome110"
            )
            last_html = response.text
            last_url = str(response.url)
            last_status = response.status_code
            if response.status_code == 404:
                return FetchResult("unavailable", [], last_url, html=last_html,
                                   http_status=last_status, attempts=attempt)
            response.raise_for_status()
            if f"/{country}/" not in last_url.lower() or f"id{app_id}" not in last_url:
                if attempt < 2:
                    continue
                return FetchResult(
                    "wrong_page", [], last_url, f"Unexpected final URL: {last_url}",
                    last_html, last_status, attempt,
                )
            purchases = parse_in_app_purchases(last_html)
            if purchases:
                return FetchResult("success", purchases, last_url, html=last_html,
                                   http_status=last_status, attempts=attempt)
            if attempt == 2:
                return FetchResult(
                    "parse_error", [], last_url, "IAP rows not found",
                    last_html, last_status, attempt,
                )
        except requests.exceptions.HTTPError as error:
            if attempt == 2:
                return FetchResult(
                    "http_error", [], last_url, str(error), last_html,
                    last_status, attempt,
                )
        except Exception as error:
            if attempt == 2:
                return FetchResult(
                    "request_error", [], last_url, str(error), last_html,
                    last_status, attempt,
                )
    return FetchResult("request_error", [], last_url, "Retry limit reached",
                       last_html, last_status, 2)


def write_json(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )


def write_csv_files(output_dir: Path, results: list[dict[str, Any]]) -> None:
    raw_fields = [
        "app_id", "country", "status", "raw_name", "display_name", "price_text",
        "currency", "local_amount", "source_url", "error",
    ]
    with (output_dir / "raw_prices.csv").open(
        "w", newline="", encoding="utf-8-sig"
    ) as output:
        writer = csv.DictWriter(output, fieldnames=raw_fields)
        writer.writeheader()
        for result in results:
            rows = result["raw_purchases"] or [{}]
            for row in rows:
                writer.writerow({
                    "app_id": result["app_id"],
                    "country": result["country"],
                    "status": result["status"],
                    "source_url": result["source_url"],
                    "error": result["error"],
                    **{key: row.get(key) for key in raw_fields if key in row},
                })

    mapped_fields = [
        "app_id", "country", "subscription_name", "raw_name", "price_text",
        "currency", "local_amount", "price_rmb",
    ]
    with (output_dir / "mapped_prices.csv").open(
        "w", newline="", encoding="utf-8-sig"
    ) as output:
        writer = csv.DictWriter(output, fieldnames=mapped_fields)
        writer.writeheader()
        for result in results:
            for row in result["mapped_purchases"]:
                writer.writerow({
                    "app_id": result["app_id"],
                    "country": result["country"],
                    **row,
                })


def print_run_summary(results: list[dict[str, Any]]) -> bool:
    status_counts: dict[str, int] = {}
    failed_results = []
    for result in results:
        status = result["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
        if status != "success":
            failed_results.append(result)

    print("\nApp Store sync summary", flush=True)
    print(f"  Total: {len(results)}", flush=True)
    print(f"  Success: {status_counts.get('success', 0)}", flush=True)
    print(f"  Failed: {len(failed_results)}", flush=True)
    print(
        "  Statuses: " + ", ".join(
            f"{status}={count}" for status, count in sorted(status_counts.items())
        ),
        flush=True,
    )
    for result in failed_results:
        print(
            f"  FAILED {result['app_name']} · {result['country']}: "
            f"{result['status']} - {result['error'] or 'No error details'}",
            flush=True,
        )
    return not failed_results


def revalidate_official_price_cache() -> None:
    url = os.environ.get("REVALIDATE_URL")
    secret = os.environ.get("REVALIDATE_SECRET")
    if not url or not secret:
        return

    request = urllib.request.Request(
        url,
        data=json.dumps({"scope": "official"}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            if response.status != 200:
                logger.warning("Cache revalidation returned HTTP %s", response.status)
    except Exception:
        logger.exception("Failed to revalidate official price cache")


def run(local_only: bool) -> bool:
    started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    output_dir = None
    html_dir = None
    country_dir = None
    if local_only:
        output_dir = (
            SCRAPER_DIR / "debug" / "app_store" /
            datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        )
        html_dir = output_dir / "html"
        country_dir = output_dir / "countries"
        html_dir.mkdir(parents=True, exist_ok=True)
        country_dir.mkdir(parents=True, exist_ok=True)

    # Refresh rates before making any database changes.
    rates = ExchangeRateFetcher.rates_to_cny()

    supabase = None
    if not local_only:
        from core.db import supabase as database
        supabase = database
        for app_id, app_name in APP_CONFIGS:
            supabase.table("apple_store_apps").update({
                "name": app_name,
                "target_countries": list(TARGET_COUNTRIES),
                "is_active": True,
                "updated_at": started_at,
            }).eq("apple_app_id", app_id).execute()

    results = []
    total = len(APP_CONFIGS) * len(TARGET_COUNTRIES)
    current = 0
    for app_id, app_name in APP_CONFIGS:
        for country in TARGET_COUNTRIES:
            current += 1
            print(f"[{current}/{total}] {app_name} · {country}", flush=True)
            fetch = fetch_app_store_page(app_id, country)
            raw_purchases = []
            priced_purchases = []
            for purchase in fetch.purchases:
                currency = detect_currency(purchase.price_text, country)
                amount = extract_numeric_price(purchase.price_text, currency)
                raw_purchases.append({
                    **asdict(purchase),
                    "currency": currency,
                    "local_amount": amount,
                })
                if currency and amount is not None and amount > 0:
                    priced_purchases.append(PricedPurchase(purchase, currency, amount))

            mapping = map_local_prices(app_id, country, priced_purchases)
            status = fetch.status
            error = fetch.error
            mapped_purchases = []
            if fetch.status == "success" and len(priced_purchases) != len(fetch.purchases):
                status = "validation_error"
                error = "One or more source prices could not be parsed"
            elif fetch.status == "success" and mapping.unknown_names:
                status = "mapping_error"
                error = "Unknown products: " + ", ".join(mapping.unknown_names)
            elif fetch.status == "success":
                for mapped in mapping.purchases:
                    priced = mapped.priced_purchase
                    rate = rates.get(priced.currency)
                    if rate is None:
                        status = "rate_error"
                        error = f"Missing exchange rate: {priced.currency}"
                        mapped_purchases = []
                        break
                    mapped_purchases.append({
                        "subscription_name": mapped.subscription_name,
                        "raw_name": priced.purchase.raw_name,
                        "price_text": priced.purchase.price_text,
                        "currency": priced.currency,
                        "local_amount": priced.amount,
                        "price_rmb": (priced.amount * rate).quantize(Decimal("0.01")),
                    })

            if status == "success" and not mapped_purchases:
                status = "mapping_error"
                error = "No subscription prices were mapped"

            if not local_only and status == "success" and mapped_purchases:
                try:
                    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
                    supabase.table("apple_store_prices").upsert([
                        {
                            "apple_app_id": app_id,
                            "country": country,
                            "subscription_name": row["subscription_name"],
                            "original_price_str": row["price_text"],
                            "price_rmb": float(row["price_rmb"]),
                            "updated_at": now,
                        }
                        for row in mapped_purchases
                    ], on_conflict="apple_app_id,country,subscription_name").execute()
                except Exception as database_error:
                    status = "database_error"
                    error = str(database_error)

            result = {
                "app_id": app_id,
                "app_name": app_name,
                "country": country,
                "status": status,
                "http_status": fetch.http_status,
                "attempts": fetch.attempts,
                "source_url": fetch.source_url,
                "error": error,
                "ignored_names": mapping.ignored_names,
                "unknown_names": mapping.unknown_names,
                "raw_purchases": raw_purchases,
                "mapped_purchases": mapped_purchases,
            }
            results.append(result)
            if local_only:
                write_json(country_dir / f"{app_id}_{country}.json", result)
            if local_only and fetch.html:
                with gzip.open(
                    html_dir / f"{app_id}_{country}.html.gz", "wt", encoding="utf-8"
                ) as output:
                    output.write(fetch.html)

            status_counts: dict[str, int] = {}
            for item in results:
                status_counts[item["status"]] = status_counts.get(item["status"], 0) + 1
            if local_only:
                write_json(output_dir / "summary.json", {
                    "started_at": started_at,
                    "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "database_writes": False,
                    "requested_count": total,
                    "completed_count": len(results),
                    "status_counts": status_counts,
                    "results": results,
                })
                write_csv_files(output_dir, results)
            print(
                f"  {status}: {len(mapped_purchases)} subscriptions",
                flush=True,
            )

    succeeded = print_run_summary(results)
    if local_only:
        print(f"Saved to: {output_dir}")
    else:
        print("Database sync finished.")
        if succeeded:
            revalidate_official_price_cache()
    return succeeded


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch ChatGPT, Claude and Grok prices for 32 App Store regions."
    )
    parser.add_argument(
        "--local-only",
        action="store_true",
        help="Do not write Supabase; save raw and mapped diagnostic files locally.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    if not run(local_only=args.local_only):
        sys.exit(1)
