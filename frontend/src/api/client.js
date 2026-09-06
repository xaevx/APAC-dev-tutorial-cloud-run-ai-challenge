/**
 * Authenticated API Fetch Wrapper
 * Automatically attaches Authorization: Bearer <idToken>
 */
export async function apiFetch(endpoint, options = {}, idToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(endpoint, config);
    
    // Parse JSON
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.code = data.code || 'HTTP_ERROR';
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Client Error] ${endpoint}:`, error.message);
    throw error;
  }
}
