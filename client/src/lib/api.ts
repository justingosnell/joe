import { supabase } from "./supabase";

export function getApiBaseUrl(): string {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl;
  }
  
  // Frontend and backend are on same domain (either localhost or Render)
  // Use relative URLs - no need for baseUrl
  return '';
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  if (baseUrl === '') {
    return endpoint;
  }
  return `${baseUrl}${endpoint}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(endpoint);
  const headers = new Headers(options.headers);

  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
