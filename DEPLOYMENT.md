# MindLoom AI - Production Cloud Run & GCP Deployment Guide

This guide details the exact steps required to deploy **MindLoom AI** to **Google Cloud Run**, configure **Google Cloud Secret Manager**, and apply **Cloud Firestore Security Rules**.

---

## Prerequisites

1. [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install) installed and authenticated.
2. A Google Cloud Project with Billing enabled.
3. Firebase Project linked to your Google Cloud Project.

---

## 1. Enable Required GCP APIs

Run the following gcloud command to activate required Google Cloud APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com \
  generativelanguage.googleapis.com
```

---

## 2. Store Secrets in Google Cloud Secret Manager

Store your Gemini API key in Secret Manager so it is never exposed in container builds or source code:

```bash
# Create secret for Gemini API Key
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# Add secret version
echo -n "YOUR_ACTUAL_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

---

## 3. Deploy Cloud Firestore Security Rules

Deploy the zero-trust per-user isolation security rules using the Firebase CLI:

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login and deploy firestore rules
firebase login
firebase deploy --only firestore:rules
```

---

## 4. Build & Deploy Backend Container to Cloud Run

Deploy directly from source using Cloud Build and Cloud Run:

```bash
# Set your GCP Project ID
export GCP_PROJECT_ID="your-gcp-project-id"

# Deploy container directly to Cloud Run
gcloud run deploy mindloom-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,USE_SECRET_MANAGER=true,GCP_PROJECT_ID=${GCP_PROJECT_ID} \
  --service-account mindloom-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com
```

### Grant Secret Manager Access to Cloud Run Service Account

Ensure the Cloud Run service account has permission to read the Gemini secret:

```bash
# Grant Secret Accessor role to Service Account
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${GCP_PROJECT_ID}@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 5. Verification & Health Check

Verify your live deployment by invoking the health check endpoint:

```bash
curl https://mindloom-backend-XXXXX-uc.a.run.app/api/health
```

Expected Output:
```json
{
  "status": "HEALTHY",
  "service": "MindLoom AI Backend",
  "environment": "production",
  "security": {
    "secretManagerEnabled": true,
    "geminiKeyConfigured": true,
    "authEnforcement": "STRICT_FIREBASE_ID_TOKEN"
  }
}
```
