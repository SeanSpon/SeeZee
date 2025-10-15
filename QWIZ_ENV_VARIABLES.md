# Qwiz Environment Variables

The feature-builder questionnaire system supports environment-based pricing configuration.

## Service Pricing

Base service prices (in cents):

```env
SEEZEE_PRICE_WEBSITE=200000          # $2,000 for website development
SEEZEE_PRICE_APP=400000              # $4,000 for app development
SEEZEE_PRICE_AI=80000                # $800 for AI features
SEEZEE_PRICE_MAINTENANCE=29900       # $299/month for maintenance
```

## Feature Pricing

Add-on features (in cents):

### Design & Branding (🎨)
```env
F_MOTION_DESIGN=30000                # $300 - Smooth scroll & micro-motion branding
F_VISUAL_ASSETS=40000                # $400 - Icons, artwork, or hero graphics
F_BRAND_IDENTITY=25000               # $250 - Logo set + color palette + typography
F_3D_VISUALS=60000                   # $600 - 3D hero graphics or product showcase
```

### Functionality (🧩)
```env
F_SMART_FORMS=20000                  # $200 - Advanced contact or quote forms
F_ADMIN_PANEL=70000                  # $700 - Portal for client/project management
F_ONLINE_STORE=80000                 # $800 - Cart, checkout, and payment integration
F_SCHEDULER=50000                    # $500 - Appointment system with calendar sync
F_CONTENT_MANAGER=25000              # $250 - Simple content editing system
F_ACCOUNT_SYSTEM=30000               # $300 - Login, signup, password reset
```

### Integrations (🔌)
```env
F_PAYMENT_GATEWAY=15000              # $150 - Secure checkout with Stripe
F_AUTO_EMAILS=20000                  # $200 - Send follow-ups and confirmations
F_INSIGHTS_PANEL=25000               # $250 - View metrics and user analytics
F_API_BACKEND=60000                  # $600 - Custom database & endpoints
F_CHAT_INTEGRATION=40000             # $400 - Smart assistant / chatbot features
```

## Quote vs Checkout Mode

Control whether the questionnaire generates a quote or redirects to Stripe checkout:

```env
QWIZ_MODE=quote                      # "quote" (default) or "checkout"
```

### Quote Mode (Default)
- User fills out questionnaire
- Submits to `/api/leads/submit`
- Creates Lead record in database
- Sends confirmation email
- Redirects to success page

### Checkout Mode
- User fills out questionnaire
- Submits to `/api/checkout/create-session`
- Creates Stripe Checkout session
- Redirects to Stripe payment page
- Webhook processes successful payment
- Creates Project and User records

## Pricing Rules

The pricing calculator applies the following rules:

1. **Base Price**: Selected service price
2. **Add-ons**: Sum of selected feature prices
3. **Rush Fee**: 15% if delivery < 3 weeks
4. **Total**: Base + Add-ons + Rush Fee
5. **Deposit**: Greater of 25% of total or $250 minimum
6. **Recurring**: Monthly maintenance if selected

## Required Environment Variables

For production deployment:

```env
# Database
DATABASE_URL="postgresql://..."

# Stripe (for checkout mode)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="..."
```

## Email Notifications (TODO)

Future implementation will use:

```env
# Email service (SendGrid, Mailgun, etc.)
EMAIL_FROM="quotes@seezee.com"
EMAIL_ADMIN="admin@seezee.com"
SENDGRID_API_KEY="..."
```

## Admin Dashboard Integration (TODO)

Future features:
- View all questionnaire submissions in admin panel
- Filter by service type, status, date range
- Export quote data to CSV
- Link questionnaire to Project creation
- Track conversion rates (quote → paid project)
