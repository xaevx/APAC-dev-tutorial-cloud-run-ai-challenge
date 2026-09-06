import dotenv from 'dotenv';
import { getSecret } from './services/secretManager.js';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  useSecretManager: process.env.USE_SECRET_MANAGER === 'true',
  gcpProjectId: process.env.GCP_PROJECT_ID || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
};

/**
 * Initialize asynchronous secret resolution on startup
 */
export async function initConfig() {
  if (config.useSecretManager && config.gcpProjectId) {
    console.log('[Config] Initializing secrets via Google Cloud Secret Manager...');
    const secretKey = await getSecret('GEMINI_API_KEY', config.gcpProjectId);
    if (secretKey) {
      config.geminiApiKey = secretKey;
    }
  }

  if (!config.geminiApiKey) {
    console.warn('[Config] WARNING: GEMINI_API_KEY is not set. Gemini API calls will fail or use mock mode if configured.');
  } else {
    console.log('[Config] GEMINI_API_KEY configuration verified.');
  }

  return config;
}
