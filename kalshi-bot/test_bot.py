"""Offline tests: python -m unittest test_bot"""
import base64
import os
import random
import unittest
from types import SimpleNamespace

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa

import arb
import backtest
import bot
import kalshi

T0 = 1_760_000_000


def iso(t):
    from datetime import datetime, timezone
    return datetime.fromtimestamp(t, timezone.utc).isoformat()


class FakeClient:
    """Settled mention markets: 'tariff' is said 90% of the time but priced at 50c."""

    def __init__(self, events=40):
        rng = random.Random(1)
        self.settled, self.open = [], []
        for e in range(events):
            close = T0 + e * 86400
            for word, rate in (("tariff", 0.9), ("biden", 0.5)):
                self.settled.append({
                    "ticker": f"KXMENTION-{e}-{word[:4].upper()}", "event_ticker": f"KXMENTION-{e}",
                    "yes_sub_title": word.title(), "open_time": iso(close - 3 * 86400),
                    "close_time": iso(close), "result": "yes" if rng.random() < rate else "no",
                    "volume_fp": "1000.00"})
        self.open = [{"ticker": "KXMENTION-99-TARI", "event_ticker": "KXMENTION-99", "yes_sub_title": "Tariff",
                      "yes_ask_dollars": "0.5000", "yes_bid_dollars": "0.4800", "volume_24h_fp": "900"}]

    def settled_markets(self, series, limit=None):
        return self.settled

    def candles(self, series, ticker, start, end, period=60):
        return [{"end_period_ts": int(end) - 3600, "yes_ask": {"close_dollars": "0.5000"},
                 "yes_bid": {"close_dollars": "0.4800"}},
                {"end_period_ts": int(end) + 3600, "yes_ask": {"close_dollars": "0.9900"},
                 "yes_bid": {"close_dollars": "0.9800"}}]  # after decision time: must be ignored

    def markets(self, limit=None, **params):
        return self.open


