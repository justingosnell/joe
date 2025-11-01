export function getApiBaseUrl(): string {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl;
  }
  
  if (import.meta.env.PROD) {
    return '';
  }
  
  return 'http://localhost:5173';
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  if (baseUrl === '') {
    return endpoint;
  }
  return `${baseUrl}${endpoint}`;
}
