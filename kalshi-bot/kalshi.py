"""Kalshi API client and helpers shared by bot.py and backtest.py."""
import base64
import math
import os
import sys
import time
import uuid
from datetime import datetime

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

BASE = "https://api.elections.kalshi.com"
API = "/trade-api/v2"
FEE_RATE = 0.07  # Kalshi taker fee: ceil(0.07 * C * P * (1-P)) to the cent

# Mention-word model: shrink each word's hit rate toward the series average.
PRIOR_WEIGHT = 3
MIN_HISTORY = 3


# ---------- auth ----------

def load_key():
    key_id = os.environ.get("KALSHI_API_KEY_ID")
    pem = os.environ.get("KALSHI_PRIVATE_KEY")
    path = os.environ.get("KALSHI_PRIVATE_KEY_PATH")
    if path:
        with open(path, "rb") as f:
            pem = f.read().decode()
    if not key_id or not pem:
        sys.exit("Set KALSHI_API_KEY_ID and KALSHI_PRIVATE_KEY (or KALSHI_PRIVATE_KEY_PATH).")
    pem = pem.replace("\\n", "\n").strip()
    return key_id, serialization.load_pem_private_key(pem.encode(), password=None)


def sign(private_key, timestamp_ms, method, path):
    msg = f"{timestamp_ms}{method}{path}".encode()
    sig = private_key.sign(
        msg,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.DIGEST_LENGTH),
        hashes.SHA256(),
    )
    return base64.b64encode(sig).decode()


class Kalshi:
    def __init__(self, key_id=None, private_key=None):
        self.key_id, self.private_key = key_id, private_key
        self.s = requests.Session()

    def _req(self, method, endpoint, params=None, body=None):
        path = API + endpoint
        for attempt in range(5):
            headers = {}
            if self.private_key:
                ts_ms = str(int(time.time() * 1000))
                headers = {
                    "KALSHI-ACCESS-KEY": self.key_id,
                    "KALSHI-ACCESS-TIMESTAMP": ts_ms,
                    "KALSHI-ACCESS-SIGNATURE": sign(self.private_key, ts_ms, method, path),
                }
            time.sleep(0.07)  # stay under the basic tier's ~20 requests/second
            r = self.s.request(method, BASE + path, params=params, json=body, headers=headers, timeout=30)
            if r.status_code != 429:
                return r
            time.sleep(2 ** attempt)
        return r

    def get(self, endpoint, params=None):
        r = self._req("GET", endpoint, params=params)
        r.raise_for_status()
        return r.json()

    def paginate(self, endpoint, key, params=None, limit=None):
        params, out = dict(params or {}), []
        while True:
            d = self.get(endpoint, params)
            out += d.get(key, [])
            if not d.get("cursor") or (limit and len(out) >= limit):
                return out[:limit] if limit else out
            params["cursor"] = d["cursor"]

    def markets(self, limit=None, **params):
        return self.paginate("/markets", "markets", {"limit": 1000, **params}, limit)

    def settled_markets(self, series, limit=None):
        """Recent settled markets, plus older ones if Kalshi has moved them to /historical."""
        found = {m["ticker"]: m for m in self.markets(limit, series_ticker=series, status="settled")}
        try:
            for m in self.paginate("/historical/markets", "markets",
                                   {"limit": 1000, "series_ticker": series}, limit):
                found.setdefault(m["ticker"], m)
        except requests.HTTPError:
            pass
        return list(found.values())

    def series(self, category=None):
        return self.paginate("/series", "series", {"category": category} if category else {})

    def candles(self, series, ticker, start_ts, end_ts, period=60):
        d = self.get(f"/series/{series}/markets/{ticker}/candlesticks",
                     {"start_ts": int(start_ts), "end_ts": int(end_ts), "period_interval": period})
        return d.get("candlesticks", [])

    def balance(self):
        d = self.get("/portfolio/balance")
        if "balance_dollars" in d:
            return float(d["balance_dollars"])
        return d["balance"] / 100

    def held_tickers(self):
        positions = self.paginate("/portfolio/positions", "market_positions", {"limit": 1000})
        return {p["ticker"] for p in positions if num(p, "position") != 0}

    def buy(self, ticker, side, count, price):
        """Immediate-or-cancel limit buy. Tries the fixed-point body first, then the
        legacy integer body. A 400 means no order was created, and the shared
        client_order_id stops a double fill either way."""
        coid = str(uuid.uuid4())
        base = {"ticker": ticker, "client_order_id": coid, "action": "buy", "side": side,
                "time_in_force": "immediate_or_cancel"}
        bodies = [
            {**base, "count_fp": f"{count:.2f}", f"{side}_price_dollars": f"{price:.4f}"},
            {**base, "count": count, "type": "limit", f"{side}_price": round(price * 100)},
        ]
        for body in bodies:
            r = self._req("POST", "/portfolio/orders", body=body)
            if r.status_code < 300:
                return r.json().get("order", r.json())
            if r.status_code != 400:
                break
        raise RuntimeError(f"Order rejected ({r.status_code}): {r.text[:300]}")


# ---------- field helpers (handle new fixed-point and legacy integer fields) ----------

def num(d, field):
    """Read a count field that may be fixed-point (`x_fp`) or a legacy integer."""
    v = d.get(f"{field}_fp", d.get(field, 0))
    return float(v or 0)


def price(d, field):
    """Read a price in dollars from `x_dollars` or legacy integer cents."""
    if d.get(f"{field}_dollars") not in (None, ""):
        return float(d[f"{field}_dollars"])
    v = d.get(field)
    return v / 100 if v else 0.0


def candle_close(candle, field):
    """Closing yes_bid / yes_ask / price of an hourly candle, in dollars."""
    return price(candle.get(field) or {}, "close")


def ts(iso):
    return int(datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp())


def fee(count, p):
    return math.ceil(round(FEE_RATE * count * p * (1 - p) * 100, 6)) / 100


def fee_per_contract(p):
    """Fee per contract for a large order, where cent rounding stops mattering."""
    return FEE_RATE * p * (1 - p)


# ---------- mention-market model ----------

def word_of(m):
    """The word or phrase a mention market is about, e.g. "tariff"."""
    for k in ("yes_sub_title", "subtitle"):
        if m.get(k):
            return m[k].strip().lower()
    return m["ticker"].rsplit("-", 1)[-1].lower()


def word_estimate(hits, n, base_rate):
    """Chance the word gets said, from its own history shrunk toward the series average."""
    return (hits + PRIOR_WEIGHT * base_rate) / (n + PRIOR_WEIGHT)


def mention_side(est, yes_ask, yes_bid, margin):
    """Which side to buy (and at what price) when history disagrees with the market."""
    if 0 < yes_ask < 0.99 and est - yes_ask >= margin:
        return "yes", yes_ask
    if 0.01 < yes_bid < 1 and yes_bid - est >= margin:
        return "no", 1 - yes_bid
    return None
