import requests
import time
import random
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class PacingSession(requests.Session):
    def request(self, method, url, **kwargs):
        # 每次真正发请求前，强制随机休眠 
        sleep_time = random.uniform(3, 7)
        print(f"  [PacingSession] Delaying {sleep_time:.2f}s -> {method} {url}")
        time.sleep(sleep_time)
        return super().request(method, url, **kwargs)

def get_session():
    """Returns a requests Session with retries configured."""
    session = PacingSession()
    
    # Retry on 429, 500, 502, 503, 504
    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )
    
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    # Optional default headers mimicking a real browser
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive"
    })
    
    return session

session = get_session()
