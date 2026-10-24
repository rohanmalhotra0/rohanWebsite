"""Kalshi bot. Run backtest.py first: live trading is refused unless the
backtest found an edge.

  python bot.py                     # dry run: favorites strategy
  python bot.py --mentions          # dry run: mention-word strategy
  python bot.py --check             # test your API key, show balance
  python bot.py --live [--mentions] # place real orders
"""
import argparse
import csv
import json
import os
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone

from kalshi import (Kalshi, fee, load_key, mention_side, num, price, word_estimate, word_of,
                    MIN_HISTORY)

HERE = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(HERE, "trades.csv")

# Risk limits (dollars). Tuned for a $100 account.
MAX_PER_MARKET = 10.0   # favorites: most you can lose on one market
MAX_PER_MENTION = 5.0   # mentions: smaller, these are riskier
MAX_PER_EVENT = 15.0    # markets in one event win or lose together
MAX_TOTAL = 50.0        # most cash the bot puts at risk
MIN_CASH_LEFT = 40.0    # never trade the balance below this
MIN_VOLUME_24H = 500
MAX_SPREAD = 0.02
# Used only for dry runs before any backtest exists.
DEFAULT_RANGE, DEFAULT_HOURS = (0.90, 0.96), 24


def load(name):
    path = os.path.join(HERE, name)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def sized(m, side, p, max_cost):
    count = int(max_cost // p)
    cost = count * p + fee(count, p)
    if count < 1 or count - cost <= 0:
        return None
    return {"ticker": m["ticker"], "event": m.get("event_ticker", m["ticker"]),
            "title": m.get("title", ""), "word": word_of(m), "side": side, "price": p,
            "count": count, "cost": cost, "profit": count - cost}


def favorites(client, held, edges):
    """Buy the side whose price sits in a range the backtest found profitable."""
    if edges:
        ranges = [(e["lo"], e["hi"]) for e in edges["edges"]]
        series, hours = edges["series"], edges["hours_before_close"]
    else:
        ranges, series, hours = [DEFAULT_RANGE], [None], DEFAULT_HOURS
    now = int(time.time())
    picks = []
    for s in series:
        extra = {"series_ticker": s} if s else {"mve_filter": "exclude"}
        for m in client.markets(status="open", min_close_ts=now, max_close_ts=now + int(hours * 3600), **extra):
            if m["ticker"] in held or num(m, "volume_24h") < MIN_VOLUME_24H:
                continue
            for side in ("yes", "no"):
                ask, bid = price(m, f"{side}_ask"), price(m, f"{side}_bid")
                if ask - bid <= MAX_SPREAD and any(lo <= ask < hi for lo, hi in ranges):
                    pick = sized(m, side, ask, MAX_PER_MARKET)
                    if pick:
                        picks.append(pick)
    # Highest price first = most likely to win.
    return sorted(picks, key=lambda p: -p["price"])


def mentions(client, held, words):
    """Buy YES on words said far more often than the price implies, NO on the reverse."""
    picks = []
    for s in words["series"]:
        bh, bn = words["base"].get(s, (0, 0))
        for m in client.markets(series_ticker=s, status="open"):
            hits, n = words["words"].get(f"{s}|{word_of(m)}", (0, 0))
            if m["ticker"] in held or n < MIN_HISTORY:
                continue
            est = word_estimate(hits, n, bh / bn if bn else 0.5)
            choice = mention_side(est, price(m, "yes_ask"), price(m, "yes_bid"), words["margin"])
            if choice:
                pick = sized(m, *choice, MAX_PER_MENTION)
                if pick:
                    pick["edge"] = abs(est - (choice[1] if choice[0] == "yes" else 1 - choice[1]))
                    picks.append(pick)
    return sorted(picks, key=lambda p: -p["edge"])


def within_budget(picks, budget, one_per_event):
    out, per_event, spent = [], defaultdict(float), 0.0
    for p in picks:
        ev = p["event"]
        if (one_per_event and per_event[ev]) or per_event[ev] + p["cost"] > MAX_PER_EVENT \
                or spent + p["cost"] > budget:
            continue
        out.append(p)
        per_event[ev] += p["cost"]
        spent += p["cost"]
    return out


def proven(args, edges, words):
    """Live trading only with a backtest that found a real edge (or --force)."""
    if args.force:
        return True
    if args.mentions:
        if words and words.get("roi_lo") is not None and words["roi_lo"] > 0:
            return True
        print("Backtest did not prove the mention strategy makes money. Not trading.")
    else:
        if edges and edges["edges"]:
            return True
        print("Backtest found no profitable price range. Not trading.")
    print("Run backtest.py first. Use --force to trade anyway (not recommended).")
    return False


def log(row):
    new = not os.path.exists(LOG_FILE)
    with open(LOG_FILE, "a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(row))
        if new:
            w.writeheader()
        w.writerow(row)


def run(args):
    edges, words = load("edges.json"), load("words.json")
    if args.mentions and not words:
        sys.exit("No words.json yet. Run backtest.py on mention series first.")
    if args.live and not proven(args, edges, words):
        return
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

    found = mentions(client, held, words) if args.mentions else favorites(client, held, edges)
    picks = within_budget(found, budget, one_per_event=not args.mentions)
    if not picks:
        print("No markets pass the filters right now. Try again later.")
        return
    print(f"{'LIVE' if args.live else 'DRY RUN'}: {len(picks)} trades, ${sum(p['cost'] for p in picks):.2f} at risk, "
          f"${sum(p['profit'] for p in picks):.2f} max profit if all win\n")
    for p in picks:
        label = p["word"] if args.mentions else p["title"]
        line = (f"{p['side'].upper():3} {p['count']:>3} @ ${p['price']:.2f}  cost ${p['cost']:.2f}  "
                f"win +${p['profit']:.2f}  {p['ticker']}  {label[:50]}")
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
    ap.add_argument("--mentions", action="store_true", help="use the mention-word strategy")
    ap.add_argument("--force", action="store_true", help="trade live even without a proven edge")
    run(ap.parse_args())


if __name__ == "__main__":
    main()
