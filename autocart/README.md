# AutoCart by SeeZee 🛍️

**Prototype v0.1: multi-store restock monitoring and assisted checkout. It does NOT purchase items automatically.**

## Chase: easy instructions
1. Download the Windows installer from the developer.
2. Double-click the setup EXE and follow the screens.
3. Open AutoCart from the desktop.
4. Copy the link to a NeeDoh product from any store.
5. Paste the link, name the product, and press **Add product**.
6. Repeat for as many stores and products as you'd like.
7. Set your planned item price, total budget, and quantity.
8. Press **Start watching**. Leave the PC awake and connected.
9. When an item looks available, click **Open store**.
10. Verify quantity, price and shipping, and **complete checkout yourself**.
11. Press **Stop** when finished.

## Important
- Install Google Chrome or Microsoft Edge first.
- Stores may block automated browsing. Some stores won't display availability correctly. “Possibly available” does NOT guarantee stock.
- Purchasing limits are planning fields only, not enforced at a retailer.
- Do not enter credit card information into AutoCart. Checkout happens at the store itself.
- AutoCart uses a separate browser profile kept locally on your Windows user account.
- The installer is unsigned. Test it on Windows before sharing; Windows may warn about an unrecognized publisher.

## Developer: run
Requires Node.js 22 or later.

```bash
cd autocart
npm install
npm run check
npm start
```

## Build .exe
On a Windows development machine, run:

```bash
cd autocart
npm install
npm run dist:win
```

Or use the GitHub Actions Windows installer workflow (once available on the default branch). The resulting installer appears as a workflow artifact. Extract it first.

## Architecture
Electron UI, Playwright-core with installed Chrome/Edge, dedicated local browser profile, local JSON configuration. Product status checks are sequential and conservative. No payment data collection, no automatic purchase submission, no CAPTCHA bypass.

## Before automatic purchasing could be supported
Get real product URLs; verify retailer terms; write per-store availability checks; use supported checkout methods; add receipts, budget enforcement, order locking, deduplication, and failure recovery; code-sign the installer.

This is a prototype, not a guaranteed restock detector or shopping bot.