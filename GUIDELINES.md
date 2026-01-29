# Backend Guidelines & Documentation

## 📋 Overview

The backend is a **Node.js/Express.js** REST API that handles paste creation, retrieval, and expiration management.

---

## 🗄️ Database Information

### Local Development
- **Database**: SQLite (file-based)
- **Location**: `backend/database.sqlite`
- **Setup**: No setup required! The database file is created automatically when you run the server.

### Production Deployment
- **Database**: PostgreSQL
- **Recommended Host**: [Neon](https://neon.tech) (FREE tier available)
- **Why Neon?**: 
  - Free tier with 0.5GB storage
  - Serverless PostgreSQL
  - Easy setup, no credit card required
  - Perfect for small to medium applications

---

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Database connection (SQLite/PostgreSQL)
│   │   ├── constants.js     # App constants & settings
│   │   └── index.js
│   │
│   ├── controllers/         # HTTP Request Handlers
│   │   ├── pasteController.js
│   │   └── index.js
│   │
│   ├── middlewares/         # Express Middlewares
│   │   ├── errorHandler.js  # Global error handling
│   │   ├── validator.js     # Input validation (express-validator)
│   │   ├── rateLimiter.js   # Rate limiting protection
│   │   └── index.js
│   │
│   ├── models/              # Sequelize Models
│   │   ├── Paste.js         # Paste data model
│   │   └── index.js
│   │
│   ├── routes/              # API Route Definitions
│   │   ├── pasteRoutes.js
│   │   └── index.js
│   │
│   ├── services/            # Business Logic Layer
│   │   ├── pasteService.js  # Core paste operations
│   │   └── index.js
│   │
│   ├── utils/               # Utility Functions
│   │   ├── idGenerator.js   # Unique ID generation (nanoid)
│   │   ├── expirationCalculator.js
│   │   ├── apiResponse.js   # Standardized responses
│   │   └── index.js
│   │
│   ├── app.js               # Express app configuration
│   └── index.js             # Server entry point
│
├── .env.example             # Environment variables template
├── .gitignore
└── package.json
```

---

## 🔧 Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| Sequelize | ORM for database |
| SQLite/PostgreSQL | Database |
| nanoid | Unique ID generation |
| express-validator | Input validation |
| express-rate-limit | Rate limiting |
| Helmet | Security headers |
| CORS | Cross-origin requests |
| dotenv | Environment variables |

---

## 📡 API Endpoints

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API information |
| GET | `/api/health` | Health check |

### Paste Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pastes` | Create new paste |
| GET | `/api/pastes/:id` | Get paste (increments views) |
| GET | `/api/pastes/:id/meta` | Get metadata only |
| DELETE | `/api/pastes/:id` | Delete paste |
| GET | `/api/pastes/stats` | Get statistics |

### Create Paste Request

```json
POST /api/pastes
Content-Type: application/json

{
  "content": "console.log('Hello World');",  // Required
  "title": "My Code Snippet",                // Optional (default: "Untitled")
  "syntax": "javascript",                    // Optional (default: "plaintext")
  "expirationType": "time",                  // "never" | "time" | "views" | "both"
  "expirationMinutes": 60,                   // Required if time/both
  "maxViews": 100                            // Required if views/both
}
```

### Response Format

```json
{
  "success": true,
  "message": "Paste created successfully",
  "data": {
    "id": "abc12XYZ",
    "content": "...",
    "title": "My Code Snippet",
    "syntax": "javascript",
    "expiration_type": "time",
    "expires_at": "2024-01-30T10:00:00.000Z",
    "max_views": null,
    "view_count": 0,
    "remaining_views": null,
    "time_remaining": 3600000,
    "created_at": "2024-01-29T10:00:00.000Z",
    "is_expired": false
  },
  "timestamp": "2024-01-29T10:00:00.000Z"
}
```

---

## 🔒 Security Features

1. **Helmet.js** - Sets security HTTP headers
2. **CORS** - Configured for frontend origin only
3. **Rate Limiting**:
   - General: 100 requests per 15 minutes
   - Paste creation: 10 pastes per minute
4. **Input Validation** - All inputs validated via express-validator
5. **SQL Injection Protection** - Sequelize ORM parameterized queries

---

## ⚙️ Environment Variables

Create a `.env` file in the backend folder:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (leave empty for SQLite, or add Neon URL for PostgreSQL)
DATABASE_URL=

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### For Production:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgres://user:password@host.neon.tech:5432/dbname?sslmode=require
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

---

## 🚀 Running Locally

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

The server will start at `http://localhost:5000`

---

## 🌐 Deployment Guide

### Step 1: Create Neon Database (FREE)

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up with GitHub/Google (no credit card)
3. Create a new project
4. Copy the connection string:
   ```
   postgres://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### Step 2: Deploy to Render (FREE)

1. Go to [https://render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new **Web Service**
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `DATABASE_URL=<your-neon-connection-string>`
     - `FRONTEND_URL=<your-vercel-url>`

### Alternative: Deploy to Railway

1. Go to [https://railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

---

## 📝 Key Design Decisions

1. **Service Layer Pattern**: Controllers handle HTTP, services handle business logic
2. **Unique IDs**: Using nanoid with URL-safe alphabet (no confusing chars like 0/O, l/1)
3. **Dual Database Support**: SQLite for development, PostgreSQL for production
4. **Graceful Shutdown**: Server handles SIGTERM/SIGINT for clean shutdown
5. **Standardized Responses**: All API responses follow consistent format

---

## 🧪 Testing the API

Using curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Create paste
curl -X POST http://localhost:5000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello World", "title": "Test"}'

# Get paste
curl http://localhost:5000/api/pastes/<paste-id>
```

---

## ❓ FAQ

**Q: Why SQLite for development?**
A: No setup required, database is just a file, perfect for quick local development.

**Q: Why PostgreSQL for production?**
A: Scalable, reliable, and Neon offers free hosted PostgreSQL with SSL.

**Q: How does expiration work?**
A: Pastes can expire by time (auto-checked on access) or views (counted on each GET request).

**Q: Is the paste deleted when expired?**
A: Currently, expired pastes return a 410 Gone status but remain in the database. A cleanup job can be added to remove them.
