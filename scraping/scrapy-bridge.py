"""
ZENO Browser - Scrapy Bridge
Python-based web scraping bridge for ZENO Browser
Install: pip install scrapy flask

Usage:
  python scrapy-bridge.py

Then call from ZENO:
  POST http://localhost:5000/scrape
  {"url": "https://example.com", "selector": "p"}
"""

import json
import logging
from datetime import datetime
from urllib.parse import urlparse

try:
    from flask import Flask, request, jsonify
    from scrapy import Spider
    from scrapy.crawler import CrawlerProcess
    from scrapy.http import HtmlResponse
    import requests as req
    DEPS_AVAILABLE = True
except ImportError:
    DEPS_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zeno-scrapy-bridge")

app = Flask(__name__) if DEPS_AVAILABLE else None


def simple_scrape(url: str, selector: str = None) -> dict:
    """Simple scraping without full Scrapy (uses requests + basic parsing)."""
    try:
        headers = {"User-Agent": "ZENO-Browser/0.2.0 ScrapyBridge"}
        response = req.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        from html.parser import HTMLParser

        class TextExtractor(HTMLParser):
            def __init__(self):
                super().__init__()
                self.text_parts = []
                self.skip_tags = {"script", "style"}
                self._skip = False

            def handle_starttag(self, tag, attrs):
                if tag in self.skip_tags:
                    self._skip = True

            def handle_endtag(self, tag):
                if tag in self.skip_tags:
                    self._skip = False

            def handle_data(self, data):
                if not self._skip:
                    stripped = data.strip()
                    if stripped:
                        self.text_parts.append(stripped)

        extractor = TextExtractor()
        extractor.feed(response.text)
        text = " ".join(extractor.text_parts)[:5000]

        return {
            "url": url,
            "status": response.status_code,
            "text": text,
            "html_length": len(response.text),
            "scraped_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {"url": url, "error": str(e)}


MAX_BATCH_URLS = 10  # configurable batch size limit
    @app.route("/health")
    def health():
        return jsonify({"status": "ok", "service": "zeno-scrapy-bridge", "version": "0.2.0"})

    @app.route("/scrape", methods=["POST"])
    def scrape():
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"error": "Missing 'url' in request body"}), 400

        url = data["url"]
        selector = data.get("selector")
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return jsonify({"error": "Only http/https URLs allowed"}), 400

        result = simple_scrape(url, selector)
        return jsonify(result)

    @app.route("/batch", methods=["POST"])
    def batch_scrape():
        data = request.get_json()
        urls = data.get("urls", [])
        results = [simple_scrape(u) for u in urls[:MAX_BATCH_URLS]]
        return jsonify({"results": results, "count": len(results)})


if __name__ == "__main__":
    if not DEPS_AVAILABLE:
        print("Install dependencies: pip install flask requests scrapy")
        exit(1)
    logger.info("Starting ZENO Scrapy Bridge on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=False)
