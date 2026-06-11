# Student Admission System - Next.js

Complete student admission management system with camera verification and online testing.

## 🚀 Quick Start

### Installation
```bash
npm install
npm run dev
```

Visit: `http://localhost:3000`

## 📋 Student Test Flow

### Step 1: Camera Verification (`/student/verify`)
- Enable camera for identity verification
- Enter Roll Number
- Enter CNIC Number
- Click "Proceed to Registration"

### Step 2: Registration (`/student/register`)
- Fill in Full Name
- Fill in Father Name
- Select Gender (Male/Female/Other)
- Select Date of Birth
- Click "Start Test"

### Step 3: Take Test (`/test`)
- Answer 50 MCQ questions
- Timer: 45 minutes
- Navigation grid to jump between questions
- Camera monitoring active
- Click "Submit Test" when done

### Step 4: View Results (`/result`)
- See your score and performance
- Subject-wise breakdown
- Pass/Fail status (60% passing)
- Download result option

## 🔐 Admin Access

Click "Admin Panel" button on any page to access admin dashboard.

**Default Credentials:**
- Email: `fatimajaved821@gmail.com`
- Password: `admin123`

## 🎨 Design Theme

- **Background**: White
- **Primary Color**: Blue (#2563eb)
- **Text**: Black
- **Buttons**: Blue background with white text
- **Cards**: White with blue borders

## 🗄️ MongoDB Configuration

Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://javad-it:Test-123@cluster0.yoe7dd1.mongodb.net/admission_system?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=admission_system
ADMIN_EMAIL=fatimajaved821@gmail.com
ADMIN_PASSWORD=admin123
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 📦 Deployment to Vercel

1. Push to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

## 🔧 Tech Stack

- Next.js 15
- React 19
- TypeScript
- MongoDB
- Tailwind CSS
- Shadcn/ui Components

## 📄 License

MIT

