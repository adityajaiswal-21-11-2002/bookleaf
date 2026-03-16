# BookLeaf Author Support & Communication Portal

Production-quality full-stack support ticket system for BookLeaf Publishing. Built with Next.js 14, MongoDB, Groq AI, and Socket.io.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                      │
│  Author Portal │ Admin Portal │ TailwindCSS │ TypeScript         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Layer (Route Handlers)                    │
│  /api/auth/* │ /api/books/* │ /api/tickets/* │ /api/admin/*      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                                │
│  authService │ ticketService │ aiService │ bookService            │
└─────────────────────────────────────────────────────────────────┘
                                    │
              ┌────────────────────┼────────────────────┐
              ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  MongoDB/Mongoose │  │   Groq API       │  │  Socket.io        │
│  User, Book,      │  │  llama3-70b     │  │  Real-time        │
│  Ticket models    │  │  Classification  │  │  ticket:updated  │
└──────────────────┘  │  Draft response   │  └──────────────────┘
                      └──────────────────┘
```

### Design Principles

- **Service Layer**: Business logic in `services/`, API routes are thin handlers
- **Error Handling**: Custom `AuthError`, `TicketError` with status codes; AI failures never block ticket creation
- **Cost Efficiency**: Token-optimized AI prompts, summarized KB, strict output formats

---

## AI Prompt Design

### 1. Ticket Classification

**Output format**: `{"category":"","priority":""}`

**Token optimization**:
- System prompt: ~80 tokens (category/priority lists only)
- User input: Subject + first 500 chars of description
- Max output: 80 tokens
- **Total ~200 tokens per classification**

**Categories**: Royalty & Payments | ISBN & Metadata Issues | Printing & Quality | Distribution & Availability | Book Status & Production Updates | General Inquiry

**Priorities**: Critical | High | Medium | Low

### 2. Draft Response Generation

**Output format**: `{"response":""}`

**Token optimization**:
- KB summary: ~80 tokens (vs 200+ full KB)
- User input: Book + Subject + first 800 chars
- Max output: 400 tokens
- **Total ~600 tokens per generation**

**Tone**: Empathetic, professional, specific timelines, next steps. No hallucination.

### Failure Handling

- If `GROQ_API_KEY` missing → use defaults, log warning
- If API call fails → log error, return fallback, **ticket still created**
- Admin can always manually reply without AI

---

## Error Handling Strategy

| Layer | Strategy |
|-------|----------|
| **API Routes** | Try/catch, return `{ error: string }` with appropriate status |
| **Services** | Throw `AuthError`/`TicketError` with statusCode |
| **AI** | Never throw; return defaults on failure |
| **Middleware** | Redirect unauthenticated to login |

---

## Cost Optimization

1. **Prompt templates**: Minimal system prompts, no redundant context
2. **Summarized KB**: 80-token summary vs full 200+ token KB
3. **Input truncation**: 500 chars for classification, 800 for response
4. **Structured output**: JSON format reduces retries
5. **Low temperature**: 0.2 classification, 0.4 response

---

## API Documentation

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns user + sets cookie |
| POST | `/api/auth/register` | Register (name, email, password, role?) |
| GET | `/api/auth/me` | Current user (requires auth) |

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List books (author: own, admin: all) |
| GET | `/api/books/:id` | Get book by ID |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets` | Create ticket (author) |
| GET | `/api/tickets` | List tickets |
| GET | `/api/tickets/:id` | Get ticket detail |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/tickets` | List with filters (status, priority, category, date) |
| PATCH | `/api/admin/tickets/:id/status` | Update status |
| POST | `/api/admin/tickets/:id/respond` | Send response |
| POST | `/api/admin/tickets/:id/notes` | Add internal note |
| PATCH | `/api/admin/tickets/:id/assign` | Assign to self |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/classify` | Classify ticket (subject, description) |
| POST | `/api/ai/generate-response` | Generate draft (subject, description, bookTitle?) |

---

## Real-time (Socket.io)

When running with **custom server** (`npm run dev:socket`):

- Admin replies → `ticket:updated` emitted to author's room
- Author joins `tickets:{authorId}` on connect
- Frontend uses `useTicketUpdates` hook

**Vercel deployment**: Socket.io requires persistent connection; use `npm run dev` or `next start` for serverless. SSE fallback at `/api/sse/tickets` for polling.

---

## Setup Instructions

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookleaf
JWT_SECRET=your-secret-key-min-32-chars
GROQ_API_KEY=your-groq-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- **MONGODB_URI**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **JWT_SECRET**: `openssl rand -base64 32`
- **GROQ_API_KEY**: [Groq Console](https://console.groq.com/keys)

### 3. Seed

```bash
npm run seed
```

Uses `scripts/bookleaf_sample_data.json`. Creates 10 authors, 18 books, 8 tickets.

### 4. Run

**Standard (no Socket.io)**:
```bash
npm run dev
```

**With Socket.io** (real-time ticket updates):
```bash
npm run build
npm run dev:socket
```

### 5. Run API Tests

With the dev server running (`npm run dev`):

```bash
npm run test:api
```

Verifies: auth, books, tickets, admin routes, role-based access.

### 7. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Author | priya.sharma@email.com | password123 |
| Admin | admin@bookleaf.com | admin123 |

---

## Project Structure

```
/app
  /api          # Route handlers (thin)
  /author       # Author portal pages
  /admin        # Admin portal pages
/components     # UI components
/services       # Business logic
  authService
  ticketService
  aiService
  bookService
/lib            # Utilities
  mongodb.ts
  auth.ts
  socketEmitter.js
/models         # Mongoose schemas
/middleware.ts  # Auth redirect
/scripts
  seed.js
  bookleaf_sample_data.json
server.js       # Custom server (Socket.io)
```

---

## Deployment

**Vercel**: Use `next build` + `next start`. Socket.io disabled; SSE fallback for real-time.

**Railway/Render**: Use `node server.js` for full Socket.io support.

---

## License

MIT
