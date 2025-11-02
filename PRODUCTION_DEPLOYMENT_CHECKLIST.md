# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Backend (Render) - Environment Variables
Verify these are set in your Render dashboard (Settings → Environment):
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_KEY` - Supabase anon key
- [ ] `SUPABASE_BUCKET` - Storage bucket name (usually `imageStore`)
- [ ] `SESSION_SECRET` - Session encryption key
- [ ] `BACKEND_ONLY=true` - Ensures Render only runs the backend

### 2. Database Synchronization
Run migrations to ensure the database schema is current:
```bash
npm run db:push
```
**Status:** ⚠️ Run this before final deployment

### 3. Import Historical Data (Optional)
If you have backup data in `data-export.json`:
```bash
npm run import-data
```
This populates Supabase with existing locations and media library data.
**Status:** ✅ Backup file exists at `/Users/macbook/joe-main/data-export.json`

---

## 🔨 Build & Deploy Process

### Step 1: Local Testing (Optional)
```bash
npm install
npm run build
npm run check  # TypeScript validation
```

### Step 2: Verify Frontend Build
The frontend build is located in `/dist/public/` and ready for Firebase deployment.
```bash
ls -la dist/public/  # Verify index.html and assets exist
```

### Step 3: Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

**Expected Output:**
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/joebosse-app/overview
Hosting URL: https://joebosse-app.web.app
```

### Step 4: Verify Render Backend is Running
- Open Dashboard: https://dashboard.render.com
- Check service status (should be "Live")
- Backend URL: https://backend-x65t.onrender.com

---

## ✨ Post-Deployment Verification

### 1. Frontend Accessibility
Open https://joebosse-app.web.app and verify:
- [ ] Page loads without errors
- [ ] Login page displays correctly
- [ ] No CORS errors in browser console (Network tab)

### 2. Backend Connectivity
- [ ] Can log in with credentials
- [ ] Media library upload works
- [ ] Images display correctly
- [ ] Location management functions properly

### 3. Database Verification
Check Supabase dashboard:
- [ ] Database tables are created (locations, media, users)
- [ ] Data is synced if you ran `import-data`
- [ ] Storage bucket `imageStore` exists and has images

### 4. Monitoring
- [ ] Render backend logs are clean (no errors)
- [ ] Firebase hosting logs show successful requests
- [ ] Browser console shows no persistent errors

---

## 🎯 Common Issues & Solutions

### "Failed to fetch from API"
**Solution:**
1. Verify Render backend is online: https://dashboard.render.com
2. Check browser Network tab for actual error
3. Confirm `CORS_ORIGINS` includes the frontend URL in backend

### "Database Error on Login"
**Solution:**
1. Run `npm run db:push` to sync schema
2. Verify `DATABASE_URL` is correct in Render
3. Check Supabase connection in dashboard

### "Images Not Uploading"
**Solution:**
1. Verify `SUPABASE_KEY` and `SUPABASE_BUCKET` in Render
2. Check Supabase Storage bucket policies
3. Confirm bucket name is exactly `imageStore`

### "Page Not Loading"
**Solution:**
1. Clear browser cache: `Cmd+Shift+Delete`
2. Check Firebase Console for deployment errors
3. Verify build completed successfully: `ls dist/public/index.html`

---

## 📋 Handoff Checklist for Site Owner

Before handing over to the site owner, verify:

- [ ] **Login Credentials Setup**: Provide username/password for admin access
- [ ] **Data Backup**: Export current data with `npm run export-data` (creates `data-export.json`)
- [ ] **Documentation**: Provide user manual for:
  - Adding/editing locations
  - Uploading images to media library
  - Managing categories
  - Map navigation
- [ ] **Support Contact**: Establish point of contact for technical issues
- [ ] **Monitoring**: Set up Render/Firebase alerts for downtime
- [ ] **Database Backups**: Schedule automatic Supabase backups
- [ ] **SSL Certificate**: Verify HTTPS is active (automatically via Firebase & Render)

---

## 🚨 Emergency Procedures

### Rollback Frontend
```bash
firebase deploy --only hosting
# Re-deploy the previous version or rebuild from source
```

### Rollback Backend
1. Go to Render Dashboard
2. Click service → "Deployments"
3. Select previous deployment → "Deploy"

### Clear All Data and Reset
```bash
npm run export-data           # Backup current data first
# Then manually delete data in Supabase Console
npm run import-data data-export.json  # Restore if needed
```

---

## ✅ Final Status

- **Frontend Build**: ✅ Ready (`/dist/public/`)
- **Firebase Project**: ✅ Configured (`joebosse-app`)
- **Render Backend**: ✅ Deployed (https://backend-x65t.onrender.com)
- **Database**: ⚠️ Needs schema sync (`npm run db:push`)
- **Environment Variables**: ✅ Set on Render

**Ready for production deployment! Execute steps in "Build & Deploy Process" section.**