class Tests(unittest.TestCase):
    def test_signature_verifies(self):
        k = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        sig = kalshi.sign(k, "1700000000000", "GET", "/trade-api/v2/portfolio/balance")
        k.public_key().verify(base64.b64decode(sig), b"1700000000000GET/trade-api/v2/portfolio/balance",
                              padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.DIGEST_LENGTH),
                              hashes.SHA256())

    def test_fees(self):
        self.assertEqual(kalshi.fee(1, 0.95), 0.01)
        self.assertEqual(kalshi.fee(10, 0.95), 0.04)
        self.assertEqual(kalshi.fee(100, 0.5), 1.75)

    def test_legacy_and_new_fields(self):
        self.assertEqual(kalshi.price({"yes_ask_dollars": "0.9300"}, "yes_ask"), 0.93)
        self.assertEqual(kalshi.price({"yes_ask": 93}, "yes_ask"), 0.93)
        self.assertEqual(kalshi.num({"volume_fp": "12.00"}, "volume"), 12)

    def test_snapshot_ignores_future_candles(self):
        c = FakeClient()
        m = c.settled[0]
        self.assertEqual(backtest.snapshot(c, "S", m, 6, None), (0.5, 0.48))

    def test_calibration_finds_real_edge_only(self):
        rng = random.Random(2)
        fair = [{"event": f"e{i}", "yes_ask": 0.93, "yes_bid": 0.92,
                 "result": "yes" if rng.random() < 0.93 else "no"} for i in range(400)]
        rows = {r["lo"]: r for r in backtest.calibration(fair)}
        self.assertFalse(rows[0.9]["roi_lo"] > 0)  # fairly priced: no edge after fees
        cheap = [{**o, "result": "yes" if rng.random() < 0.995 else "no"} for o in fair]
        rows = {r["lo"]: r for r in backtest.calibration(cheap)}
        self.assertGreater(rows[0.9]["roi_lo"], 0)

    def test_mention_walk_forward_has_no_lookahead(self):
        obs = [{"series": "S", "event": f"e{i}", "word": "tariff", "close": i, "yes_ask": 0.5,
                "yes_bid": 0.48, "result": "yes"} for i in range(10)]
        trades, hist, _ = backtest.mention_test(obs, 0.15)
        self.assertEqual(len(trades), 10 - kalshi.MIN_HISTORY)  # no trades before enough history
        self.assertEqual(hist[("S", "tariff")], [10, 10])

    def test_end_to_end_mentions(self):
        c = FakeClient()
        args = SimpleNamespace(hours_before_close=6, hours_after_open=None, max_markets=None, refresh=True)
        backtest.HERE = self._tmp()
        obs = backtest.load_observations(c, "KXMENTION", args)
        trades, hist, base = backtest.mention_test(obs, 0.15)
        roi, lo = backtest.roi_stats(trades, 1.96)
        self.assertGreater(lo, 0)  # buying an underpriced word should show a proven edge
        words = {"series": ["KXMENTION"], "margin": 0.15, "base": dict(base),
                 "words": {f"{s}|{w}": v for (s, w), v in hist.items()}}
        picks = bot.within_budget(bot.mentions(c, set(), words), 50, one_per_event=False)
        self.assertEqual([(p["side"], p["count"]) for p in picks], [("yes", 10)])

    def test_live_refused_without_edge(self):
        args = SimpleNamespace(force=False, mentions=False)
        self.assertFalse(bot.proven(args, None, None))
        self.assertFalse(bot.proven(args, {"edges": []}, None))
        self.assertTrue(bot.proven(args, {"edges": [{"lo": 0.9, "hi": 0.95}]}, None))
        args.mentions = True
        self.assertFalse(bot.proven(args, None, {"roi_lo": -0.01}))

    def test_budget_limits(self):
        picks = [{"event": "A", "cost": 9.6}, {"event": "A", "cost": 9.6}, {"event": "B", "cost": 9.6}]
        self.assertEqual(len(bot.within_budget(picks, 50, one_per_event=True)), 2)
        self.assertEqual(len(bot.within_budget(picks, 15, one_per_event=False)), 1)

    def test_arb_profit_is_locked_in_for_every_outcome(self):
        # YES bids sum to 1.12: buying NO everywhere must profit whoever wins.
        legs = [("A", 0.55, 40), ("B", 0.35, 25), ("C", 0.15, 60), ("D", 0.07, 10)]
        b = arb.no_basket(legs, budget=30)
        self.assertIsNotNone(b)
        c, chosen = b["count"], [t for t, _ in b["legs"]]
        for winner in chosen + [None]:
            payout = sum(c for t in chosen if t != winner)
            self.assertAlmostEqual(payout - b["cost"], b["profit"] + (c if winner is None else 0))
            self.assertGreater(payout - b["cost"], 0)
        self.assertLessEqual(b["cost"], 30)

    def test_arb_needs_bids_over_one_dollar(self):
        self.assertIsNone(arb.no_basket([("A", 0.60, 50), ("B", 0.38, 50)], budget=30))
        self.assertIsNone(arb.no_basket([("A", 0.60, 50)], budget=30))

    def test_arb_fee_rounding_can_kill_tiny_arbs(self):
        # Bids sum to 1.01, but 1-cent minimum fees on 3 legs eat it.
        self.assertIsNone(arb.no_basket([("A", 0.50, 1), ("B", 0.30, 1), ("C", 0.21, 1)], budget=30))

    def test_arb_scan_skips_events_that_are_not_mutually_exclusive(self):
        class C:
            def events(self, **p):
                mk = lambda t, b: {"ticker": t, "yes_bid_dollars": str(b)}
                return [{"event_ticker": "E1", "mutually_exclusive": False, "markets": [mk("A", .6), mk("B", .6)]},
                        {"event_ticker": "E2", "mutually_exclusive": True, "markets": [mk("X", .6), mk("Y", .6)]}]

            def best_yes_bid(self, t):
                return 0.6, 20
        found = arb.scan(C(), budget=30)
        self.assertEqual([b["event"] for b in found], ["E2"])

    def test_arb_stops_on_partial_fill(self):
        class C:
            calls = []

            def buy(self, t, side, c, p):
                self.calls.append(t)
                return {"status": "canceled", "fill_count_fp": "0.00"} if t == "B" else {"status": "executed"}
        arb.LOG_FILE = os.path.join(self._tmp(), "log.csv")
        basket = {"event": "E", "count": 5, "legs": [("A", 0.6), ("B", 0.5), ("C", 0.2)]}
        with self.assertRaises(RuntimeError) as e:
            arb.execute(C(), basket)
        self.assertEqual(C.calls, ["A", "B"])  # never buys C after B fails
        self.assertIn("Already bought NO on: A", str(e.exception))

    def test_orderbook_both_formats(self):
        k = kalshi.Kalshi()
        k.get = lambda path, params=None: {"orderbook_fp": {"yes_dollars": [["0.4100", "5.00"], ["0.4200", "9.00"]]}}
        self.assertEqual(k.best_yes_bid("T"), (0.42, 9.0))
        k.get = lambda path, params=None: {"orderbook": {"yes": [[40, 3], [43, 7]], "no": [[55, 2]]}}
        self.assertEqual(k.best_yes_bid("T"), (0.43, 7.0))

    def _tmp(self):
        import tempfile
        d = tempfile.mkdtemp()
        self.addCleanup(__import__("shutil").rmtree, d)
        return d


if __name__ == "__main__":
    unittest.main()
