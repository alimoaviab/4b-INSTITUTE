# ✅ Easiest Deployment Method

## Option 1: Using Railway (Recommended - Sabse Aasan!)

### Backend Deploy (5 minutes):

1. **Railway account banao**: https://railway.app (GitHub se sign in)

2. **New Project** → **Deploy from GitHub repo**

3. Select `Student-Admission-System-main` repo

4. **Root Directory** set karo: `artifacts/api-server`

5. **Environment Variables** add karo:
   ```
   MONGODB_URI=mongodb+srv://javad-it:Test-123@cluster0.yoe7dd1.mongodb.net/admission_system?retryWrites=true&w=majority&appName=Cluster0
   MONGODB_DB=admission_system
   ADMIN_EMAIL=fatimajaved821@gmail.com
   ADMIN_PASSWORD=admin123
   PORT=4000
   ```

6. Deploy button click karo

7. Railway tumhe URL dega: `https://your-app.railway.app`

### Frontend Update:

1. `.env.production` file mein Railway URL dalo:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```

2. Git push karo:
   ```bash
   git add .
   git commit -m "Connect to Railway API"
   git push
   ```

3. Vercel automatic deploy karega!

---

## Option 2: Using Render.com (Also Free!)

1. **Render account**: https://render.com

2. **New Web Service** → Connect GitHub repo

3. **Root Directory**: `artifacts/api-server`

4. **Build Command**: `npm run build`

5. **Start Command**: `npm start`

6. **Environment Variables** (same as Railway)

7. Deploy!

---

## 🎯 Easiest Hai Railway!

- Free tier available
- Automatic deployments
- Easy environment variables
- Better for Node.js

**Abhi Railway try karo - 5 minutes mein ho jayega!** 🚀
