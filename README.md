# Student Admission System - Next.js

Complete student admission management system built with Next.js 15, MongoDB, and TypeScript.

## 🚀 Features

- ✅ Admin authentication with JWT tokens
- ✅ MongoDB Atlas integration
- ✅ Responsive dashboard
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Next.js App Router
- ✅ Server-side API routes

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your MongoDB credentials:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/admission_system
   MONGODB_DB=admission_system
   ADMIN_EMAIL=fatimajaved821@gmail.com
   ADMIN_PASSWORD=admin123
   ```

## 🏃 Running Locally

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Visit: `http://localhost:3000`

## 🔐 Default Admin Credentials

- **Email**: fatimajaved821@gmail.com
- **Password**: admin123

(Change these after first login in production!)

## 📦 Deployment to Vercel

### Method 1: Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. **Root Directory**: Set to `admission-system-nextjs`
5. Add Environment Variables:
   - `MONGODB_URI`
   - `MONGODB_DB`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
6. Click "Deploy"

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd admission-system-nextjs
vercel

# Follow prompts and add environment variables when asked
```

## 🗂️ Project Structure

```
admission-system-nextjs/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts      # Login API
│   │       └── me/route.ts         # Get current user
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login page
│   │   └── dashboard/page.tsx      # Admin dashboard
│   ├── layout.tsx
│   └── page.tsx                    # Home (redirects to admin)
├── components/
│   └── ui/                         # UI components
├── lib/
│   ├── mongodb.ts                  # Database connection
│   └── utils.ts                    # Utility functions
├── .env.local                      # Environment variables (gitignored)
├── .env.example                    # Example environment file
└── package.json
```

## 🔒 Security Notes

1. **Never commit `.env.local` to git**
2. Change default admin password after deployment
3. Use strong MongoDB passwords
4. Enable MongoDB IP whitelist (or use 0.0.0.0/0 for Vercel)
5. Generate secure NEXTAUTH_SECRET: `openssl rand -base64 32`

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. Check if MongoDB Atlas cluster is active (not paused)
2. Verify IP whitelist includes `0.0.0.0/0` or Vercel IPs
3. Confirm credentials are correct
4. Check connection string format

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables Not Working

- Restart dev server after changing `.env.local`
- On Vercel, redeploy after updating environment variables

## 📝 API Routes

- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin (requires Bearer token)

## 🎨 Customization

### Adding More Pages

Create new pages in `app/admin/`:
```typescript
// app/admin/students/page.tsx
export default function StudentsPage() {
  return <div>Students Page</div>;
}
```

### Adding More API Routes

Create new routes in `app/api/`:
```typescript
// app/api/students/route.ts
export async function GET() {
  return NextResponse.json({ students: [] });
}
```

## 📚 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Deployment**: Vercel

## 🤝 Support

For issues or questions, check:
- MongoDB Atlas connection
- Environment variables
- Vercel deployment logs

## 📄 License

MIT License
