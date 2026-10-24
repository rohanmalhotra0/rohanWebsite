"""Kalshi "heavy favorite" bot.

Strategy: buy the side (YES or NO) of markets that close soon and trade at
90-96c, i.e. outcomes the market thinks are ~90-96% likely. Research on Kalshi
data shows longshots are overpriced and heavy favorites slightly underpriced,
so this side of the book has the best odds. The edge is thin: each win pays a
few cents per contract, and one loss wipes out ~15-20 wins. It is NOT a
guaranteed profit.

Dry run by default. Pass --live to place real orders.
"""
import argparse
import base64
import csv
import math
import os
import sys
import time
import uuid
from datetime import datetime, timezone

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

BASE = "https://api.elections.kalshi.com"
API = "/trade-api/v2"

# Risk limits (dollars). Tuned for a $100 account.
MAX_PER_MARKET = 10.0   # most you can lose on one market
MAX_TOTAL = 50.0        # most cash the bot will put at risk; rest stays as reserve
MIN_CASH_LEFT = 40.0    # never trade the balance below this
MIN_PRICE, MAX_PRICE = 0.90, 0.96
MAX_SPREAD = 0.02
MIN_VOLUME_24H = 500
MAX_HOURS_TO_CLOSE = 24
FEE_RATE = 0.07         # Kalshi taker fee: ceil(0.07 * C * P * (1-P)) to the cent
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trades.csv")


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
        headers = {}
        if self.private_key:
            ts = str(int(time.time() * 1000))
            headers = {
                "KALSHI-ACCESS-KEY": self.key_id,
                "KALSHI-ACCESS-TIMESTAMP": ts,
                "KALSHI-ACCESS-SIGNATURE": sign(self.private_key, ts, method, path),
            }
        r = self.s.request(method, BASE + path, params=params, json=body, headers=headers, timeout=20)
        return r

    def get(self, endpoint, params=None):
        r = self._req("GET", endpoint, params=params)
        r.raise_for_status()
        return r.json()

    def balance(self):
        d = self.get("/portfolio/balance")
        if "balance_dollars" in d:
            return float(d["balance_dollars"])
        return d["balance"] / 100

    def held_tickers(self):
        d = self.get("/portfolio/positions", {"limit": 1000})
        held = set()
        for p in d.get("market_positions", []):
            if num(p, "position") != 0:
                held.add(p["ticker"])
        return held

    def open_markets(self, max_hours):
        now = int(time.time())
        params = {"status": "open", "limit": 1000, "min_close_ts": now,
                  "max_close_ts": now + int(max_hours * 3600), "mve_filter": "exclude"}
        out, cursor = [], None
        while True:
            if cursor:
                params["cursor"] = cursor
            d = self.get("/markets", params)
            out += d.get("markets", [])
            cursor = d.get("cursor")
            if not cursor:
                return out

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


# ---------- strategy ----------

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


def fee(count, p):
    return math.ceil(round(FEE_RATE * count * p * (1 - p) * 100, 6)) / 100


def pick_trades(markets, held, budget):
    candidates = []
    for m in markets:
        if m["ticker"] in held or num(m, "volume_24h") < MIN_VOLUME_24H:
            continue
        for side in ("yes", "no"):
            ask, bid = price(m, f"{side}_ask"), price(m, f"{side}_bid")
            if not (MIN_PRICE <= ask <= MAX_PRICE) or ask - bid > MAX_SPREAD:
                continue
            count = int(MAX_PER_MARKET // ask)
            cost = count * ask + fee(count, ask)
            profit = count - cost
            if count < 1 or profit <= 0:
                continue
            candidates.append({"ticker": m["ticker"], "event": m.get("event_ticker"),
                               "title": m.get("title", ""), "side": side, "price": ask,
                               "count": count, "cost": cost, "profit": profit,
                               "close": m.get("close_time", "")})
    # Highest price first = most likely to win. One market per event to avoid
    # correlated losses.
    candidates.sort(key=lambda c: -c["price"])
    picks, events, spent = [], set(), 0.0
    for c in candidates:
        if c["event"] in events or spent + c["cost"] > budget:
            continue
        picks.append(c)
        events.add(c["event"])
        spent += c["cost"]
    return picks


def log(row):
    new = not os.path.exists(LOG_FILE)
    with open(LOG_FILE, "a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(row))
        if new:
            w.writeheader()
        w.writerow(row)


def run(args):
    if args.live or args.check:
        client = Kalshi(*load_key())
        cash = client.balance()
        print(f"Balance: ${cash:.2f}")
        if args.check:
            return
        held = client.held_tickers()
        budget = min(MAX_TOTAL, cash - MIN_CASH_LEFT)
    else:
        client, held, budget = Kalshi(), set(), MAX_TOTAL
    if budget <= 0:
        print("Budget used up (cash reserve reached). Nothing to do.")
        return

    picks = pick_trades(client.open_markets(MAX_HOURS_TO_CLOSE), held, budget)
    if not picks:
        print("No markets pass the filters right now. Try again later.")
        return
    total_cost = sum(p["cost"] for p in picks)
    print(f"{'LIVE' if args.live else 'DRY RUN'}: {len(picks)} trades, ${total_cost:.2f} at risk, "
          f"${sum(p['profit'] for p in picks):.2f} max profit if all win\n")
    for p in picks:
        line = (f"{p['side'].upper():3} {p['count']:>3} @ ${p['price']:.2f}  cost ${p['cost']:.2f}  "
                f"win +${p['profit']:.2f}  {p['ticker']}  {p['title'][:60]}")
        if args.live:
            try:
                order = client.buy(p["ticker"], p["side"], p["count"], p["price"])
                status = order.get("status", "?")
                line += f"  -> {status}"
                log({"time": datetime.now(timezone.utc).isoformat(), **p, "status": status,
                     "order_id": order.get("order_id", "")})
            except Exception as e:
                print(line + f"  -> FAILED: {e}")
                print("Stopping so nothing else goes wrong.")
                return
        print(line)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--live", action="store_true", help="place real orders (default is dry run)")
    ap.add_argument("--check", action="store_true", help="only test your API key and show balance")
    run(ap.parse_args())


if __name__ == "__main__":
    main()
