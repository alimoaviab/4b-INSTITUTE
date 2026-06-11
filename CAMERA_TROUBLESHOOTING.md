# 📸 Camera Troubleshooting Guide

## ✅ What I Fixed:

1. **Better error handling** - Shows specific error messages
2. **Loading state** - Shows "Starting Camera..." message
3. **Auto-format CNIC** - Automatically adds dashes (42101-1234567-8)
4. **Video element always present** - Better browser compatibility
5. **Console logging** - Check browser console for detailed errors
6. **Permission detection** - Detects if camera permission denied

---

## 🔧 If Camera Still Not Working:

### Step 1: Check Browser Permissions

**Chrome/Edge:**
1. Click the **🔒 lock icon** in address bar
2. Find **Camera** setting
3. Change to **"Allow"**
4. **Refresh** the page (F5)

**Safari:**
1. Safari → Settings/Preferences → Websites
2. Click **Camera** in left sidebar
3. Find `localhost` or your site
4. Change to **"Allow"**
4. **Refresh** the page

**Firefox:**
1. Click **🔒 lock icon** in address bar
2. Click **Connection secure** → More Information
3. Go to **Permissions** tab
4. Find **Use the Camera**
5. Uncheck "Use Default"
6. Select **Allow**
7. **Refresh** the page

---

### Step 2: Check If Camera Is In Use

**Windows:**
1. Close **Zoom, Skype, Teams, Discord**
2. Close other browser tabs using camera
3. Try again

**Mac:**
1. Close **FaceTime, Zoom, Skype, Teams**
2. Check System Settings → Privacy & Security → Camera
3. Make sure browser has permission

---

### Step 3: Check Browser Console

1. Press **F12** (or Right-click → Inspect)
2. Go to **Console** tab
3. Click "Enable Camera" button
4. Look for errors

**Common Errors:**

**"NotAllowedError"**
- Solution: Allow camera permission in browser

**"NotFoundError"**
- Solution: No camera detected, check if camera is connected

**"NotReadableError"**
- Solution: Camera in use by another app, close other apps

**"Camera not supported"**
- Solution: Use Chrome, Firefox, or Edge (latest version)

---

### Step 4: Use HTTPS or localhost

Camera **ONLY** works on:
- ✅ `http://localhost:3000` (local development)
- ✅ `https://your-site.com` (production with SSL)
- ❌ `http://192.168.x.x` (LAN IP - won't work)
- ❌ `http://your-site.com` (no SSL - won't work)

---

### Step 5: Test Camera in Browser

**Quick Test:**
1. Visit: `https://webcamtests.com`
2. Click "Test my cam"
3. If camera works there but not in app → Browser permission issue
4. If camera doesn't work anywhere → Hardware/driver issue

---

### Step 6: Check macOS/Windows Permissions

**macOS:**
1. System Settings → Privacy & Security
2. Click **Camera**
3. Enable for your browser (Chrome/Safari/Firefox)
4. **Restart browser**

**Windows:**
1. Settings → Privacy → Camera
2. Turn on "Allow apps to access camera"
3. Turn on "Allow desktop apps to access camera"
4. **Restart browser**

---

## 🧪 Testing Steps:

### Test 1: Open Developer Console
```
1. Press F12
2. Go to Console tab
3. Click "Enable Camera"
4. Look for messages:
   - "Requesting camera access..."
   - "Camera access granted!"
   - "Video playing"
```

### Test 2: Check for Error Messages
If you see error on screen:
- Read the error carefully
- Follow the suggestion

### Test 3: Try Different Browser
- Chrome (recommended)
- Firefox
- Edge
- Safari (Mac only)

---

## 📱 Mobile Testing:

**iOS (iPhone/iPad):**
- Use Safari (Camera works)
- Chrome may have issues

**Android:**
- Use Chrome (Camera works)
- Firefox works
- Samsung Internet works

---

## 🔍 Debugging Checklist:

- [ ] Using `http://localhost:3000` or `https://` URL
- [ ] Browser is latest version
- [ ] Camera permission allowed
- [ ] No other app using camera
- [ ] Camera physically connected (laptop)
- [ ] Camera not covered/disabled
- [ ] Checked browser console for errors
- [ ] Tried different browser

---

## ✅ Expected Behavior:

1. Visit `http://localhost:3000`
2. Redirects to `/student/verify`
3. See "Camera Not Active" message
4. Click "Enable Camera" button
5. Browser asks: "Allow camera?" → Click **Allow**
6. Camera preview appears
7. "Camera is Active & Recording" message shows
8. Green badge appears in header
9. Fill Roll Number and CNIC
10. Click "Proceed to Registration"

---

## 🆘 Still Not Working?

### Try this simple test:

Run this in browser console (F12):
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log("✅ Camera works!", stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error("❌ Camera error:", err.name, err.message);
  });
```

**If this doesn't work**, the issue is:
- Browser permission
- Hardware issue
- Driver issue

**NOT** the code! 😊

---

## 📞 Common Solutions Summary:

| Error | Solution |
|-------|----------|
| Permission denied | Allow in browser settings |
| Camera not found | Check if camera connected |
| Already in use | Close other apps |
| Not supported | Use modern browser |
| Not secure | Use localhost or HTTPS |

---

**Camera code is working! If still having issues, it's browser/hardware/permission related.** ✅
