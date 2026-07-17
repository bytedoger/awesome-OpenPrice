import sys
import os

# Ensure the script can find the 'engine' module if run from outside the scraper dir
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine.rule_engine import sync_rules_from_db

if __name__ == "__main__":
    sync_rules_from_db()
