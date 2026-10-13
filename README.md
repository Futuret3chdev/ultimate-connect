# UltimateConnect

Real one-click cross-posting to social platforms.

## Features

- Real OAuth 2.0 flows for X (Twitter), LinkedIn, Facebook/Instagram
- Actual API posting (no simulations)
- AI caption adaptation (OpenAI or xAI Grok)
- Basic scheduling storage
- PWA (installable on mobile)
- Ready for Capacitor native wrap

## Required Environment Variables (Vercel)

```
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=https://your-domain.vercel.app

TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Optional for AI
OPENAI_API_KEY=
# or
XAI_API_KEY=
```

## Developer App Setup

1. **X (Twitter)**: https://developer.x.com → Project → User authentication settings → OAuth 2.0 → Set callback to `https://your-domain/api/auth/twitter/callback`
2. **LinkedIn**: https://www.linkedin.com/developers → Create app → Auth → Redirect URLs
3. **Meta / Facebook / Instagram**: https://developers.facebook.com → Create app → Add Facebook Login + Instagram Graph API → Set OAuth redirect

## Deployment

This repo is linked to Vercel. Push to main to deploy.

For production multi-user token storage and reliable scheduling, add Vercel Postgres + Prisma and move token storage from encrypted cookies to the database.

## Mobile / PWA

- Manifest and service worker included.
- Users can "Add to Home Screen".
- For App Store / Play Store, use Capacitor to wrap the Next.js app.

Nothing is simulated. Posting calls the real platform APIs using the user's access tokens.
