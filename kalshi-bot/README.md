# Kalshi favorite bot

Buys outcomes that Kalshi prices at **90–96¢** and that close within 24 hours.

**This is not guaranteed money.** Most trades win a few cents each.
One loss costs about $9.50, which wipes out 15–20 wins.

## Safety limits (top of `bot.py`)

- Max $10 per market
- Max $50 at risk in total
- Keeps at least $40 as cash
- One market per event
- Stops on the first error

## Run it

```bash
pip install -r requirements.txt
export KALSHI_API_KEY_ID="your-key-id"
export KALSHI_PRIVATE_KEY_PATH="/path/to/kalshi-key.pem"

python bot.py           # dry run: shows what it would buy, no API key needed
python bot.py --check   # tests your key, shows balance
python bot.py --live    # places real orders
```

Trades get logged to `trades.csv`. Never commit your `.pem` key file.
