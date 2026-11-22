# Deploy SalonIQ

1. Create the Pages project once: `wrangler pages project create saloniq-f5l --production-branch main`.
2. Apply the shared D1 schema for this app: `npm run db:seed`.
3. Set the secret: `wrangler pages secret put DEMO_TRIAL_SECRET --project-name saloniq-f5l`.
4. Run `npm run deploy`.
5. Confirm the signed preview cookie and the `Backend: connected` status on first load.
6. Keep `.dev.vars` out of source control.

The database id in `wrangler.toml` is a public identifier, not a credential. No API keys, passwords, or payment code are stored in this repository.
