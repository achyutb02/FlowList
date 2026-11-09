# Trading playbook, version 2

Written Nov 9, 2026 after a review of every order since Oct 27. The rules in
`trader/config.json` are enforced by `trader-risk/check.py`; the rest is the
routine every report follows. Every order still needs the owner's yes.

## What the review found

Every single option placed directly filled within minutes. Every two-leg
spread typed into the app by hand, and bid under the middle of a wide market,
never filled, and the idea then moved without us. Saving a few cents on the
entry cost several times that in missed profit.

Weak points, biggest first:

1. **Bids under the middle of a wide market.** A spread quoted $0.24 / $0.43 is 57% wide. A bid below the middle of a market like that does not fill.
2. **A structure that cannot be placed directly.** Spreads have to be typed into the app by hand; every winner was a single option placed in seconds.
3. **Stale prices.** Prices proposed at 5:43 am MT come from the previous close. By the open they were wrong.
4. **Buying while the stock was still falling.** An entry at RSI 25 fell another 22% in option terms before it turned.
5. **Exits made up as we went.** No fixed rule for moving a stop up as a trade worked.
6. **Idle cash.** Because of 1 to 3, most of the account sat unused for days.

## Entry

1. **Single options first.** Calls or puts with a premium of $0.40 or less (max loss $40), placed directly. A two-leg spread only when no single option passes, priced at the middle plus $0.02, one attempt.
2. **Liquid only** (checked by `check.py`, numbers go on the order as `"quote"`):
   - bid/ask no wider than 15% of the middle
   - open interest 500 or more
   - delta between 0.25 and 0.60
   - 21 or more days to expiry, and no earnings before expiry
3. **The turn is confirmed.** For calls: RSI was under 35 in the last 5 sessions and is rising, and the price is above yesterday's high or its 5-day average. For puts: RSI over 70 and falling, price below yesterday's low or its 5-day average. No buying a stock that is still falling.
4. **Priced to fill.** Limit = the middle plus 1 or 2 cents (the broker's high-fill price). The proposal states a max price; the yes covers one re-price up to that max 15 minutes later. Never bid under the middle.
5. **Live prices only.** Firm prices come after 9:45 am ET from live quotes. Before the open the report gives a ready list: up to 3 candidates, each with its trigger and max price (`trader/ready.json`).
6. **Two strikes.** An idea that missed twice is dropped for the week.

## Exit ladder

| When the option is | Do |
| --- | --- |
| Just bought | GTC stop-limit at 50% of the premium paid, limit 2 to 3 cents under |
| Up 40% | Raise the stop to the entry price |
| Up 70% | Raise the stop to lock in +35% |
| Up 100%, or the stock hits its target | Sell |
| Not up 20% after 10 trading days, or 21 days from expiry | Close |

A stop is never lowered.

## Risk

- Each bet can lose at most $40. All open options together stay at or under 50% of the account.
- No two bets on the same theme.
- After two losing trades in a row, the next bet is $25 or less until a win.
- Max order $110. No margin, no short sales.

## Scorecard

Every Friday evening: closed trades, win rate, average win against average
loss, and fills missed. The plan is working when the average win is at least
1.5 times the average loss. A handful of closed trades is too few to prove
an edge; the scorecard is how we find out.

## Autopilot (standing permission from the owner, Nov 9, 2026)

The owner is not always online and gave standing permission to enter and exit
trades without asking each time. The agent acts on its own only inside these
limits, and reports every action as soon as it is done:

- Only trades that follow this playbook and PASS `trader-risk/check.py`.
- Single-leg options or whole shares only. Two-leg spreads cannot be placed by the agent, so they are proposed, never auto-entered.
- At most 2 new positions a day, at most $40 at risk on each new option, all options at or under 50% of the account, max order $110.
- Every buy gets its GTC stop right after the fill. Stops follow the exit ladder and are only ever raised.
- Pause rule: if the account is down 10% in a day, or 15% from its high, no new entries until the owner checks in. Exits and stop raises continue.
- No margin, no short sales, no money moved in or out.
- The owner can end autopilot at any time by saying "stop autopilot".
