# Deploy SalonIQ

1. Create the Pages project: `wrangler pages project create saloniq --production-branch main`
2. Set the secret: `wrangler pages secret put DEMO_TRIAL_SECRET --project-name saloniq`
3. Run `npm run deploy`.
4. Confirm the signed preview cookie appears on the first visit.
5. Keep `.dev.vars` out of source control.

The repository contains no keys, credentials, or payment code.
