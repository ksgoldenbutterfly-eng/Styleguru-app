# StyleGuru – AI-Powered Accessible Fashion Assistant

StyleGuru is a full-stack AI fashion assistant that helps users discover outfits, manage their digital wardrobe, and receive personalized recommendations powered by Google Gemini.

---

## 🚀 Features

- **User Authentication** – Register, login, forgot password (Supabase Auth)
- **Digital Wardrobe** – Add, edit, delete clothing items with image uploads
- **AI Outfit Generator** – Gemini-powered outfit recommendations for any occasion
- **Outfit Analyzer** – Upload outfit photos for AI-powered style feedback
- **AI Fashion Chatbot** – Chat with StyleGuru for personalized fashion advice
- **Voice Input** – Use your microphone to talk to the AI stylist
- **Accessibility Preferences** – Inclusive recommendations for diverse needs
- **Favorites** – Save and revisit your favorite outfits
- **Dashboard** – Real-time wardrobe and activity stats
- **Row Level Security** – Each user's data is fully isolated

---

## 📁 Project Structure

```
styleguru/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript
│   └── supabase/
│       └── migrations/001_initial_schema.sql
├── vercel.json        # Vercel deployment configuration
├── .gitignore
└── README.md
```

---

## 🛠️ Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Supabase** account (free tier works)
- **Google AI Studio** account (for Gemini API key)

---

## ⚙️ Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd styleguru
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase SQL Editor, run the contents of:
   `backend/supabase/migrations/001_initial_schema.sql`
3. Go to **Authentication → Settings** and configure:
   - Enable Email/Password auth
   - Set Site URL to your frontend URL
4. Go to **Storage** and verify the `wardrobe-images` bucket was created by the migration
5. Collect your credentials from **Settings → API**:
   - `Project URL`
   - `anon` public key
   - `service_role` secret key

### Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create a new API key
3. Note your API key

### Step 4: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

### Step 5: Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Step 6: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 🏃 Running Locally

### Start the Backend

```bash
cd backend
npm run dev
```

Backend will run at: `http://localhost:5000`

### Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🧪 Testing the Application

1. Open `http://localhost:5173`
2. Click **Get Started** → Register a new account
3. Complete the onboarding wizard
4. Go to **Wardrobe** → Add some clothing items (with or without images)
5. Go to **Outfit Generator** → Select an occasion and generate outfits
6. Go to **Outfit Analyzer** → Upload an outfit photo for AI feedback
7. Go to **AI Stylist** → Chat with StyleGuru about fashion
8. Heart your favorite outfits → View them in **Favorites**

### API Health Check

```bash
curl http://localhost:5000/api/v1/health
```

---

## 🏗️ Backend API Reference

All protected routes require: `Authorization: Bearer <supabase_jwt_token>`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/profile` | Get user profile |
| `PUT` | `/api/v1/profile` | Update user profile |
| `POST` | `/api/v1/profile/avatar` | Upload avatar image |
| `GET` | `/api/v1/wardrobe` | List wardrobe items |
| `POST` | `/api/v1/wardrobe` | Add wardrobe item |
| `PUT` | `/api/v1/wardrobe/:id` | Update wardrobe item |
| `DELETE` | `/api/v1/wardrobe/:id` | Delete wardrobe item |
| `POST` | `/api/v1/outfits/generate` | Generate AI outfit recommendations |
| `GET` | `/api/v1/outfits` | List all outfits |
| `GET` | `/api/v1/outfits/:id` | Get specific outfit |
| `DELETE` | `/api/v1/outfits/:id` | Delete outfit |
| `POST` | `/api/v1/outfits/favorite/:id` | Mark as favorite |
| `DELETE` | `/api/v1/outfits/favorite/:id` | Remove from favorites |
| `GET` | `/api/v1/outfits/favorites/list` | Get all favorites |
| `POST` | `/api/v1/analysis/outfit` | Analyze outfit image |
| `GET` | `/api/v1/analysis/history` | Get analysis history |
| `POST` | `/api/v1/ai/chat` | Send chat message |
| `GET` | `/api/v1/ai/conversations` | List conversations |
| `GET` | `/api/v1/ai/conversations/:id/messages` | Get messages |
| `GET` | `/api/v1/dashboard/stats` | Get dashboard statistics |

---

## 🌐 Deployment

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

Set these environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (your backend URL)

### Deploy Backend to Vercel (as Serverless)

```bash
cd backend
vercel --prod
```

> **Note:** The Express backend needs to export the app for Vercel serverless. For full Express support with long-running connections, consider deploying to:
> - **Railway** (`railway.app`) — Recommended for full Express support
> - **Render** (`render.com`) — Free tier available
> - **Fly.io** — Great Docker-based deployment

For Railway deployment:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
```

### Update Frontend After Deploying Backend

Once your backend is deployed, update `VITE_API_BASE_URL` in your frontend Vercel environment to point to your backend URL.

---

## 🔒 Security

- Gemini API key is **backend-only** — never exposed to frontend
- Supabase service role key is **backend-only**
- All database tables use **Row Level Security (RLS)**
- JWT tokens verified on every protected route
- Input validation with **Zod** on both frontend and backend
- Image uploads validated for type and size
- **Helmet** security headers on all responses
- **CORS** configured for your frontend URL only
- Rate limiting on AI endpoints (10 req/min) and general API (100 req/15min)

---

## 🎨 Fashion Support

**Fashion Types:**
Indian Wear, Western Wear, Indo-Western, Casual, Formal, Traditional

**Categories:**
Tops, Shirts, T-Shirts, Trousers, Jeans, Dresses, Skirts, Sarees, Kurtas, Footwear, Accessories

**Occasions:**
College, Office, Parties, Weddings, Festivals, Casual Outings, Interviews

---

## 🌟 Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router v6 |
| State/Forms | React Hook Form, Zod validation |
| Backend | Node.js, Express.js, TypeScript |
| AI | Google Gemini (`@google/genai`) |
| Database | Supabase PostgreSQL with RLS |
| Auth | Supabase Authentication |
| Storage | Supabase Storage |
| Security | Helmet, CORS, express-rate-limit |
| Uploads | Multer (memory storage) |

---

## 📄 License

MIT License — Built with ❤️ by the StyleGuru team.

