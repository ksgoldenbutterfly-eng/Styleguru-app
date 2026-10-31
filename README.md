# StyleGuru — AI-Powered Accessible Fashion Assistant

<div align="center">

![StyleGuru Banner](https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop)

**An intelligent, accessible, and full-stack fashion web application that empowers users to manage their digital wardrobe, receive personalized AI outfit recommendations, analyze fashion imagery, and chat with a specialized AI fashion stylist.**

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Backend Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://render.com)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat&logo=google)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Project Structure](#2-architecture--project-structure)
3. [Prerequisites](#3-prerequisites)
4. [Local Development Setup](#4-local-development-setup)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Database & Storage Setup (Supabase)](#6-database--storage-setup-supabase)
7. [Backend Deployment Guide — Render](#7-backend-deployment-guide--render)
8. [Frontend Deployment Guide — Vercel](#8-frontend-deployment-guide--vercel)
9. [Complete REST API Reference](#9-complete-rest-api-reference)
10. [Troubleshooting & Common Issues](#10-troubleshooting--common-issues)
11. [Final Production Deployment Checklist](#11-final-production-deployment-checklist)

---

## 1. Project Overview

### Core Mission
**StyleGuru** is designed to eliminate morning decision fatigue, celebrate personal style expression, and make fashion accessible to everyone regardless of physical mobility, sensory sensitivities, or style background.

### Key Capabilities
- **🔐 Frictionless Authentication**: Secure email & password registration with pre-confirmed email delivery to bypass third-party SMTP limits, plus instant self-service password reset.
- **👗 Smart Digital Wardrobe**: Catalog tops, bottoms, dresses, kurtas, sarees, footwear, and accessories with colors, brands, occasions, and photo uploads.
- **✨ AI-Powered Outfit Recommendations**: Generate coordinated 3-look ensemble recommendations tailored to specific occasions (college, office, party, wedding, interview), weather conditions, and color preferences.
- **📸 Visual Outfit Analysis**: Upload any outfit photograph to receive detailed AI-assisted stylistic critique, color theory feedback, suitability ratings (1–10), and actionable improvement tips.
- **💬 Conversational Fashion Assistant**: Real-time AI stylist chatbot powered by Google Gemini supporting streaming context, conversation memory, and browser speech-to-text voice input.
- **♿ Inclusive Accessibility Customization**: Personalize recommendations for sensory needs (e.g., tagless, soft fabrics), mobility preferences (e.g., adaptive fasteners, seated wear), and visual cues.
- **❤️ Favorites & Wardrobe Analytics**: Bookmark top outfits and monitor real-time distribution charts of wardrobe categories and weekly styling activity.

### Technologies Used

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript 5, React Router v6, Tailwind CSS 3, Lucide Icons, React Hook Form, Zod |
| **Backend** | Node.js, Express.js 4, TypeScript 5, Multer (Memory Storage), Helmet, CORS, Express Rate Limit |
| **Artificial Intelligence** | Google Gemini API (`@google/genai` SDK with `gemini-flash-latest`) |
| **Database & Auth** | Supabase (PostgreSQL with Row Level Security, Supabase Auth, Supabase Storage) |
| **Target Deployment** | **Vercel** (Frontend SPA) + **Render** (Backend Web Service) |

---

## 2. Architecture & Project Structure

The project is structured as a clean monorepo with distinct separation between client-side assets and server-side business logic:

```text
styleguru/
├── backend/                        # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── gemini.ts           # Google Gemini SDK initialization & system prompt
│   │   │   └── supabase.ts         # Supabase client factory (Admin & user context)
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT Bearer token verification middleware
│   │   │   └── upload.ts           # Multer multipart/form-data image validator
│   │   ├── routes/
│   │   │   ├── ai.ts               # AI chatbot & conversation history endpoints
│   │   │   ├── analysis.ts         # Image vision analysis endpoints
│   │   │   ├── auth.ts             # Instant sign-up & password reset endpoints
│   │   │   ├── dashboard.ts        # Wardrobe statistics & activity endpoints
│   │   │   ├── outfits.ts          # Outfit generation & favoriting endpoints
│   │   │   ├── profile.ts          # User profile & avatar upload endpoints
│   │   │   └── wardrobe.ts         # Digital wardrobe CRUD endpoints
│   │   ├── schemas/
│   │   │   └── index.ts            # Zod validation schemas for all requests/responses
│   │   └── index.ts                # Express server entry point, CORS & rate limiters
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_initial_schema.sql  # Complete production PostgreSQL migration
│   ├── .env.example                # Backend environment variables template
│   ├── package.json                # Backend dependencies and build scripts
│   └── tsconfig.json               # Backend TypeScript compiler configuration
│
├── frontend/                       # React 18 + Vite Single Page Application
│   ├── public/                     # Static icons and web assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # AppLayout, Navbar, and responsive Sidebar
│   │   │   └── ui/                 # Alert, LoadingSpinner, and Modal dialogs
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Supabase Auth state provider
│   │   ├── pages/
│   │   │   ├── Accessibility.tsx   # Accessibility & sensory preference settings
│   │   │   ├── AddClothing.tsx     # Add wardrobe item with image upload
│   │   │   ├── AIStylist.tsx       # AI fashion chat with voice input support
│   │   │   ├── Dashboard.tsx       # Main dashboard & wardrobe breakdown
│   │   │   ├── Favorites.tsx       # Saved favorite outfit combinations
│   │   │   ├── ForgotPassword.tsx  # Direct password recovery page
│   │   │   ├── Home.tsx            # Landing page showcasing features
│   │   │   ├── Login.tsx           # Standard user authentication page
│   │   │   ├── Onboarding.tsx      # Initial style survey wizard
│   │   │   ├── OutfitAnalyzer.tsx  # Upload & analyze outfit photos with AI
│   │   │   ├── OutfitGenerator.tsx # Generate occasion-based outfits with AI
│   │   │   ├── Profile.tsx         # User profile and avatar management
│   │   │   ├── Register.tsx        # Standard user account creation
│   │   │   ├── Settings.tsx        # Security & account deletion settings
│   │   │   └── Wardrobe.tsx        # Searchable, filterable digital wardrobe
│   │   ├── services/
│   │   │   ├── api.ts              # Fetch client communicating with Backend API
│   │   │   └── supabase.ts         # Supabase browser SDK instance
│   │   ├── types/
│   │   │   ├── index.ts            # Core TypeScript interfaces (Profile, Item, Outfit)
│   │   │   └── speech.d.ts         # Web Speech Recognition API typings
│   │   ├── App.tsx                 # React Router v6 route definitions
│   │   ├── index.css               # Tailwind CSS directives & custom utility classes
│   │   └── main.tsx                # Frontend application entry point
│   ├── .env.example                # Frontend environment variables template
│   ├── index.html                  # HTML5 document template
│   ├── package.json                # Frontend dependencies and Vite build scripts
│   ├── tailwind.config.js          # Tailwind styling & fashion theme extensions
│   ├── tsconfig.json               # Frontend TypeScript configuration
│   ├── vercel.json                 # Vercel SPA client-side rewrite rules
│   └── vite.config.ts              # Vite bundler configuration & local API proxy
│
├── vercel.json                     # Root-level Vercel configuration
├── .gitignore                      # Git exclusion rules (.env, node_modules, dist)
└── README.md                       # Comprehensive deployment documentation
```

### Application Entry Points
- **Frontend Entry Point**: `frontend/src/main.tsx` mounts the React application into `#root` in `frontend/index.html`.
- **Backend Entry Point**: `backend/src/index.ts` sets up security middleware, registers routes under `/api/v1`, and starts the Express HTTP server.
- **Production Compiled Entry**: `backend/dist/index.js` (generated by `npm run build` in `backend`).

---

## 3. Prerequisites

Before setting up or deploying the application, ensure you have:

1. **Node.js**: `v18.0.0` or higher (Node 20+ LTS recommended). Verify with:
   ```bash
   node -v
   ```
2. **npm**: `v9.0.0` or higher. Verify with:
   ```bash
   npm -v
   ```
3. **Git**: Installed and configured on your machine.
4. **Third-Party Accounts**:
   - [GitHub](https://github.com) account (for code hosting and automated deployments).
   - [Supabase](https://supabase.com) account (free tier PostgreSQL database and authentication).
   - [Google AI Studio](https://aistudio.google.com) account (to generate a free Gemini API key).
   - [Render](https://render.com) account (to host the backend Express web service).
   - [Vercel](https://vercel.com) account (to host the frontend React web application).

---

## 4. Local Development Setup

Follow these steps to run the complete stack on your local machine:

### Step 1: Clone the Repository
```bash
git clone https://github.com/ksgoldenbutterfly-eng/Styleguru-app.git
cd Styleguru-app
```

### Step 2: Install Dependencies

#### Install Backend Dependencies
```bash
cd backend
npm install
```

#### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 3: Configure Local Environment Variables

1. In the `backend/` directory, create `.env`:
   ```bash
   cp .env.example .env
   ```
2. In the `frontend/` directory, create `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in the values as detailed in [Section 5: Environment Variables Reference](#5-environment-variables-reference).

### Step 4: Run the Application Locally

#### Terminal 1 — Start the Backend Server:
```bash
cd backend
npm run dev
```
*The backend API server will start on [http://localhost:5000](http://localhost:5000).*

#### Terminal 2 — Start the Frontend Development Server:
```bash
cd frontend
npm run dev
```
*The Vite frontend application will start on [http://localhost:5173](http://localhost:5173).*

### Step 5: Verify Local Operation
- Open your browser to `http://localhost:5173`.
- Test backend health: Open `http://localhost:5000/api/v1/health` in your browser. You should receive `{"status":"ok","service":"StyleGuru API"}`.

---

## 5. Environment Variables Reference

Security Notice: **Never commit `.env` files to Git.** Both `backend/.env` and `frontend/.env` are strictly excluded in `.gitignore`. Only commit `.env.example` templates.

### Backend Environment Variables (`backend/.env`)

These variables must be configured in `backend/.env` for local development and in the **Render Dashboard** for production:

| Variable Name | Required | Default / Example | Purpose / Source |
|---|:---:|---|---|
| `PORT` | No | `5000` | Port on which the Express server listens. Render sets this automatically (usually `10000`). |
| `NODE_ENV` | Yes | `development` or `production` | Node environment flag (`production` enables optimizations). |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Allowed origin for CORS headers. **In production, this MUST match your live Vercel domain** (e.g., `https://your-app.vercel.app`). |
| `SUPABASE_URL` | Yes | `https://xyzcompany.supabase.co` | Supabase Project URL found under **Project Settings → API** in Supabase. |
| `SUPABASE_ANON_KEY` | Yes | `eyJhbGciOi...` | Supabase anonymous public key under **Project Settings → API**. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJhbGciOi...` | Supabase service role secret key under **Project Settings → API**. **Keep secret; never expose on frontend.** |
| `GEMINI_API_KEY` | Yes | `AIzaSy...` or `AQ.Ab...` | Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com). |
| `GEMINI_MODEL` | No | `gemini-flash-latest` | Gemini model identifier used for content and image analysis. |

#### Backend `.env.example`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
```

---

### Frontend Environment Variables (`frontend/.env`)

These variables must be configured in `frontend/.env` for local development and in the **Vercel Dashboard** for production:

| Variable Name | Required | Default / Example | Purpose / Source |
|---|:---:|---|---|
| `VITE_SUPABASE_URL` | Yes | `https://xyzcompany.supabase.co` | Supabase Project URL. Must match backend `SUPABASE_URL`. |
| `VITE_SUPABASE_ANON_KEY` | Yes | `eyJhbGciOi...` | Supabase anonymous public key. |
| `VITE_API_BASE_URL` | Yes | `http://localhost:5000/api/v1` | Base URL of the backend API. **In production, set to your Render URL** (e.g., `https://styleguru-backend.onrender.com/api/v1`). |

#### Frontend `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 6. Database & Storage Setup (Supabase)

StyleGuru relies on Supabase for relational data storage, user authentication, and photo storage.

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Set a name (e.g., `styleguru`), create a database password, and select your preferred region.
3. Wait approximately 2 minutes for database provisioning.

### Step 2: Execute Database Migrations
1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New Query**.
3. Open the file [`backend/supabase/migrations/001_initial_schema.sql`](file:///c:/Users/keerthisree/OneDrive/Desktop/project/styleguru/backend/supabase/migrations/001_initial_schema.sql) in this repository.
4. Copy the entire contents of the file, paste into the Supabase SQL Editor, and click **Run**.

#### What this migration configures:
- **`profiles` table**: User information, fashion styles, preferred categories, budget, and accessibility settings.
- **`wardrobe_items` table**: Individual garments, categories, colors, brands, occasions, and photo references.
- **`outfits` table**: Generated outfit combinations, recommendation items, notes, and favorite flags.
- **`outfit_analyses` table**: Historical image analysis results, style ratings, and recommendations.
- **`chat_conversations` & `chat_messages` tables**: AI Stylist conversations and message transcripts.
- **Automatic Triggers**: Auto-updates `updated_at` timestamps on row modifications.
- **Row Level Security (RLS)**: Enforces strict data isolation using `auth.uid() = user_id`. No user can read, modify, or delete another user's records.
- **Storage Bucket (`wardrobe-images`)**: 5MB upload limit for JPEG, PNG, WebP, and GIF images with user folder policies.

### Step 3: Configure Authentication Settings
1. Navigate to **Authentication → Providers → Email** in Supabase.
2. Ensure **Email provider** is enabled.
3. Under **Authentication → URL Configuration**:
   - Set **Site URL** to your local frontend (`http://localhost:5173`) or your production Vercel URL (`https://your-styleguru.vercel.app`).
   - Add `http://localhost:5173/**` and `https://your-styleguru.vercel.app/**` to **Redirect URLs**.

### Step 4: Retrieve API Credentials
1. Navigate to **Project Settings → API**.
2. Copy the **Project URL**, the **`anon` `public` key**, and the **`service_role` `secret` key**.
3. Use these to configure your `.env` files and deployment dashboards.

---

## 7. Backend Deployment Guide — Render

The backend is a Node.js + Express TypeScript server compiled to JavaScript for production.

### Step 1: Create a New Web Service on Render
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right corner and select **Web Service**.
3. Connect your GitHub account and select your repository: `ksgoldenbutterfly-eng/Styleguru-app`.

### Step 2: Configure Service Details
Fill in the deployment settings **exactly** as follows:

| Setting | Value to Enter | Explanation |
|---|---|---|
| **Name** | `styleguru-backend` | The identifier for your service on Render. |
| **Region** | Choose closest to your users | E.g., `Singapore`, `Frankfurt`, or `Ohio`. |
| **Branch** | `main` | Production Git branch. |
| **Root Directory** | `backend` | **CRITICAL**: Points Render to the `backend/` folder. |
| **Runtime** | `Node` | Runtime environment. |
| **Build Command** | `npm install && npm run build` | Installs dependencies and runs `tsc` to produce `dist/`. |
| **Start Command** | `npm start` | Executes `node dist/index.js`. |
| **Instance Type** | `Free` (or higher) | The free instance tier is sufficient. |

### Step 3: Configure Environment Variables on Render
Click on the **Environment** tab (or expand **Advanced → Add Environment Variable**) and add the following keys:

```text
PORT = 10000
NODE_ENV = production
FRONTEND_URL = https://your-styleguru-app.vercel.app
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
GEMINI_API_KEY = your_gemini_api_key
GEMINI_MODEL = gemini-flash-latest
```

> **Important Note regarding `FRONTEND_URL`**: If you do not yet know your Vercel URL, set `FRONTEND_URL` temporarily to `*` or `http://localhost:5173`. Once you deploy Vercel in Section 8, return here, update `FRONTEND_URL` with your exact Vercel URL (e.g. `https://styleguru.vercel.app`), and click **Save Changes**.

### Step 4: Deploy and Verify
1. Click **Create Web Service**.
2. Monitor the deployment logs. When deployment completes, you will see:
   ```text
   ==> Uploading build...
   ==> Build successful 🎉
   ==> Deploying...
   StyleGuru API running on port 10000
   ==> Your service is live 🎉
   ```
3. Copy your live Render service URL (e.g., `https://styleguru-backend.onrender.com`).
4. **Health Check Verification**: Open `https://styleguru-backend.onrender.com/api/v1/health` in your browser. Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-10-31T12:00:00.000Z",
     "service": "StyleGuru API"
   }
   ```

---

## 8. Frontend Deployment Guide — Vercel

The frontend is a React 18 Single Page Application built with Vite and Tailwind CSS.

### Step 1: Import Project to Vercel
1. Log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New... → Project**.
3. Select your GitHub repository: `ksgoldenbutterfly-eng/Styleguru-app`.

### Step 2: Configure Project Settings
In the **Configure Project** screen:

1. **Framework Preset**: Select **Vite** (Vercel typically detects this automatically).
2. **Root Directory**: Click **Edit** next to Root Directory, select **`frontend`**, and click **Continue**.
3. **Build and Output Settings**:
   - **Build Command**: `npm run build` (or leave default toggle on).
   - **Output Directory**: `dist` (default).
   - **Install Command**: `npm install` (default).

### Step 3: Configure Environment Variables
Expand the **Environment Variables** section on Vercel and add:

```text
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_API_BASE_URL = https://styleguru-backend.onrender.com/api/v1
```

> ⚠️ **Notice**: Ensure `VITE_API_BASE_URL` ends with `/api/v1` and uses `https://` (no trailing slash after `v1`). Replace `styleguru-backend.onrender.com` with your actual Render service URL from Section 7.

### Step 4: Deploy
1. Click **Deploy**.
2. Vercel will clone the `frontend` directory, install packages, execute Vite build, and deploy to their global Edge network.
3. Once completed, click **Go to Dashboard** or visit your live domain (e.g., `https://styleguru-frontend.vercel.app`).

### Step 5: Final Cross-Link (Close the CORS Loop)
1. Copy your live Vercel production URL (e.g. `https://styleguru-frontend.vercel.app`).
2. Go back to your [Render Dashboard](https://dashboard.render.com) → `styleguru-backend` → **Environment**.
3. Update `FRONTEND_URL` to match your Vercel URL exactly:
   ```text
   FRONTEND_URL = https://styleguru-frontend.vercel.app
   ```
4. Click **Save Changes**. Render will automatically redeploy the backend with the updated CORS policy.

---

## 9. Complete REST API Reference

All protected routes require a Bearer token in the HTTP Authorization header:
```http
Authorization: Bearer <supabase_access_token>
```

### 1. Health & Diagnostics

#### `GET /api/v1/health`
- **Access**: Public
- **Description**: Verifies API availability.
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-31T12:00:00.000Z",
    "service": "StyleGuru API"
  }
  ```

---

### 2. Authentication Helpers

#### `POST /api/v1/auth/signup`
- **Access**: Public
- **Description**: Registers a user with pre-confirmed email (bypassing Supabase SMTP limits) and auto-updates credentials on re-registration.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "full_name": "Keerthi Sree"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Account ready",
    "user": {
      "id": "e67414bc-51bf-4b95-a74e-76509f6e3c0b",
      "email": "user@example.com"
    }
  }
  ```

#### `POST /api/v1/auth/reset-password`
- **Access**: Public
- **Description**: Updates user password directly for recovery.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "new_password": "NewSecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Password reset successfully"
  }
  ```

---

### 3. User Profile

#### `GET /api/v1/profile`
- **Access**: Protected
- **Description**: Retrieves current user's profile and preferences.
- **Response `200 OK`**:
  ```json
  {
    "profile": {
      "id": "e67414bc-51bf-4b95-a74e-76509f6e3c0b",
      "full_name": "Keerthi Sree",
      "age": 24,
      "preferred_style": "Indo-Western",
      "favorite_colors": ["Navy Blue", "White", "Maroon"],
      "budget_preference": "Mid-range (₹2000–₹5000)",
      "onboarding_completed": true,
      "accessibility_preferences": {
        "comfort_level": "Regular fit",
        "sensory_preferences": ["Prefer soft fabrics (cotton, bamboo)"]
      }
    }
  }
  ```

#### `PUT /api/v1/profile`
- **Access**: Protected
- **Description**: Updates user personal style and preferences.
- **Request Body**:
  ```json
  {
    "full_name": "Keerthi Sree",
    "age": 25,
    "preferred_style": "Western Wear",
    "favorite_colors": ["Black", "Gold"]
  }
  ```

#### `POST /api/v1/profile/avatar`
- **Access**: Protected
- **Content-Type**: `multipart/form-data`
- **Field**: `avatar` (Image file: JPEG/PNG/WebP, max 5MB)
- **Response `200 OK`**:
  ```json
  {
    "avatar_url": "https://xyz.supabase.co/storage/v1/object/public/wardrobe-images/avatars/userid.png"
  }
  ```

---

### 4. Wardrobe Management

#### `GET /api/v1/wardrobe`
- **Access**: Protected
- **Query Parameters**:
  - `category` (optional): `tops`, `shirts`, `trousers`, `dresses`, `sarees`, `kurtas`, `footwear`, etc.
  - `occasion` (optional): `college`, `office`, `parties`, `weddings`, `casual`, `interviews`
  - `search` (optional): Case-insensitive name search query
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "758f12a2-3f19-487a-9a91-4cf1f3cb8761",
        "name": "Classic Linen Shirt",
        "category": "shirts",
        "color": "White",
        "brand": "Zara",
        "occasion": ["office", "casual"],
        "fashion_type": "western",
        "image_url": "https://xyz.supabase.co/storage/v1/object/public/wardrobe-images/wardrobe/id.jpg"
      }
    ],
    "total": 1
  }
  ```

#### `POST /api/v1/wardrobe`
- **Access**: Protected
- **Content-Type**: `multipart/form-data`
- **Fields**: `name`, `category`, `color`, `brand` (optional), `occasion` (JSON array or string), `fashion_type` (optional), `description` (optional), `image` (file, optional).
- **Response `201 Created`**:
  ```json
  {
    "item": {
      "id": "758f12a2-3f19-487a-9a91-4cf1f3cb8761",
      "name": "Floral Embroidered Kurta",
      "category": "kurtas",
      "color": "Pastel Pink",
      "occasion": ["festivals", "casual"]
    }
  }
  ```

#### `PUT /api/v1/wardrobe/:id`
- **Access**: Protected
- **Content-Type**: `multipart/form-data`
- **Description**: Updates an existing wardrobe item by UUID.

#### `DELETE /api/v1/wardrobe/:id`
- **Access**: Protected
- **Response `200 OK`**:
  ```json
  {
    "message": "Item deleted successfully"
  }
  ```

---

### 5. AI Outfit Generation & Favorites

#### `POST /api/v1/outfits/generate`
- **Access**: Protected
- **Description**: Generates 3 cohesive looks using Google Gemini based on preferences and digital wardrobe.
- **Request Body**:
  ```json
  {
    "occasion": "college",
    "preferred_style": "Casual",
    "color_preference": "Blue and White",
    "weather": "Summer",
    "use_wardrobe_only": false,
    "accessibility_notes": "Breathable cottons only"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "outfits": [
      {
        "title": "Summer Casual College Look",
        "description": "A crisp white button-down paired with relaxed denim and classic sneakers.",
        "items": ["White Cotton Shirt", "Light Wash Denim", "White Canvas Sneakers"],
        "colors": ["White", "Light Blue"],
        "occasion": "college",
        "reason": "Lightweight, breathable outfit suited for warm campus walks.",
        "accessibility_notes": "Comfortable waistband with breathable weave."
      }
    ],
    "outfit_id": "4b6389f4-3450-4ba1-b844-3c66f7d081eb"
  }
  ```

#### `GET /api/v1/outfits`
- **Access**: Protected
- **Description**: Lists all outfit generation history for the logged-in user.

#### `POST /api/v1/outfits/favorite/:id`
- **Access**: Protected
- **Description**: Bookmarks an outfit to the user's favorites list.

#### `DELETE /api/v1/outfits/favorite/:id`
- **Access**: Protected
- **Description**: Removes an outfit from the favorites list.

#### `GET /api/v1/outfits/favorites/list`
- **Access**: Protected
- **Description**: Retrieves all bookmarked favorite outfits.

---

### 6. Outfit Image Vision Analysis

#### `POST /api/v1/analysis/outfit`
- **Access**: Protected
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image`: Garment or outfit photograph (JPEG/PNG/WebP, max 5MB)
  - `notes` (optional): User contextual notes (e.g., "For evening dinner")
- **Response `200 OK`**:
  ```json
  {
    "analysis": {
      "overall_feedback": "A sophisticated smart-casual look with great silhouette balance.",
      "color_combination": "Subtle complementary harmony between navy and khaki tones.",
      "style": "Contemporary Smart Casual",
      "occasion": "Office, Business Lunch, or Evening Social",
      "suggestions": [
        "Add a textured leather belt to ground the transition between top and trousers.",
        "Roll up the cuffs slightly for a more relaxed aesthetic."
      ],
      "rating": 8
    },
    "analysis_id": "902d244f-b648-4775-be81-9b04fc9a9572",
    "image_url": "https://..."
  }
  ```

#### `GET /api/v1/analysis/history`
- **Access**: Protected
- **Description**: Returns all historical image evaluations for the logged-in user.

---

### 7. AI Stylist Chatbot

#### `POST /api/v1/ai/chat`
- **Access**: Protected
- **Description**: Sends a message to StyleGuru AI stylist with conversation memory and profile context.
- **Request Body**:
  ```json
  {
    "message": "What color jewelry pairs best with an emerald green saree?",
    "conversation_id": "optional-uuid"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "reply": "Emerald green pairs beautifully with antique gold, kundan, or warm brass jewelry! If you prefer a modern contemporary look, contrasting ruby-toned accents or subtle pearl chokers create a stunning balance.",
    "conversation_id": "72ba0451-c0a1-432d-9477-d6b0bfbb425c"
  }
  ```

#### `GET /api/v1/ai/conversations`
- **Access**: Protected
- **Description**: Lists active conversation threads for the user.

#### `GET /api/v1/ai/conversations/:id/messages`
- **Access**: Protected
- **Description**: Retrieves message history for a specific conversation ID.

---

### 8. Dashboard Analytics

#### `GET /api/v1/dashboard/stats`
- **Access**: Protected
- **Description**: Summarizes wardrobe metrics, item counts by category, and weekly activity.
- **Response `200 OK`**:
  ```json
  {
    "stats": {
      "total_wardrobe_items": 14,
      "total_outfits_generated": 6,
      "total_analyses": 3,
      "total_favorites": 4,
      "recent_outfits_this_week": 4,
      "category_breakdown": {
        "tops": 4,
        "shirts": 3,
        "jeans": 3,
        "dresses": 2,
        "footwear": 2
      }
    }
  }
  ```

---

## 10. Troubleshooting & Common Issues

### 1. Render Backend Deployment Failures
- **Problem**: Build fails with `tsc: command not found` or module resolution errors.
  - **Fix**: Verify your **Root Directory** on Render is set to `backend`. Verify the **Build Command** is `npm install && npm run build`.
- **Problem**: Service fails to bind port or times out on startup.
  - **Fix**: Render provides a dynamic port in `process.env.PORT`. Ensure `backend/src/index.ts` uses `const PORT = process.env.PORT || 5000;`. In your Render environment variables, set `PORT = 10000`.
- **Problem**: Free tier spin-down delay (Cold Starts).
  - **Explanation**: Render's free tier spins down idle instances after 15 minutes of inactivity. The first request may take 30–50 seconds to wake up. This is standard behavior on free plans.

### 2. Vercel Frontend Build & Route 404s
- **Problem**: Visiting `/dashboard` or `/wardrobe` directly causes a `404: NOT_FOUND` on Vercel.
  - **Fix**: The repository includes `frontend/vercel.json` and root `vercel.json` with rewrite rules:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```
    Ensure this file exists in `frontend/vercel.json` so client-side routing serves `index.html`.
- **Problem**: Build fails on Vercel with TypeScript errors.
  - **Fix**: Verify that `frontend/tsconfig.json` has `"types": ["vite/client"]`. Test locally with `cd frontend && npm run build` before pushing.

### 3. Cross-Origin Resource Sharing (CORS) Errors
- **Problem**: Browser console reports: `Access to fetch at ... has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`.
  - **Fix 1**: Ensure `FRONTEND_URL` in your Render Environment Variables matches your Vercel domain **exactly** (e.g., `https://styleguru.vercel.app`), with `https://` and **without** a trailing slash.
  - **Fix 2**: After updating `FRONTEND_URL` on Render, click **Manual Deploy → Clear build cache & deploy** to ensure the new environment variable is active.

### 4. API Connection & Mixed Content Errors
- **Problem**: Browser reports `Blocked loading mixed active content` or network request fails.
  - **Fix**: Your Vercel frontend is served over `https://`. Ensure `VITE_API_BASE_URL` on Vercel uses `https://` (e.g., `https://styleguru-backend.onrender.com/api/v1`), not `http://`.
  - **Fix**: Ensure the path includes `/api/v1`.

### 5. Supabase Database & Permission Errors
- **Problem**: API returns error `PGRST205: Could not find the table 'public.profiles' in the schema cache`.
  - **Fix**: Run the complete database migration file `backend/supabase/migrations/001_initial_schema.sql` inside the **Supabase Dashboard → SQL Editor**. StyleGuru includes graceful in-memory fallbacks, but database persistence requires running this migration.
- **Problem**: `new row violates row-level security policy`.
  - **Fix**: The backend must pass the user's Supabase JWT access token in the `Authorization: Bearer <token>` header to authenticate via RLS.

### 6. Google Gemini AI API Errors
- **Problem**: API returns `404 Not Found` for model requests.
  - **Fix**: In `backend/.env` (and Render Environment), verify `GEMINI_MODEL=gemini-flash-latest`. Google has transitioned to Gemini Flash latest endpoints.
- **Problem**: API returns `403 Forbidden: API key not valid`.
  - **Fix**: Ensure your `GEMINI_API_KEY` was generated from [Google AI Studio](https://aistudio.google.com) and is copied without extra spaces or quotes.

---

## 11. Final Production Deployment Checklist

Use this checklist to ensure your live deployment is healthy and fully operational:

- [ ] **Database & Migrations**
  - [ ] Supabase project created.
  - [ ] `001_initial_schema.sql` successfully executed in Supabase SQL Editor.
  - [ ] Storage bucket `wardrobe-images` is created and public read access is enabled.
  - [ ] Email provider enabled in Supabase Authentication settings.

- [ ] **Backend on Render**
  - [ ] Web Service created with Root Directory = `backend`.
  - [ ] Build command: `npm install && npm run build`.
  - [ ] Start command: `npm start`.
  - [ ] All 8 environment variables added (`PORT`, `NODE_ENV`, `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`).
  - [ ] Health check verified at `https://your-backend.onrender.com/api/v1/health`.

- [ ] **Frontend on Vercel**
  - [ ] Project created with Root Directory = `frontend`.
  - [ ] Framework preset set to **Vite**.
  - [ ] Build command: `npm run build`. Output directory: `dist`.
  - [ ] Environment variables configured (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`).
  - [ ] `VITE_API_BASE_URL` points to live Render URL ending with `/api/v1`.
  - [ ] Client-side route refreshes tested (e.g. refresh `/dashboard` without 404).

- [ ] **Cross-Service Communication & CORS**
  - [ ] Render `FRONTEND_URL` updated with exact Vercel production domain.
  - [ ] Test registration flow: create account at `/register` and verify direct redirection to `/dashboard`.
  - [ ] Test wardrobe item creation with photo upload at `/wardrobe/add`.
  - [ ] Test AI outfit generation at `/outfit-generator`.
  - [ ] Test visual outfit analysis at `/outfit-analyzer`.
  - [ ] Test AI Stylist chat conversation at `/ai-stylist`.

---

## 📄 License & Attribution

This project is licensed under the **MIT License**.

Designed and engineered with ❤️ for inclusive, accessible, and delightful fashion technology.
