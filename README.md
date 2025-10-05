# Fairvia Wave 1 🌊

**Focus MVP - Unit Management System**

A Next.js application for managing units with public/private event timelines, built with Supabase authentication and PostgreSQL.

---

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Set up database:**
   - Run SQL from `setup-with-rls.sql` in Supabase SQL Editor
   - Or use: `npx prisma db push` (if direct connection works)

4. **Seed database (optional):**
   ```bash
   npx prisma db seed
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Complete setup guide
- **[DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)** - Production deployment guide
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Vercel-specific deployment steps

---

## ✨ Features

### Authentication
- 🔐 Magic link authentication via Supabase
- 🛡️ Protected routes with middleware
- 👤 Session management

### Unit Management
- 📝 Create and edit units
- 📢 Publish units with QR codes
- 🏷️ Draft/Published status tracking

### Event Timeline
- 📅 Public timeline (PII-safe)
- 🔒 Internal timeline (API key protected)
- 🎯 Event types: inquiries, tours, status changes
- 👁️ Visibility control (public/internal)

### Security
- 🔐 Row Level Security (RLS) enabled
- 🔑 API authentication required
- 🚫 PII filtering on public endpoints
- 🛡️ Server-side service role protection

---

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## 📁 Project Structure

```
fairviawave/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   └── units/           # Unit & event endpoints
│   ├── auth/                # Authentication
│   ├── dashboard/           # Protected dashboard
│   ├── login/               # Login page
│   └── page.tsx             # Landing page
├── lib/                     # Utilities
│   └── supabase/           # Supabase clients
├── prisma/                  # Database schema & seeds
├── middleware.ts            # Auth middleware
└── .env                     # Environment variables
```

---

## 🔌 API Endpoints

### Units
- `GET /api/units` - List all units
- `POST /api/units` - Create unit (auth required)

### Publishing
- `POST /api/units/[id]/publish` - Publish unit, generate QR (auth required)

### Events
- `POST /api/units/[id]/events` - Add event (auth required)

### Timelines
- `GET /api/units/[id]/timeline/public` - Public timeline (PII-safe)
- `GET /api/units/[id]/timeline/internal` - Internal timeline (API key required)

---

## 🔐 Environment Variables

Required variables (see `.env.example`):

```bash
# Database
DATABASE_URL=                 # Supabase pooler connection
DIRECT_URL=                   # Direct connection (for migrations)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=# Anon/public key
SUPABASE_SERVICE_ROLE_KEY=    # Service role key (server-side only)

# App
PUBLIC_BASE_URL=              # Your app URL
INTERNAL_API_KEY=             # Internal API authentication
```

---

## 🗄️ Database Schema

### Units Table
- `id` - Unique identifier
- `name` - Unit name
- `description` - Optional description
- `status` - draft | published
- `publishedAt` - Publication timestamp
- `createdAt`, `updatedAt` - Timestamps

### Events Table
- `id` - Unique identifier
- `unitId` - Foreign key to units
- `type` - Event type (inquiry, tour, etc.)
- `content` - Event description
- `metadata` - JSON metadata
- `visibility` - public | internal
- `createdAt` - Timestamp

---

## 🧪 Testing

### Test Database Connection
```bash
node test-db.js
```

### Run Build
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Add environment variables
   - Deploy!

3. **Post-Deployment:**
   - Update `PUBLIC_BASE_URL` with Vercel URL
   - Add Vercel URL to Supabase redirect URLs
   - Test authentication flow

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed steps.

---

## ✅ Verify Deployment

After deploying (or when testing locally with `PROD_URL=http://localhost:3000`):

```bash
# Health
curl -s "$PROD_URL/api/health" | jq .

# Metrics summary
curl -s "$PROD_URL/api/metrics/summary" | jq .

# Public page (open in browser)
# macOS
open "$PROD_URL/u/<UNIT_ID>?token=<TOKEN>"
# Linux
xdg-open "$PROD_URL/u/<UNIT_ID>?token=<TOKEN>"
# Windows (PowerShell)
start "$PROD_URL/u/<UNIT_ID>?token=<TOKEN>"

# Chain integrity verification
curl -s "$PROD_URL/api/units/<UNIT_ID>/verify" | jq .
```

Expected:
- Health returns `{ ok: true }`
- Metrics return integers and `published_rate`
- Public page renders the timeline UI and paginates
- Chain verify returns `ok: true` (older data may need backfill)

---

## 🔒 Security

### Implemented
- ✅ Row Level Security (RLS) on all tables
- ✅ Authentication required for mutations
- ✅ PII filtering on public endpoints
- ✅ API key protection for internal data
- ✅ Environment variable security
- ✅ Server-side credential usage

### Best Practices
- Never commit `.env` to git
- Rotate API keys regularly
- Use Supabase Vault for production secrets
- Enable 2FA on admin accounts
- Monitor API usage

---

## 📊 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
npm run seed         # Seed database
```

---

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase pooler is accessible
- Test with `node test-db.js`

### Auth Not Working
- Verify Supabase redirect URLs
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure cookies enabled

### Build Failures
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all dependencies installed

---

## 📝 License

Private - Fairvia Wave 1 Project

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Support

For issues and questions:
- Check documentation in this repository
- Review [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)
- See [Troubleshooting](#-troubleshooting) section

---

**Status:** ✅ Production Ready | 🚀 Deploying to Vercel

**Last Updated:** October 2025
