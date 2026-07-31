import sys
import json
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path
from unittest import mock


SCRAPER_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SCRAPER_DIR))

from tasks.app_store_worker import (
    ExchangeRateFetcher,
    PricedPurchase,
    extract_numeric_price,
    map_local_prices,
    parse_in_app_purchases,
    print_run_summary,
)


class ExchangeRateFetcherTests(unittest.TestCase):
    def test_fetches_fresh_rates_even_when_cache_exists(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            rates_file = Path(temp_dir) / "rates.json"
            rates_file.write_text(json.dumps({"USD": 1}), encoding="utf-8")
            response = mock.Mock()
            response.json.return_value = {"rates": {"USD": 0.14, "CNY": 1}}

            with mock.patch.object(ExchangeRateFetcher, "RATES_FILE", rates_file), \
                    mock.patch("tasks.app_store_worker.requests.get", return_value=response) as get:
                rates = ExchangeRateFetcher.load_rates()

            get.assert_called_once()
            response.raise_for_status.assert_called_once()
            self.assertEqual(rates["USD"], 0.14)
            self.assertEqual(
                json.loads(rates_file.read_text(encoding="utf-8"))["USD"],
                0.14,
            )

    def test_uses_cache_when_refresh_fails(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            rates_file = Path(temp_dir) / "rates.json"
            rates_file.write_text(json.dumps({"USD": 0.13}), encoding="utf-8")

            with mock.patch.object(ExchangeRateFetcher, "RATES_FILE", rates_file), \
                    mock.patch(
                        "tasks.app_store_worker.requests.get",
                        side_effect=RuntimeError("network error"),
                    ):
                rates = ExchangeRateFetcher.load_rates()

            self.assertEqual(rates, {"USD": 0.13})

    def test_stops_when_refresh_and_cache_are_unavailable(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            rates_file = Path(temp_dir) / "missing.json"

            with mock.patch.object(ExchangeRateFetcher, "RATES_FILE", rates_file), \
                    mock.patch(
                        "tasks.app_store_worker.requests.get",
                        side_effect=RuntimeError("network error"),
                    ):
                with self.assertRaisesRegex(RuntimeError, "no local cache"):
                    ExchangeRateFetcher.load_rates()


class ParseInAppPurchasesTests(unittest.TestCase):
    def test_extracts_rows_without_svelte_class_dependency(self):
        page_html = """
        <ul>
          <li class="future-class">
            <div class="text-pair another-class">
              <span>ChatGPT Plus</span><span>₺999,99</span>
            </div>
          </li>
          <li>
            <div class="another-class text-pair">
              <span>ChatGPT Go</span><span>₺249,99</span>
            </div>
          </li>
        </ul>
        """

        purchases = parse_in_app_purchases(page_html)

        self.assertEqual(
            [(item.display_name, item.price_text) for item in purchases],
            [
                ("ChatGPT Plus", "₺999,99"),
                ("ChatGPT Go", "₺249,99"),
            ],
        )

    def test_duplicate_names_are_numbered_without_guessing_period(self):
        page_html = """
        <li><div class="text-pair"><span>ChatGPT Plus</span><span>₺999,99</span></div></li>
        <li><div class="text-pair"><span>ChatGPT Plus</span><span>₺9.999,99</span></div></li>
        """

        purchases = parse_in_app_purchases(page_html)

        self.assertEqual(
            [item.display_name for item in purchases],
            ["ChatGPT Plus · 选项 1", "ChatGPT Plus · 选项 2"],
        )


class LocalizedPriceTests(unittest.TestCase):
    def test_parses_comma_decimal_and_dot_grouping(self):
        self.assertEqual(
            extract_numeric_price("₺9.999,99", "TRY"),
            Decimal("9999.99"),
        )

    def test_parses_dot_decimal_and_comma_grouping(self):
        self.assertEqual(
            extract_numeric_price("$1,234.56", "USD"),
            Decimal("1234.56"),
        )

    def test_parses_zero_decimal_currency(self):
        self.assertEqual(
            extract_numeric_price("¥1,200", "JPY"),
            Decimal("1200"),
        )

    def test_parses_three_decimal_currency(self):
        self.assertEqual(
            extract_numeric_price("BHD 4.999", "BHD"),
            Decimal("4.999"),
        )

    def test_treats_indonesian_dot_as_grouping(self):
        self.assertEqual(
            extract_numeric_price("Rp 349.000", "IDR"),
            Decimal("349000"),
        )

    def test_expands_indonesian_ribu_suffix(self):
        self.assertEqual(
            extract_numeric_price("Rp 349ribu", "IDR"),
            Decimal("349000"),
        )

    def test_expands_indonesian_juta_suffix_with_decimal_comma(self):
        self.assertEqual(
            extract_numeric_price("Rp 1,889juta", "IDR"),
            Decimal("1889000.000"),
        )

    def test_invalid_price_returns_none(self):
        self.assertIsNone(extract_numeric_price("Unavailable", "USD"))


class LocalPlanMappingTests(unittest.TestCase):
    @staticmethod
    def priced(page_html: str, currency: str = "USD") -> list[PricedPurchase]:
        return [
            PricedPurchase(
                purchase=purchase,
                currency=currency,
                amount=extract_numeric_price(purchase.price_text, currency),
            )
            for purchase in parse_in_app_purchases(page_html)
        ]

    def test_chatgpt_maps_plus_by_price(self):
        result = map_local_prices("6448311069", "us", self.priced("""
        <li><div class="text-pair"><span>ChatGPT Plus</span><span>$200.00</span></div></li>
        <li><div class="text-pair"><span>ChatGPT Plus</span><span>$19.99</span></div></li>
        <li><div class="text-pair"><span>ChatGPT Go</span><span>$8.00</span></div></li>
        <li><div class="text-pair"><span>100 Credits</span><span>$4.00</span></div></li>
        """))

        self.assertEqual(
            [item.subscription_name for item in result.purchases],
            [
                "ChatGPT Plus（月付）", "ChatGPT Plus（年付）",
                "ChatGPT Go（月付）", "100 Credits",
            ],
        )
        self.assertFalse(result.ignored_names)
        self.assertFalse(result.unknown_names)

    def test_claude_maps_explicit_periods_and_keeps_credits(self):
        result = map_local_prices("6473753684", "us", self.priced("""
        <li><div class="text-pair"><span>Claude Pro - Monthly</span><span>$20.00</span></div></li>
        <li><div class="text-pair"><span>Claude Pro - Annual</span><span>$214.99</span></div></li>
        <li><div class="text-pair"><span>Claude Max 5x - Monthly</span><span>$124.99</span></div></li>
        <li><div class="text-pair"><span>Claude Max 20x - Monthly</span><span>$249.99</span></div></li>
        <li><div class="text-pair"><span>Usage Credits (20)</span><span>$28.00</span></div></li>
        """))

        self.assertEqual(len(result.purchases), 5)
        self.assertEqual(result.purchases[-1].subscription_name, "Usage Credits (20)")
        self.assertFalse(result.ignored_names)
        self.assertFalse(result.unknown_names)

    def test_grok_deduplicates_monthly_and_maps_higher_price_to_annual(self):
        result = map_local_prices("6670324846", "us", self.priced("""
        <li><div class="text-pair"><span>SuperGrok</span><span>$30.00</span></div></li>
        <li><div class="text-pair"><span>SuperGrok</span><span>$300.00</span></div></li>
        <li><div class="text-pair"><span>SuperGrok</span><span>$30.00</span></div></li>
        <li><div class="text-pair"><span>SuperGrok Lite</span><span>$10.00</span></div></li>
        <li><div class="text-pair"><span>SuperGrok Lite</span><span>$100.00</span></div></li>
        <li><div class="text-pair"><span>SuperGrok Heavy</span><span>$300.00</span></div></li>
        <li><div class="text-pair"><span>Extra Usage Credits 5 USD</span><span>$5.00</span></div></li>
        """))

        self.assertEqual(
            [item.subscription_name for item in result.purchases],
            [
                "SuperGrok Lite（月付）", "SuperGrok Lite（年付）",
                "SuperGrok（月付）", "SuperGrok（年付）",
                "SuperGrok Heavy（月付）",
                "Extra Usage Credits 5 USD",
            ],
        )
        self.assertFalse(result.unknown_names)

    def test_grok_maps_verified_single_plus_price_as_annual(self):
        result = map_local_prices("6670324846", "ph", self.priced("""
        <li><div class="text-pair"><span>SuperGrok Plus</span><span>$999.00</span></div></li>
        """))
        self.assertEqual(
            [item.subscription_name for item in result.purchases],
            ["SuperGrok Plus（年付）"],
        )

    def test_unknown_product_blocks_country_write(self):
        result = map_local_prices("6670324846", "us", self.priced("""
        <li><div class="text-pair"><span>Future Grok Plan</span><span>$1.00</span></div></li>
        """))
        self.assertEqual(result.unknown_names, ("Future Grok Plan",))


class RunSummaryTests(unittest.TestCase):
    def test_returns_success_only_when_every_region_succeeds(self):
        successful_result = {
            "app_name": "ChatGPT",
            "country": "us",
            "status": "success",
            "error": None,
        }
        failed_result = {
            "app_name": "Claude",
            "country": "de",
            "status": "parse_error",
            "error": "IAP rows not found",
        }

        self.assertTrue(print_run_summary([successful_result]))
        self.assertFalse(print_run_summary([successful_result, failed_result]))


if __name__ == "__main__":
    unittest.main()
