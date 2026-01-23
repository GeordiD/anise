# Heirloom

This project uses pnpm.

## Commands

- Install: `pnpm install`
- Run dev: `pnpm run dev`

## Database

### Seed from Production

To copy production data to your local database:

1. Create `.env.production` with your production database URL:
   ```
   PROD_DATABASE_URL=postgresql://username:password@host:port/database
   ```

2. Run the seed script:
   ```bash
   ./scripts/seed-from-prod.sh
   ```

This will safely dump production data (read-only) and restore it to your local database.
