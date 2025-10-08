# Fairvia Wave 2 - Spine

This documentation covers the Wave 2 implementation, focusing on the core compliance engine, template versioning, and trust badge functionality.

## 🏗️ Architecture

Wave 2 introduces three primary modules:

1. **Compliance Engine (CA & FL)** - Handles timing rules, countdown logic, and state management for compliance events.
2. **Template Store & Versioning** - Manages document templates with version history and metadata.
3. **Trust Badge & Archive Export** - Provides cryptographic verification and export functionality for compliance records.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Supabase project (for auth and storage)

### Setup

1. Clone the repository
```bash
git clone https://github.com/your-org/fairviawave.git
cd fairviawave
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and other settings
```

4. Run database migrations
```bash
npm run prisma:migrate
```

5. Seed initial data
```bash
npm run seed
```

6. Start the development server
```bash
npm run dev
```

## 📦 Core Components

### Compliance Engine

The compliance engine manages timing rules, notifications, and state transitions for compliance events. It supports both California and Florida compliance regimes.

Key files:
- `lib/compliance/engine.ts` - Core rule processing logic
- `lib/compliance/timers.ts` - Countdown and deadline management
- `app/dashboard/metrics.tsx` - Compliance metrics visualization

### Template Store

The template store provides version-controlled document templates that can be customized per property or unit.

Key files:
- `lib/templates/store.ts` - Template storage and retrieval
- `lib/templates/versioning.ts` - Version history tracking
- `app/u/[unitId]/templates/page.tsx` - Template management UI

### Trust Badge & Archive Export

The archive export functionality bundles compliance documents with cryptographic verification for export and third-party verification.

Key files:
- `lib/archive.ts` - Archive creation and management
- `lib/cryptography.ts` - Signing and verification utilities
- `app/u/[unitId]/export/page.tsx` - Export UI
- `tests/archive.test.ts` - Archive functionality tests

## 🧪 Testing

Run the test suite with:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run e2e tests
npm run test:e2e
```

## 📊 Compliance Verification

The trust badge system allows third parties to verify the authenticity of exported compliance archives. The verification flow works as follows:

1. Export a compliance archive from the unit dashboard
2. Share the archive and signature files with the verifier
3. Verifier uploads these files to the verification portal
4. The system validates the signature and displays the verification status

The trust badge can also be embedded as a widget on external websites using the provided JavaScript snippet.