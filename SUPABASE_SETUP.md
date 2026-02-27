# Supabase Database Setup

## Step 1: Run the SQL Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/_/sql
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire contents of `supabase-schema.sql` into the editor
5. Click "Run" (or press Cmd+Enter)

This will create:
- `instances` table - stores all instance data
- `instance_index` table - fast index for library listings
- Indexes for performance
- Triggers to keep everything in sync

## Step 2: Verify Environment Variables

Make sure these environment variables are set in Vercel (they should be automatically added by the integration):

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for server-side operations)

You can verify in Vercel dashboard → Settings → Environment Variables

## Step 3: Database Structure

The `instances` table stores:
- **id** - Unique identifier (nanoid)
- **name** - Instance name
- **slug** - URL-friendly identifier (unique)
- **created_at** - Creation timestamp
- **updated_at** - Last update timestamp
- **password_hash** - Optional password protection
- **brief_summary** - Original brief text
- **source_instance_id** - If this is a published copy, links to source
- **published_slug** - If published, the public URL slug
- **data** - JSONB containing: theme, brand, content, features, firstRecentProjectDetail

The `instance_index` table provides fast lookups for the library page without loading full instance data.

## Migration Complete! ✅

The database schema has been created and `instance-store.ts` has been migrated to use Supabase.

### What Changed:

1. **Removed file system dependencies** - No more writing JSON files to disk
2. **Uses Supabase Postgres** - All instances stored in the `instances` table
3. **Automatic indexing** - The `instance_index` table is kept in sync via database triggers
4. **Better performance** - Direct database queries instead of file I/O

### Local Development:

For local development, you'll need to add your Supabase credentials to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your Supabase project URL and service role key (found in Supabase dashboard → Settings → API).

### Testing:

The app should work exactly the same as before! Try:

1. Creating a new instance from a brief
2. Viewing instances in the library
3. Publishing an instance
4. Searching for instances
5. Deleting an instance

All data is now stored in Supabase instead of local files.

### Vercel Deployment:

The environment variables are already set by the Vercel integration, so deployment should work automatically!
