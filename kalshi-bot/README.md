# Kalshi bot

## Which strategy? (ranked by safety)

| # | Strategy | Risk | File |
|---|----------|------|------|
| 1 | **Basket arbitrage**: profit locked in by math | Very low | `arb.py` |
| 2 | Favorites: buy what history shows is underpriced | Medium | `bot.py` |
| 3 | Mention words ("What will Trump say?") | High | `bot.py --mentions` |

Skipped after research: weather bots (market wins after fees),
sportsbook comparisons (Kalshi is as sharp as Pinnacle), cross-site
arbitrage (rules can differ), and settlement sniping (fast bots win).

Free money tip: Kalshi pays ~3.5–4% interest on cash and open positions,
but only on balances of **$250+**.

## 1. Arbitrage (`arb.py`)

When at most one outcome can win, buying NO on every outcome pays at
least N-1 dollars. If that costs less after fees, the profit is locked in.

```bash
python arb.py                  # dry run: shows locked-in profits right now
python arb.py --live --loop 60 # buy them, re-scan every minute
```

These chances are rare and small (usually cents to a dollar). The only
risk: a price moves between orders. The bot re-checks prices first and
stops at the first order that doesn't fill.

## 2–3. Backtested strategies (`bot.py`)

**Test first, trade second.** `backtest.py` checks a strategy on Kalshi's
settled markets. `bot.py` refuses to trade live unless that test shows
a real edge after fees.

## The two strategies

1. **Favorites:** buy contracts in price ranges that historically won more often
   than their price implied. (Research on Kalshi data: cheap longshots lose
   money; favorites do slightly better.)
2. **Mentions** (e.g. "What will Trump say?"): look up how often each word
   was said in past events. Buy YES if the price is far below that rate,
   NO if far above.

## Steps

```bash
pip install -r requirements.txt

python backtest.py --find trump          # 1. find series tickers
python backtest.py --series <TICKERS>    # 2. test them (no API key needed)
python bot.py --mentions                 # 3. dry run: see what it would buy

export KALSHI_API_KEY_ID="your-key-id"
export KALSHI_PRIVATE_KEY_PATH="/path/to/kalshi-key.pem"
python bot.py --check                    # 4. test your key
python bot.py --live --mentions          # 5. real orders (only if step 2 found an edge)
```

Drop `--mentions` to use the favorites strategy.

## How to read the backtest

- **ROI**: profit per $1 bet, after fees.
- **Worst-case ROI**: a cautious 95% lower bound. If it is below 0,
  the "profit" could just be luck. The bot will not trade it.

## Safety limits (top of `bot.py`)

- $10 per favorite, $5 per mention, $15 per event, $50 total
- Always keeps $40 as cash
- Stops at the first error

Not financial advice. Past results don't promise future ones. Never commit your `.pem` key.
