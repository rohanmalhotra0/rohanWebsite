"""Test strategies on Kalshi's settled markets before risking money.

  python backtest.py --find trump                 # list series whose name matches
  python backtest.py --series KXSERIES1 KXSERIES2 # run both tests on those series

Writes edges.json (price ranges that made money) and words.json (mention-word
history). bot.py refuses to trade live unless these show a real edge.
No API key needed: settled market data is public.
"""
import argparse
import json
import os
import statistics
from collections import defaultdict

from kalshi import (Kalshi, MIN_HISTORY, candle_close, fee_per_contract, mention_side, num,
                    price, ts, word_estimate, word_of)

HERE = os.path.dirname(os.path.abspath(__file__))
BUCKETS = [0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 0.95, 1.0]
MIN_VOLUME = 100
MIN_TRADES, MIN_EVENTS = 30, 10
MARGINS = [0.10, 0.15, 0.20, 0.25]


def snapshot(client, series, m, hours_before_close, hours_after_open):
    """Best yes bid/ask at the decision time, from hourly candles."""
    open_t, close_t = ts(m["open_time"]), ts(m["close_time"])
    t = open_t + hours_after_open * 3600 if hours_after_open is not None else close_t - hours_before_close * 3600
    if not open_t < t < close_t:
        return None
    for c in reversed(client.candles(series, m["ticker"], t - 12 * 3600, t)):
        if c.get("end_period_ts", 0) > t:
            continue
        ask, bid = candle_close(c, "yes_ask"), candle_close(c, "yes_bid")
        if 0 < ask <= 1:
            return ask, bid
    return None


def load_observations(client, series, args):
    """One row per settled market: price at decision time and how it settled. Cached."""
    os.makedirs(os.path.join(HERE, "data"), exist_ok=True)
    when = f"open{args.hours_after_open}" if args.hours_after_open is not None else f"close{args.hours_before_close}"
    cache = os.path.join(HERE, "data", f"{series}_{when}.json")
    if os.path.exists(cache) and not args.refresh:
        with open(cache) as f:
            return json.load(f)
    obs = []
    markets = [m for m in client.settled_markets(series, args.max_markets)
               if m.get("result") in ("yes", "no") and num(m, "volume") >= MIN_VOLUME]
    print(f"  {series}: {len(markets)} settled markets, fetching prices...")
    for i, m in enumerate(markets):
        snap = snapshot(client, series, m, args.hours_before_close, args.hours_after_open)
        if snap:
            obs.append({"series": series, "event": m.get("event_ticker", m["ticker"]),
                        "ticker": m["ticker"], "word": word_of(m), "close": ts(m["close_time"]),
                        "yes_ask": snap[0], "yes_bid": snap[1], "result": m["result"]})
        if i % 200 == 199:
            print(f"    {i + 1}/{len(markets)}")
    with open(cache, "w") as f:
        json.dump(obs, f)
    return obs


def roi_stats(trades, z):
    """ROI of (event, cost, pnl) trades, with a lower bound that treats trades in the
    same event as one unit, since they tend to win or lose together."""
    by_event = defaultdict(lambda: [0.0, 0.0])
    for event, cost, pnl in trades:
        by_event[event][0] += cost
        by_event[event][1] += pnl
    cost = sum(c for c, _ in by_event.values())
    g = len(by_event)
    if g < 2 or cost == 0:
        return None, None
    roi = sum(p for _, p in by_event.values()) / cost
    var = sum((p - roi * c) ** 2 for c, p in by_event.values()) / cost ** 2 * g / (g - 1)
    return roi, roi - z * var ** 0.5


def buy_trades(o):
    """Both sides of a market as trades: (price paid, won?)."""
    yield o["yes_ask"], o["result"] == "yes"
    if o["yes_bid"] > 0:
        yield 1 - o["yes_bid"], o["result"] == "no"


def calibration(obs):
    """For each price range: if you bought every contract there, did you make money?"""
    # Bonferroni: we test every bucket, so demand more confidence from each one.
    z = statistics.NormalDist().inv_cdf(1 - 0.05 / (len(BUCKETS) - 1))
    trades = defaultdict(list)
    for o in obs:
        for p, won in buy_trades(o):
            if 0.01 <= p <= 0.99:
                b = max(i for i, lo in enumerate(BUCKETS[:-1]) if p >= lo)
                trades[b].append((o["event"], p + fee_per_contract(p), won - p - fee_per_contract(p)))
    rows = []
    for b in sorted(trades):
        t = trades[b]
        roi, lo = roi_stats(t, z)
        wins = sum(1 for _, c, pnl in t if pnl > 0)
        rows.append({"lo": BUCKETS[b], "hi": BUCKETS[b + 1], "trades": len(t),
                     "events": len({e for e, _, _ in t}), "win_rate": wins / len(t),
                     "roi": roi, "roi_lo": lo})
    return rows


