# MindLoom AI - Personal Gemini Journal
> **Google Cloud Ideathon Challenge Submission**

MindLoom AI is a production-grade, secure, authenticated AI journaling and personal-thinking application built on **Google Cloud**, **Gemini 1.5**, **Firebase Authentication**, **Cloud Firestore**, and **Google Cloud Secret Manager**, containerized for deployment on **Cloud Run**.

---

## Key Highlights & Architecture

```
User Browser (Vite + React)
       │
       │ 1. HTTPS + Firebase Bearer Token (Authorization: Bearer <ID_TOKEN>)
       ▼
Google Cloud Run (Node.js Express Backend)
       ├── Secret Manager Client (Fetches GEMINI_API_KEY securely on boot)
       ├── Firebase Admin SDK (Cryptographically verifies Firebase ID Tokens)
       ├── Gemini 1.5 SDK (Multi-turn chat, auto-summarization & thought evolution)
       └── Cloud Firestore DB (Per-user document path: users/{userId}/sessions/*)
```

---

## 1. Implemented Core Features

1. **Firebase Authentication**:
   - Email/Password sign-in & registration.
   - Google OAuth Sign-in integration.
   - Instant Demo Mode for rapid evaluation (User A vs User B).
   - Authenticated application state and protected views.
   - Clean session logout invalidation.

2. **Gemini 1.5 Multi-Turn Reflection**:
   - Real-time conversational context preservation across turns.
   - Guided thought starters ("Career Crossroads", "Daily Goal Focus", "Unpack Deep Doubt").
   - Responsive Markdown rendering for structured insights.
   - Full error handling, timeout failover, and rate limiting.

3. **Automatic Session Summarization**:
   - Automatically generates structured JSON summaries upon session completion.
   - Extracts Main Topic, Key Insights, Action Items, Stated Goals, Unresolved Questions, Emotion/Tone, and Tags.

4. **Strict Per-User Firestore Data Isolation**:
   - Database hierarchy: `users/{userId}/sessions/{sessionId}`.
   - Evaluated by `firestore.rules` (`request.auth.uid == userId`).
   - Server-side queries strictly scoped to `users/${authenticatedUid}/...`. Zero cross-user leakage.

5. **Google Cloud Secret Manager Integration**:
   - `GEMINI_API_KEY` is fetched dynamically from Secret Manager in Cloud Run production environment.
   - Zero secrets exposed in browser bundles or client-side JavaScript.

---

## 2. ORIGINAL FEATURE: Thought Evolution & Mind Map Engine

MindLoom AI goes beyond basic session-by-session journaling by introducing the **Thought Evolution Engine**:

* **Cross-Session Theme Tracking**: Analyzes user's historical sessions over time to track how specific concepts (e.g., "Career Shift", "Health Clarity", "Tech Stack") evolve.
* **Unresolved Thought Radar**: Automatically surfaces open questions and pending decisions from past entries that haven't been revisited.
* **Semantic Journal Q&A ("Talk to your Past Self")**: Enables natural language queries over past journals (e.g. *"What were my main doubts when I started project X?"*), executing Gemini synthesis strictly over the authenticated user's isolated entries.

---

## 3. Security Constitution (Phase 1 Requirement)

The repository includes [`SECURITY_INSTRUCTIONS.md`](./SECURITY_INSTRUCTIONS.md), acting as the development constitution. It mandates:
* Zero client secret exposure.
* Cryptographic verification of Firebase ID Tokens on every backend endpoint.
* Strict Firestore per-user scoping.
* Sanitized error handling (no stack trace or DB schema leakage).

---

## 4. Testing & Verification Performed

### Automated Test Suite
* **Cross-User Security Isolation Suite** (`npm run test:security`):
  - Verified unauthenticated requests fail with `401 Unauthorized`.
  - Verified User B attempting to read User A session returns `404 Not Found`.
  - Verified User B attempting to delete User A session returns `404 Not Found`.
  - Verified User B session list shows 0 count.
* **Gemini & Evolution API Suite** (`npm run test:gemini`):
  - Verified health check, multi-turn chat, auto-summarization, and Thought Evolution analysis.

---

## 5. Quick Start & Local Execution

### Prerequisites
* Node.js v18+ installed.

### 1. Clone & Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Configure Local Environment
Copy `.env.example` to `.env` in the root or `backend/` directory and set your `GEMINI_API_KEY`:
```bash
GEMINI_API_KEY="your_actual_gemini_api_key"
```

### 3. Run Application Locally
```bash
# Terminal 1: Start Backend Server (Port 8080)
cd backend
npm start

# Terminal 2: Start Frontend Dev Server (Port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Cloud Run Deployment

Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full GCP deployment commands (`gcloud run deploy`, Secret Manager binding, and Firestore rules deployment).
