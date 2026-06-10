# Deployment Guide

## 🚀 Deployment Order

Deploy in this order to ensure everything works:

### 1. Deploy Backend API First

```bash
cd artifacts/api-server
vercel
```

When prompted:
- Set up and deploy: **Yes**
- Which scope: Choose your account
- Link to existing project: **No**
- Project name: `admission-system-api` (or your choice)
- Directory: `./` (current directory)
- Override settings: **No**

After deployment, you'll get a URL like: `https://admission-system-api.vercel.app`

#### Set Environment Variables (IMPORTANT!)

Go to Vercel Dashboard → Your API Project → Settings → Environment Variables

Add these:
- `MONGODB_URI`: `mongodb+srv://javad-it:Test-123@cluster0.yoe7dd1.mongodb.net/admission_system?retryWrites=true&w=majority&appName=Cluster0`
- `MONGODB_DB`: `admission_system`
- `ADMIN_EMAIL`: `fatimajaved821@gmail.com`
- `ADMIN_PASSWORD`: `admin123`
- `PORT`: `3000` (Vercel uses this)
- `NODE_ENV`: `production`

Then redeploy:
```bash
vercel --prod
```

### 2. Update Frontend Configuration

Edit `artifacts/admission-system/.env.production`:
```env
VITE_API_URL=https://your-actual-api-url.vercel.app
```

Replace with your actual backend URL from step 1.

### 3. Deploy Frontend

```bash
cd ../..  # Back to root
git add .
git commit -m "Configure production API URL"
git push origin main
```

Vercel will automatically deploy the frontend.

## 🔐 Security Notes

1. Never commit `.env` files to git
2. Keep MongoDB credentials secure
3. Change default admin password after first login
4. Enable MongoDB Atlas IP whitelist (currently set to allow all)

## ✅ Verification

After deployment:

1. Visit your frontend URL: `https://your-app.vercel.app`
2. Go to `/admin/login`
3. Login with:
   - Email: `fatimajaved821@gmail.com`
   - Password: `admin123`

## 🐛 Troubleshooting

### API not responding
- Check Vercel logs for backend deployment
- Verify environment variables are set correctly
- Test API directly: `https://your-api.vercel.app/api/auth/login`

### Frontend can't connect to API
- Verify `VITE_API_URL` in `.env.production`
- Check browser console for CORS errors
- Ensure backend is deployed and running

### MongoDB connection failed
- Verify MongoDB Atlas cluster is active (not paused)
- Check IP whitelist includes `0.0.0.0/0` or Vercel IPs
- Verify credentials in environment variables
