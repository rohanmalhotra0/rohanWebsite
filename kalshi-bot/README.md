# Kalshi bot

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
