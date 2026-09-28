# PostgreSQL / Supabase migration

Production SQLite is not appropriate on Vercel's ephemeral filesystem. The Prisma schema now targets PostgreSQL and preserves the existing `ContactMessage` and `NewsletterSubscriber` models while adding orders and idempotent webhook-event records.

No migration was executed: the repository has no Supabase credentials, and changing an existing SQLite deployment to PostgreSQL must be backed up and reviewed first.

1. Create a Supabase PostgreSQL project and put its pooled or direct Prisma connection string in `DATABASE_URL` locally and in Vercel.
2. Export the current SQLite `ContactMessage` and `NewsletterSubscriber` rows before changing the deployed environment.
3. Run `npx prisma migrate dev --name postgres_commerce` against a non-production Supabase project, inspect the generated SQL, and verify imported rows.
4. Apply the reviewed migration to production with `npx prisma migrate deploy`, then import preserved contact/newsletter data using a one-time, reviewed script.
5. Set every Square, Lulu, book-configuration, webhook, and optional email variable from `.env.example`, then use sandbox credentials first.

Do not use `prisma db push --accept-data-loss` or `prisma migrate reset` against production.
