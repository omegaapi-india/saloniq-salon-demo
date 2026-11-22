# SalonIQ — privacy-safe demo

Privacy-safe salon booking demo with simulated stylists, services, and chair status.

**Live demo:** https://saloniq-f5l.pages.dev/

Part of the OmegaAPI set of small, free, demo-ready builds.

Built by **Krishna Prakash Ojha (Leon)** at **OmegaAPI** · [omegaapi.com](https://omegaapi.com)

> Simulated data only. No real customer, patient, student, tenant, or inventory records are used.

---

## What it shows

- 5 sample stylists — Invented profiles
- No customer details — Nothing personal collected
- Local log only — Bookings stay in this browser
- Free to host — Cloudflare free tier
- A three-step workflow and four quick actions
- A local activity log that stays in your browser

## Safety and privacy

Stylists and services are fictional. No customer contact details are requested.

There is no sign-up, no database, no payment code, no API key, and no external data service. The signed three-day preview cookie is set by a Pages Function and contains only an expiry timestamp.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open `http://localhost:8788`.

## Deploy

```bash
wrangler pages secret put DEMO_TRIAL_SECRET --project-name saloniq
npm run deploy
```

Set `DEMO_TRIAL_SECRET` to a long random value. Never commit it.

## Support

Goal: **10 monthly sponsors** · tiers from **$5 to $250**. [View tiers](https://github.com/sponsors/omegaapi-india?interval=monthly).

[♥ Sponsor OmegaAPI](https://github.com/sponsors/omegaapi-india)

Contact: [info@omegaapi.com](mailto:info@omegaapi.com) · [Telegram](https://t.me/Omegaapiofficial)

## License

MIT — Copyright © 2026 Krishna Prakash Ojha (Leon), OmegaAPI.
