const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export function getProxyUrl(streamUrl: string): string {
  if (!SUPABASE_URL) {
    console.warn('SUPABASE_URL not configured, using direct stream');
    return streamUrl;
  }
  
  const proxyEndpoint = `${SUPABASE_URL}/functions/v1/stream-proxy`;
  return `${proxyEndpoint}?url=${encodeURIComponent(streamUrl)}`;
}

export function isHttpStream(url: string): boolean {
  return url.startsWith('http://');
}

export function shouldUseProxy(url: string): boolean {
  // Always use proxy for HTTP streams on HTTPS sites
  if (window.location.protocol === 'https:' && isHttpStream(url)) {
    return true;
  }
  return false;
}

export async function testProxyConnection(): Promise<boolean> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  
  if (!SUPABASE_URL) {
    return false;
  }
  
  try {
    const testUrl = 'https://example.com';
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stream-proxy?url=${encodeURIComponent(testUrl)}`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}
