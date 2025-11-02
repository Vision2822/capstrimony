# 🎯 Capstrimony

> Find your perfect capstone teammates at PESU

Capstrimony is a modern, Tinder-style matchmaking platform designed specifically for PESU students to find compatible teammates for their final year capstone projects. Built with cutting-edge technologies and a focus on user experience.

## ✨ Features

### 🔐 Secure Authentication

- **PESU Academy Integration** - Login using your official PESU credentials
- **Automated Profile Sync** - Automatically pulls your academic details (name, PRN, SRN, branch, semester)
- **Session Management** - Secure JWT-based sessions with NextAuth v5

### 📝 Smart Onboarding

- **5-Step Wizard** - Bio, Skills, Preferences, Availability, Social Links
- **Auto-save Progress** - Never lose your data, saves at each step
- **Profile Completion Tracking** - Visual progress indicators (0-100%)
- **Smart Defaults** - Sensible fallbacks for faster setup

### 🎯 Profile Management

- **Skills Selection** - 19+ technical skills (JavaScript, Python, React, ML, etc.)
- **Domain Preferences** - Choose from Web Dev, AI/ML, Blockchain, IoT, and more
- **Role Selection** - Frontend, Backend, Full-stack, Designer, PM, Data Scientist
- **Availability Slider** - Visual hours-per-week selector (5-40 hours)
- **Work Style** - Remote, In-person, or Hybrid preferences
- **Social Integration** - Connect GitHub, LinkedIn, and portfolio

### 🎨 Modern UI/UX

- **Beautiful Design** - Clean, gradient backgrounds with glassmorphism
- **Responsive** - Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion for delightful interactions
- **Accessible** - Built with Radix UI primitives (WCAG compliant)
- **Dark Mode Ready** - CSS variables for easy theming

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 15.1.4 (App Router, React Server Components)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **UI Components:** shadcn/ui + Radix UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend

- **API:** Next.js API Routes (Route Handlers)
- **Authentication:** NextAuth.js v5 (beta)
- **Database ORM:** Prisma 6.1
- **Database:** PostgreSQL (Neon)
- **Validation:** Zod + React Hook Form

### Authentication & Scraping

- **Custom PESU Scraper:** Axios + Cheerio
- **Cookie Management:** tough-cookie
- **Session Strategy:** JWT (HTTP-only cookies)

### DevOps & Tools

