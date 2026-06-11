# 🔧 Vercel Environment Variables - CORRECT WAY

## ❌ WRONG (Your Current Method):

You're using "secret references" with @ symbol:
```
@mongodb_uri
@mongodb_db
```

This causes error: **"references Secret 'mongodb_uri' which does not exist"**

---

## ✅ CORRECT Method:

Add variables **directly** without @ symbol:

### Step 1: Clear All Existing Variables
1. Click on each variable
2. Click "Remove" or delete icon
3. Remove all variables with @ symbols

### Step 2: Add Variables Correctly

Click "Add More" and add ONE BY ONE:

**Variable 1:**
```
Key: MONGODB_URI
Value: mongodb+srv://javad-it:Test-123@cluster0.yoe7dd1.mongodb.net/admission_system?retryWrites=true&w=majority&appName=Cluster0
```

**Variable 2:**
```
Key: MONGODB_DB
Value: admission_system
```

**Variable 3:**
```
Key: ADMIN_EMAIL
Value: fatimajaved821@gmail.com
```

**Variable 4:**
```
Key: ADMIN_PASSWORD
Value: admin123
```

**Variable 5:**
```
Key: NEXTAUTH_SECRET
Value: SnNOPhbjs3opzbtwxMMSKKMEgpkWZ9417laL/PrnYrs=
```

**Variable 6:**
```
Key: NEXTAUTH_URL
Value: https://your-vercel-url.vercel.app
```

(Replace `your-vercel-url` with actual URL after first deploy)

### Step 3: Deploy

Click **"Deploy"** button.

---

## 📸 Visual Guide:

1. **Add More** button → Click
2. **Key** field → Enter variable name (e.g., MONGODB_URI)
3. **Value** field → Paste the actual value (NOT @mongodb_uri)
4. **Repeat** for all 6 variables
5. **Deploy** → Click

---

## ⚠️ Common Mistakes:

### ❌ DON'T:
- Use `@mongodb_uri` (secret reference)
- Paste all variables in one line
- Copy from .env file with equals signs

### ✅ DO:
- Use actual values directly
- Add one variable at a time
- Use Key/Value fields separately

---

## 🔄 After First Deploy:

1. Your app will deploy to: `https://something-xyz123.vercel.app`
2. Go back to **Settings** → **Environment Variables**
3. **Edit** `NEXTAUTH_URL` variable
4. Change to your actual Vercel URL
5. Click **Save**
6. **Redeploy** (Deployments tab → ⋮ → Redeploy)

---

## ✅ Final Checklist:

- [ ] Removed all variables with @ symbols
- [ ] Added MONGODB_URI with full connection string
- [ ] Added MONGODB_DB = admission_system
- [ ] Added ADMIN_EMAIL = fatimajaved821@gmail.com
- [ ] Added ADMIN_PASSWORD = admin123
- [ ] Added NEXTAUTH_SECRET (random key)
- [ ] Added NEXTAUTH_URL (vercel URL)
- [ ] Clicked Deploy

---

Your app will work! 🎉
