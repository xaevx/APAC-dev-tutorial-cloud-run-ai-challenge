import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretClient = new SecretManagerServiceClient();

/**
 * Fetch a secret from Google Cloud Secret Manager.
 * @param {string} secretName - Name of the secret (e.g. 'GEMINI_API_KEY')
 * @param {string} projectId - GCP Project ID
 * @returns {Promise<string|null>}
 */
export async function getSecret(secretName, projectId) {
  if (!projectId) {
    console.warn(`[SecretManager] No GCP_PROJECT_ID provided, skipping Secret Manager lookup for ${secretName}`);
    return null;
  }

  try {
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await secretClient.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString('utf8');
    if (payload) {
      console.log(`[SecretManager] Successfully loaded secret: ${secretName}`);
      return payload.trim();
    }
  } catch (error) {
    console.warn(`[SecretManager] Failed to load secret ${secretName} from Secret Manager: ${error.message}`);
  }

  return null;
}
