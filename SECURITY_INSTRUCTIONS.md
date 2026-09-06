# AI Studio Custom Security Instructions & Development Constitution

This document defines the mandatory security rules, architectural constraints, and threat mitigation guidelines for developing and operating **MindLoom AI (Personal Gemini Journal)**. It acts as the application's development constitution, fulfilling the Google Cloud Ideathon Challenge Phase 1 requirements.

---

## 1. Core Threat Model & Security Principles

### Principle of Least Privilege
* All system components operate with the minimum set of permissions required for their specific function.
* The frontend client is treated as an **untrusted entity**. All business logic, authorization, and AI interactions must be validated server-side.

### Zero-Trust Client Authentication
* Client claims of identity (`userId`, `email`, `role`) are NEVER accepted from query parameters, request bodies, or headers.
* User identity MUST be derived exclusively from cryptographically signed **Firebase ID Tokens** passed via the `Authorization: Bearer <ID_TOKEN>` header.
* The backend MUST verify the token signature and expiration on EVERY API request using the Firebase Admin SDK (`admin.auth().verifyIdToken()`).

---

## 2. API Credentials & Secret Management

### Zero Client Secret Exposure
* Gemini API keys (`GEMINI_API_KEY`), Firebase service account credentials, and database keys MUST NEVER be exposed in client bundles or browser environment variables (`VITE_`, `REACT_APP_`).
* Direct client-side calls to the Gemini API are strictly forbidden. All Gemini interactions must route through the secure Cloud Run backend.

### Google Cloud Secret Manager Integration
* In production (Cloud Run), the backend retrieves runtime credentials dynamically using **Google Cloud Secret Manager** (`@google-cloud/secret-manager`).
* Secrets must never be stored in plain text on disk, in source control, or in environment variables within Docker container builds.
* For local development, fallback configuration MUST read from ignored `.env` files that are included in `.gitignore`.

---

## 3. Firestore Per-User Isolation & Authorization

### Schema Hierarchy
Data must be organized under per-user subcollections to enforce rigid ownership boundaries:
```
users/{userId}/
  ├── profile
  ├── sessions/{sessionId}
  └── analytics/insights
```

### Server-Side & Database Enforcement
1. **Firestore Security Rules**: Rules MUST enforce strict per-user ownership:
   ```cel
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
2. **Backend Query Isolation**: Server-side Firestore queries MUST explicitly scope document paths with `users/${authenticatedUid}/...`. cross-user queries (e.g., querying collectionGroup without UID filters) are strictly prohibited.

---

## 4. Input Validation & Prompt Injection Defense

### User Input Sanitization
* All user prompt inputs are validated for maximum character length (max 8,000 characters per message) to prevent payload abuse.
* User input must be treated as **untrusted data** when injected into Gemini prompt templates. Use delimiter encapsulation (e.g., `--- BEGIN USER JOURNAL MESSAGE ---`) to prevent prompt hijacking.

### Controlled Response Parsing
* Automatic summarization and Thought Evolution queries MUST enforce structured JSON responses (using Gemini's `responseSchema` or strictly validated JSON parsers).
* Responses must be checked for payload integrity before returning to the frontend or persisting in Firestore.

---

## 5. Error Handling & Privacy Compliance

### Error Sanitization
* Exception handlers MUST NOT leak internal file paths, stack traces, database keys, or GCP infrastructure details to the client.
* Production API errors return generic HTTP status codes and sanitized error messages (`{ "error": "Unauthorized", "code": 401 }`).
* Detailed technical diagnostics are logged exclusively to server-side standard output for Cloud Logging.

### Data Privacy & Auditability
* Never log raw user journal text or AI outputs to application logs.
* Operational logs should only record metadata: `timestamp`, `authenticatedUid`, `sessionId`, `tokenCount`, and HTTP status.
* User logout MUST clear local state and client token caches immediately.

---

## 6. Secure Deployment Rules

* Cloud Run containers MUST run as non-root users.
* Containers must expose only necessary port (port 8080).
* CORS policy MUST restrict origin explicitly to the approved production application domain and trusted local ports during dev.
