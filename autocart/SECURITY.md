# Security review — prototype only

## Implemented
- Electron context isolation, sandboxed renderer, disabled Node integration; narrow preload methods.
- Local JSON settings. Payment credentials are never requested or stored.
- Validated HTTPS product URLs; rejects credentials and localhost hostnames.
- Separate persistent Chrome/Edge profile under app user data. No reuse of everyday browser profile.
- Sequential page checks with a minimum 1-minute interval for actual retailer monitoring.
- A STOP command cancels the timer, closes in-progress check tabs and suppresses stale alerts.
- Real checkout is manual, not automatic.
- Practice Mode is local HTML, isolated from Node, with fake cards and pretend orders only.

## Remaining risks / not production-ready
- Arbitrary external product pages may still reach private network addresses via DNS/rebinding or redirects; add redirect validation and browser network isolation before accepting untrusted links from unknown people.
- The stock detector is heuristic and may misinterpret storefronts.
- An unsigned Windows binary can trigger SmartScreen or antivirus warnings. Sign releases before end-user distribution.
- No independent security audit or Windows desktop end-to-end testing yet.
- Spending limits are planning preferences for real storefronts and **do not enforce** retailer checkout.
- No automated real checkout, receipt tracking, duplicate order locking, or spending guard in real stores.
- Sites may restrict automated access. Respect terms, rate limits, CAPTCHA, and user confirmation.
- Practice Mode’s fake cards are hardcoded examples, **not** payment-network test transactions.

## Release gate
1. Real Windows installer launches successfully and is scanned.
2. Practice Mode open/start/restock/approve/decline/budget/stop/reset all tested on the packaged installer.
3. Multi-site live checks tested on permitted pages; no rate-limit abuse.
4. Error handling, cancellation and close/reopen verified.
5. Signed build and published GitHub Release with direct EXE download.
6. No real auto-purchase claim before authorized site integrations and security review.