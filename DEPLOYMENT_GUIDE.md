# Complete Deployment Guide

## Architecture Overview
- **Frontend**: Firebase Hosting (https://joebosse-app.web.app)
- **Backend API**: Render (https://backend-x65t.onrender.com)
- **Database**: Supabase PostgreSQL
- **Image Storage**: Supabase Storage

## Prerequisites ✅
Ensure you have:
- `.env` file with all required variables (see .env.template)
- Node.js and npm installed
- Firebase CLI: `npm install -g firebase-tools`
- Logged into Firebase: `firebase login`
- Logged into GitHub (for Render deployments)

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
Copy `.env.template` to `.env` and verify all variables are set:
```bash
cp .env.template .env
```

### 3. Run locally
```bash
npm run dev
```
Visit `http://localhost:3000` and log in with your credentials.

### 4. Test the app locally
- Login works
- Upload images to media library
- Add/edit locations
- Images display correctly

## Deployment Steps

### Step 1: Build the frontend
```bash
npm run build
```
This creates optimized build in `dist/public/`

### Step 2: Deploy to Firebase
```bash
firebase deploy --only hosting
```
This deploys to `https://joebosse-app.web.app`

### Step 3: Verify Render Backend is Running
- Check status: https://dashboard.render.com
- Ensure your service is deployed and online
- Backend should be at: https://backend-x65t.onrender.com

### Step 4: Test the Live App
1. Open https://joebosse-app.web.app
2. You should see the login page
3. Login with your username/password
4. All features should work:
   - Media library uploads to Supabase ✓
   - Location management ✓
   - Map view ✓

## Troubleshooting

### "Failed to fetch from API"
- Ensure Render backend is deployed and running
- Check browser console for CORS errors
- Verify `backend-x65t.onrender.com` is accessible

### "Upload failed"
- Check Supabase credentials in `.env`
- Verify `imageStore` bucket exists in Supabase
- Check Firebase backend logs on Render dashboard

### "Can't login"
- Database must be synced with migrations: `npm run db:push`
- Check backend logs on Render for database errors

### Clear Firebase cache
```bash
rm -rf dist/
npm run build
firebase deploy --only hosting
```

## Environment Variables

Required variables in `.env`:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
- `SUPABASE_BUCKET` - Storage bucket name (imageStore)
- `SESSION_SECRET` - Session encryption key
- `DATABASE_URL` - PostgreSQL connection string

On Render, these must be set in the dashboard under Environment Variables.

## Quick Commands

```bash
npm run dev          # Local development
npm run build        # Build for production
npm run check        # Type check
npm run db:push      # Sync database schema
firebase deploy      # Deploy to Firebase
```

## Support
If issues persist, check:
1. Render service logs
2. Firebase hosting logs
3. Browser developer console (Network tab)
4. Backend API response (check Authorization headers)