# Creative Intelligence

Interne tool van **Online Klik** om per klant een creatieve Social Ads-contentstrategie op te bouwen en bij te houden: intake → trigger map (AI) → variabelenmatrix, met de Creative Loop als rode draad.

## Techstack

- SvelteKit + TypeScript (Svelte 5)
- Tailwind CSS v4 + shadcn-svelte
- Supabase (auth + PostgreSQL, RLS)
- Anthropic Claude API (`claude-sonnet-5`) voor de trigger map-generatie
- Vercel (deployment)

## Lokaal draaien

```sh
npm install
npm run dev
```

Maak eerst een `.env` aan op basis van `.env.example`:

| Variabele | Omschrijving |
|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase project-URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key (alleen server) |
| `ANTHROPIC_API_KEY` | Anthropic API key (alleen server) |
| `ANTHROPIC_MODEL` | Optioneel; default `claude-sonnet-5` |

## Database

Voer de SQL-bestanden in `supabase/migrations/` in volgorde uit via de Supabase SQL Editor
(`0001` t/m `0005`). Maak daarna je eerste gebruiker aan (Dashboard → Authentication → Users)
en promoveer die tot admin met de query onderaan `0002_auth.sql`.

## Bouwen

```sh
npm run build     # productiebuild (Vercel-adapter)
npm run check     # typecheck
```

> Let op: `npm run build` kan op **Windows** lokaal falen met een `EPERM symlink`-fout
> (Windows-beperking van de Vercel-adapter). Op Vercel zelf (Linux) bouwt de app wél.
> Wil je lokaal bouwen op Windows, zet dan "Ontwikkelaarsmodus" aan.

## Deployment (Vercel)

Zet in Vercel dezelfde env-variabelen als hierboven. Werk in Supabase de
**Site URL** en **Redirect URLs** bij naar je Vercel-domein.