def mention_test(obs, margin):
    """Walk forward through time: price each word from earlier events only, trade
    when history and the market disagree by `margin`, then learn the result."""
    hist = defaultdict(lambda: [0, 0])    # (series, word) -> [hits, n]
    base = defaultdict(lambda: [0, 0])    # series -> [hits, n]
    trades = []
    by_event = defaultdict(list)
    for o in obs:
        by_event[o["event"]].append(o)
    for event in sorted(by_event, key=lambda e: by_event[e][0]["close"]):
        for o in by_event[event]:
            hits, n = hist[(o["series"], o["word"])]
            bh, bn = base[o["series"]]
            if n < MIN_HISTORY:
                continue
            est = word_estimate(hits, n, bh / bn if bn else 0.5)
            pick = mention_side(est, o["yes_ask"], o["yes_bid"], margin)
            if pick:
                side, p = pick
                won = o["result"] == side
                trades.append((event, p + fee_per_contract(p), won - p - fee_per_contract(p)))
        for o in by_event[event]:
            hit = o["result"] == "yes"
            hist[(o["series"], o["word"])][0] += hit
            hist[(o["series"], o["word"])][1] += 1
            base[o["series"]][0] += hit
            base[o["series"]][1] += 1
    return trades, hist, base


def fmt(x):
    return "   n/a" if x is None else f"{x:+6.1%}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--find", help="list series whose title or ticker contains this text")
    ap.add_argument("--series", nargs="+", help="series tickers to test")
    ap.add_argument("--hours-before-close", type=float, default=6, help="decide this long before close (default 6)")
    ap.add_argument("--hours-after-open", type=float, help="or decide this long after the market opens")
    ap.add_argument("--max-markets", type=int, default=3000, help="per series (default 3000)")
    ap.add_argument("--refresh", action="store_true", help="ignore cached data")
    args = ap.parse_args()
    client = Kalshi()

    if args.find:
        q = args.find.lower()
        for s in client.series():
            if q in s.get("title", "").lower() or q in s["ticker"].lower():
                print(f"{s['ticker']:30} {s.get('category', ''):15} {s.get('title', '')}")
        return
    if not args.series:
        ap.error("pass --series (use --find to look them up)")

    obs = []
    for s in args.series:
        obs += load_observations(client, s, args)
    print(f"\n{len(obs)} markets with prices, {len({o['event'] for o in obs})} events\n")

    print("1) BUY EVERYTHING IN A PRICE RANGE (after fees)")
    print("   price      trades  events  win rate   ROI   worst-case ROI")
    rows = calibration(obs)
    edges = []
    for r in rows:
        ok = r["roi_lo"] is not None and r["roi_lo"] > 0 and r["trades"] >= MIN_TRADES and r["events"] >= MIN_EVENTS
        if ok:
            edges.append(r)
        print(f"   {r['lo']:.2f}-{r['hi']:.2f}  {r['trades']:6}  {r['events']:6}   {r['win_rate']:6.1%}  "
              f"{fmt(r['roi'])}   {fmt(r['roi_lo'])}  {'<-- EDGE' if ok else ''}")

    print("\n2) TRADE MENTION WORDS WHEN HISTORY DISAGREES WITH THE PRICE (after fees)")
    print("   margin  trades  events   ROI   worst-case ROI")
    z = statistics.NormalDist().inv_cdf(1 - 0.05 / len(MARGINS))
    results = []
    for margin in MARGINS:
        trades, hist, base = mention_test(obs, margin)
        roi, lo = roi_stats(trades, z)
        results.append((margin, roi, lo, len(trades)))
        print(f"   {margin:.2f}   {len(trades):6}  {len({e for e, _, _ in trades}):6}  {fmt(roi)}   {fmt(lo)}")
    best = max(results, key=lambda r: r[2] if r[2] is not None else -9)

    common = {"series": args.series, "hours_before_close": args.hours_before_close,
              "hours_after_open": args.hours_after_open}
    with open(os.path.join(HERE, "edges.json"), "w") as f:
        json.dump({**common, "edges": edges}, f, indent=1)
    with open(os.path.join(HERE, "words.json"), "w") as f:
        json.dump({**common, "margin": best[0], "roi": best[1], "roi_lo": best[2], "trades": best[3],
                   "words": {f"{s}|{w}": v for (s, w), v in hist.items()},
                   "base": dict(base)}, f, indent=1)
    print(f"\n'worst-case ROI' is a 95% lower bound. Only ranges with a positive worst case count as an edge.")
    print(f"Found {len(edges)} price-range edge(s). Mention test best worst-case ROI: {fmt(best[2])} (margin {best[0]}).")
    print("Saved edges.json and words.json.")


if __name__ == "__main__":
    main()
