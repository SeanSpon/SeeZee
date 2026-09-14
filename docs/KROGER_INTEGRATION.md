# Kroger Cart Integration

This integration connects a signed-in SeeZee user to Kroger using OAuth 2.0 Authorization Code flow and exposes server-side routes for product search and adding UPCs to the user's Kroger cart.

## Kroger app setup

1. Create/register an application in the Kroger Developer Portal.
2. Configure the callback URL to exactly match `KROGER_REDIRECT_URI`.
3. Add these environment variables locally and in Vercel:

```env
KROGER_CLIENT_ID=...
KROGER_CLIENT_SECRET=...
KROGER_REDIRECT_URI=https://YOUR_DOMAIN/api/kroger/callback
```

Do not commit real credentials.

## Routes

- `GET /api/kroger/connect` — begins Kroger OAuth.
- `GET /api/kroger/callback` — validates OAuth state and stores encrypted tokens in an HTTP-only cookie.
- `GET /api/kroger/status` — returns `{ connected: boolean }`.
- `DELETE /api/kroger/status` — disconnects Kroger for this browser/session.
- `GET /api/kroger/products?q=chicken&locationId=...` — searches Kroger products.
- `POST /api/kroger/cart/add` — adds selected UPCs to the authenticated Kroger cart.

Example cart request:

```json
{
  "items": [
    { "upc": "0000000000000", "quantity": 2, "modality": "PICKUP" }
  ]
}
```

## Security

- Every route requires a valid SeeZee session.
- OAuth callback uses a short-lived random state cookie for CSRF protection.
- Kroger access/refresh tokens are AES-256-GCM encrypted using a key derived from the SeeZee auth secret before being stored in an HTTP-only cookie.
- Kroger client credentials remain server-only.

## V1 limitation

Kroger's public cart API is designed to add products to a customer's cart. Full cart/list reading, arbitrary removal, and quantity management may require Kroger Partner API access. Do not promise those operations until Partner API access is approved and tested.

## Next step

After Kroger developer credentials are configured, visit `/api/kroger/connect`, authorize Kroger, then test product search and cart addition. Once the Kroger flow is verified, expose these operations through the SeeZee MCP/ChatGPT integration so a user can say, for example, “add Greek yogurt and bananas to Kroger.”
