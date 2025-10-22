# PostgreSQL Migration Guide

This guide walks you through migrating from SQLite to PostgreSQL while preserving all your data.

## Phase 1: Backup Your SQLite Data (Local)

### Step 1: Export your current data
```bash
npx tsx export-data.ts
```

This creates `data-export.json` with all your:
- ✅ Locations
- ✅ Users
- ✅ Media files
- ✅ Categories
- ✅ Settings

### Verify the export
```bash
ls -lh data-export.json
cat data-export.json | head -20  # Check the structure
```

---

## Phase 2: Set Up PostgreSQL on Render

### Step 1: Create PostgreSQL database on Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "PostgreSQL"
3. Name it: `joe-db`
4. Select appropriate region
5. Choose PostgreSQL version (default is fine)
6. Click "Create Database"

### Step 2: Copy the Internal Connection String
In the Render dashboard:
1. Find your new database
2. Copy the **Internal Database URL** (looks like: `postgresql://user:pass@host/dbname`)
3. Keep this safe - you'll need it

---

## Phase 3: Push Code to GitHub

The code changes are already made:
- ✅ `/server/db.ts` - Now uses PostgreSQL
- ✅ `/shared/schema.ts` - Now uses PostgreSQL table definitions

### Commit and push:
```bash
git add -A
git commit -m "feat: migrate from SQLite to PostgreSQL"
git push origin main
```

---

## Phase 4: Import Your Data

### Step 1: Set DATABASE_URL locally (testing only)
```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
```
*(Use the connection string from Render dashboard)*

### Step 2: Create PostgreSQL tables
```bash
npx drizzle-kit push
```

This creates all tables in PostgreSQL based on your schema.

### Step 3: Import your data
```bash
npx tsx import-data.ts
```

You should see:
```
✅ Imported X categories
✅ Imported X users
✅ Imported X locations
✅ Imported X media files
✅ Imported X settings
✅ Data import completed successfully!
```

---

## Phase 5: Deploy to Render

### Step 1: Update render.yaml
The `render.yaml` already has most setup. Add DATABASE_URL environment variable:

1. Go to Render dashboard
2. Find your Joe application service
3. Go to "Environment" tab
4. Add new environment variable:
   - Key: `DATABASE_URL`
   - Value: (paste your Internal Database URL from the PostgreSQL service)

### Step 2: Redeploy
```bash
git commit --allow-empty -m "trigger: redeploy with DATABASE_URL"
git push origin main
```

Or manually trigger redeployment in Render dashboard.

---

## Verification Checklist

After deployment:
- [ ] App loads without errors
- [ ] All locations appear on the map
- [ ] Can view location details
- [ ] Can see all categories
- [ ] Photos load correctly
- [ ] Can still login (if you have user accounts)
- [ ] Settings are preserved

---

## Troubleshooting

### Import script fails with "DATABASE_URL not set"
Make sure you've exported the DATABASE_URL:
```bash
export DATABASE_URL="your-connection-string"
echo $DATABASE_URL  # Verify it's set
```

### "relations do not exist" errors during import
The tables might not exist yet. Run drizzle-kit push first:
```bash
npx drizzle-kit push
```

### Data doesn't appear after import
Check if import completed successfully (look for ✅ messages).
Then verify in Render dashboard that the DATABASE_URL env var is set correctly.

### Connection timeout errors
- Verify the Database URL is correct (Internal URL, not Public URL)
- Check that your app's firewall allows connections from Render's region
- PostgreSQL service might not be fully initialized yet (wait 2-3 minutes)

---

## Keeping SQLite as Backup

Your original SQLite data remains in `data.db` - don't delete it!
- `data.db` - Your original SQLite database (safe to keep for reference)
- `data-export.json` - Your data backup (safe to keep)

---

## Next Steps After Successful Migration

1. Test the app thoroughly
2. Monitor Render logs for any errors
3. Delete SQLite if you're confident everything works
4. Update documentation to reference PostgreSQL