export function getApiBaseUrl(): string {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl;
  }
  
  return '';
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  if (baseUrl === '') {
    return endpoint;
  }
  return `${baseUrl}${endpoint}`;
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(endpoint);
  const headers = new Headers(options.headers);

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
