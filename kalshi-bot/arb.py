"""Risk-free basket arbitrage on Kalshi.

In an event where at most one outcome can win (Kalshi flags these as
mutually exclusive), buying 1 NO on each of N markets pays at least N-1
dollars, whatever happens: every NO pays except the one winner's. So if the
whole basket costs less than N-1 dollars after fees, the profit is locked in.
That happens when the YES bids add up to more than $1, usually because
people overpay for longshots.

  python arb.py                # dry run: list locked-in profits right now
  python arb.py --live         # buy them
  python arb.py --live --loop 60   # keep scanning every 60 seconds

The only risk is "leg risk": orders go in one at a time, and a price can move
before the basket is complete. The bot re-checks prices right before buying
and stops at the first leg that doesn't fill.
"""
import argparse
import csv
import os
import time
from datetime import datetime, timezone

from kalshi import Kalshi, fee, load_key, num, price

HERE = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(HERE, "arb_trades.csv")

MAX_PER_BASKET = 30.0   # dollars
MIN_CASH_LEFT = 20.0
MIN_PROFIT = 0.05       # dollars per basket, after fees
MIN_ROI = 0.01          # profit / cost
MAX_CONTRACTS = 500


def no_basket(legs, budget):
    """legs: [(ticker, yes_bid, size)]. Buying c NO on a set S of mutually exclusive
    markets pays at least c * (len(S) - 1). Pick the c and S with the most locked-in
    profit. Each leg adds c * yes_bid - fee to the profit, so only legs where that is
    positive are worth including."""
    best = None
    top = min(MAX_CONTRACTS, int(max((s for _, _, s in legs), default=0)))
    for c in range(1, top + 1):
        S = [(t, b) for t, b, s in legs if s >= c and 0 < b < 1 and c * b - fee(c, 1 - b) > 0]
        if len(S) < 2:
            continue
        cost = sum(c * (1 - b) + fee(c, 1 - b) for _, b in S)
        profit = c * (len(S) - 1) - cost
        if cost <= budget and (best is None or profit > best["profit"]):
            best = {"count": c, "legs": S, "cost": cost, "profit": profit,
                    "payout": c * (len(S) - 1)}
    if best and best["profit"] >= MIN_PROFIT and best["profit"] / best["cost"] >= MIN_ROI:
        return best
    return None


def scan(client, budget):
    """Find events whose YES bids sum past $1, then confirm sizes on the live order book."""
    found = []
    for ev in client.events(status="open", with_nested_markets="true"):
        if not ev.get("mutually_exclusive"):
            continue
        markets = [m for m in ev.get("markets", []) if m.get("status", "active") in ("active", "open")]
        if sum(price(m, "yes_bid") for m in markets) <= 1:
            continue  # quick filter from the listing; no basket can lock in a profit
        legs = []
        for m in markets:
            b, size = client.best_yes_bid(m["ticker"])
            legs.append((m["ticker"], b, size))
        basket = no_basket(legs, budget)
        if basket:
            found.append({"event": ev["event_ticker"], "title": ev.get("title", ""), **basket})
    return sorted(found, key=lambda b: -b["profit"])


def execute(client, basket):
    """Buy the legs, biggest contributor first. Stop at the first leg that doesn't fully fill."""
    c = basket["count"]
    legs = sorted(basket["legs"], key=lambda leg: -leg[1])
    for i, (ticker, yes_bid) in enumerate(legs):
        done = ", ".join(t for t, _ in legs[:i]) or "none"
        try:
            order = client.buy(ticker, "no", c, 1 - yes_bid)
        except Exception as e:
            raise RuntimeError(f"Leg {ticker} failed: {e}. Already bought NO on: {done}.") from e
        filled = num(order, "fill_count") if ("fill_count" in order or "fill_count_fp" in order) \
            else (c if order.get("status") == "executed" else 0)
        log({"time": datetime.now(timezone.utc).isoformat(), "event": basket["event"], "ticker": ticker,
             "side": "no", "count": c, "price": round(1 - yes_bid, 4), "filled": filled,
             "order_id": order.get("order_id", "")})
        if filled < c:
            raise RuntimeError(f"Leg {ticker} filled {filled}/{c}. Basket incomplete. "
                               f"Already bought NO on: {done}. Check these positions on Kalshi.")


def log(row):
    new = not os.path.exists(LOG_FILE)
    with open(LOG_FILE, "a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(row))
        if new:
            w.writeheader()
        w.writerow(row)


def run_once(client, args):
    budget = MAX_PER_BASKET
    if args.live:
        budget = min(MAX_PER_BASKET, client.balance() - MIN_CASH_LEFT)
        if budget <= 0:
            print("Cash reserve reached. Nothing to do.")
            return False
    baskets = scan(client, budget)
    if not baskets:
        print(f"{datetime.now():%H:%M:%S} No locked-in profits right now.")
        return True
    for b in baskets:
        print(f"{'LIVE' if args.live else 'DRY RUN'}  {b['event']}  {b['title'][:50]}\n"
              f"   buy {b['count']} NO on {len(b['legs'])} markets: cost ${b['cost']:.2f}, "
              f"pays at least ${b['payout']:.2f}, locked profit +${b['profit']:.2f}")
    if args.live:
        b = baskets[0]
        fresh = no_basket([(t, *client.best_yes_bid(t)) for t, _ in b["legs"]], budget)
        if not fresh:
            print("   Prices moved before buying. Skipped.")
            return True
        execute(client, {**b, **fresh})
        print(f"   Bought. Locked profit +${fresh['profit']:.2f}")
    return True


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--live", action="store_true", help="place real orders (default is dry run)")
    ap.add_argument("--loop", type=int, metavar="SECONDS", help="keep scanning every SECONDS")
    args = ap.parse_args()
    client = Kalshi(*load_key()) if args.live else Kalshi()
    try:
        while run_once(client, args) and args.loop:
            time.sleep(args.loop)
    except RuntimeError as e:
        raise SystemExit(f"STOPPED: {e}")


if __name__ == "__main__":
    main()