- **Deployment:** Vercel
- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Linting:** ESLint + Prettier
- **Database UI:** Prisma Studio

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ or 22+ ([Download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)
- **PostgreSQL Database** (We recommend [Neon](https://neon.tech) - free tier available)
- **PESU Academy Account** (for authentication)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Vision2822/capstrimony.git
    cd capstrimony
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Set up environment variables**

    ```bash
    cp .env.example .env.local
    ```

    Update `.env.local` with your actual values:

    ```env
    # Database (Get from Neon.tech)
    DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
    DIRECT_URL=postgresql://user:password@host:5432/database?sslmode=require

    # NextAuth (Generate with: openssl rand -base64 32)
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-super-secret-key-here

    # App Config
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_APP_NAME=Capstrimony
    ```

4.  **Generate a secure secret**

    ```bash
    openssl rand -base64 32
    ```

    Copy the output and use it as `NEXTAUTH_SECRET`.

5.  **Push database schema**

    ```bash
    npm run db:push
    ```

6.  **Generate Prisma Client**

    ```bash
    npm run db:generate
    ```

7.  **Run development server**

    ```bash
    npm run dev
    ```

8.  **Open your browser**

    Visit [http://localhost:3000](http://localhost:3000)

## 📦 Project Structure

```text
capstrimony/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/    # NextAuth API route
│   │   │   └── onboarding/            # Profile update API
│   │   ├── login/                     # Login page
│   │   ├── onboarding/                # 5-step onboarding wizard
│   │   ├── dashboard/                 # User dashboard
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Global styles
│   ├── components/
│   │   └── ui/                        # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts                    # NextAuth configuration
│   │   ├── prisma.ts                  # Prisma client
│   │   ├── pesu-scraper.ts            # PESU Academy scraper
│   │   └── utils.ts                   # Utility functions
│   └── types/
│       └── next-auth.d.ts             # NextAuth type extensions
├── prisma/
│   └── schema.prisma                  # Database schema
├── public/                            # Static assets
├── .env.local                         # Environment variables (local)
├── .env.example                       # Environment template
├── package.json                       # Dependencies
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # This file
```

## 📊 Database Schema

### Key Models

- **User** - Student profiles with PESU data, skills, preferences
- **Project** - Capstone project ideas and descriptions
- **Team** - Team formations and memberships
- **Interaction** - Like/skip/match tracking
- **Message** - In-app messaging (coming soon)

### Enums

- `Department` - CSE, ECE, EEE, ME, CE, BT, AIML, DS
- `Campus` - RR (Ring Road), EC (Electronics City)
- `Skill` - 19 technical skills
- `Domain` - 9 project domains
- `Role` - 8 team roles
- `WorkStyle` - REMOTE, IN_PERSON, HYBRID

## 🎯 Roadmap

### ✅ Completed (Phase 1)

- [x] PESU Academy authentication
- [x] User registration and profile sync
- [x] 5-step onboarding wizard
- [x] Profile completion tracking
- [x] Skills, domains, and role selection
- [x] Availability and work style preferences
- [x] Social links integration
- [x] Dashboard with profile status
- [x] PostgreSQL database with Prisma

### 🚧 In Progress (Phase 2)

- [ ] User profile view page
- [ ] Profile editing functionality
- [ ] Search and filter teammates
- [ ] Advanced filters (skills, domain, availability)

### 📅 Upcoming (Phase 3)

- [ ] Swipe/Match interface (Tinder-style)
- [ ] Match recommendations algorithm
- [ ] Team formation system
- [ ] Team invitations and acceptance
- [ ] In-app messaging
- [ ] Real-time notifications
- [ ] Project posting and discovery

### 🔮 Future (Phase 4)

- [ ] Mobile app (React Native/Flutter)
- [ ] Calendar integration
- [ ] Video chat for team meetings
- [ ] Skill endorsements
- [ ] Feedback and ratings system
- [ ] Admin dashboard
- [ ] Analytics and insights

## 🧪 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Building
npm run build            # Build for production
npm start                # Run production server

# Database
npm run db:push          # Push schema changes to DB
npm run db:generate      # Generate Prisma Client
npm run db:studio        # Open Prisma Studio (DB GUI)
npm run db:migrate       # Create and run migrations

# Code Quality
npm run lint             # Run ESLint
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1.  **Push to GitHub**

    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push
    ```

2.  **Import to Vercel**
    - Go to [vercel.com](https://vercel.com)
    - Click "Import Project"
    - Select your GitHub repository
    - Vercel auto-detects Next.js

3.  **Add Environment Variables**

    In Vercel dashboard → Settings → Environment Variables, add:

    ```text
    DATABASE_URL
    DIRECT_URL
    NEXTAUTH_URL (your Vercel domain)
    NEXTAUTH_SECRET
    NEXT_PUBLIC_APP_URL (your Vercel domain)
    NEXT_PUBLIC_APP_NAME
    ```

4.  **Deploy**

    Click "Deploy" - Done! 🎉

### Other Deployment Options

- **Netlify:** Requires adapter configuration
- **Railway:** Full-stack hosting with database
- **AWS/GCP/Azure:** Manual configuration needed

## 🔒 Security Features

- ✅ **Secure Authentication** - PESU credentials verified against official portal
- ✅ **JWT Sessions** - HTTP-only cookies, no localStorage
- ✅ **CSRF Protection** - Built into NextAuth
- ✅ **SQL Injection Prevention** - Prisma ORM with prepared statements
- ✅ **XSS Protection** - React escapes user input by default
- ✅ **Rate Limiting** - Coming soon for API routes
- ✅ **Environment Secrets** - Never committed to Git

## 🤝 Contributing

We welcome contributions! Here's how:

1.  **Fork the repository**

2.  **Create a feature branch**

    ```bash
    git checkout -b feature/amazing-feature
    ```

3.  **Commit your changes**

    ```bash
    git commit -m "Add some amazing feature"
    ```

4.  **Push to the branch**

    ```bash
    git push origin feature/amazing-feature
    ```

5.  **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting

## 📄 License

This project is licensed under the **MIT License**.
See [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Profile photo from PESU Academy is base64 (large) - stored in DB, not session
- PESU Academy occasionally blocks requests - retry mechanism needed
- Onboarding can be completed with minimal data - validation can be stricter

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/Vision2822/capstrimony/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Vision2822/capstrimony/discussions)

## 📈 Stats

![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=for-the-badge&logo=next.js)![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)![Prisma](https://img.shields.io/badge/Prisma-6.1-2D3748?style=for-the-badge&logo=prisma)![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

---

**Made with ❤️ for PESU students**
_Find your perfect teammate. Build something amazing._ 🚀
