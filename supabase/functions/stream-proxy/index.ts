import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Expose-Headers': 'content-length, content-type, content-range, accept-ranges',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const streamUrl = url.searchParams.get('url');

  if (!streamUrl) {
    console.error('No stream URL provided');
    return new Response(JSON.stringify({ error: 'No stream URL provided' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log(`Proxying stream: ${streamUrl}`);

  try {
    // Validate URL format
    let targetUrl: URL;
    try {
      targetUrl = new URL(streamUrl);
    } catch {
      console.error('Invalid URL format:', streamUrl);
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      console.error('Invalid protocol:', targetUrl.protocol);
      return new Response(JSON.stringify({ error: 'Invalid protocol' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Forward range header for seeking support
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': targetUrl.origin + '/',
    };

    const rangeHeader = req.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    // Fetch the stream with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(streamUrl, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok && response.status !== 206) {
      console.error(`Upstream error: ${response.status} ${response.statusText}`);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch stream', 
        status: response.status 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Stream fetched successfully: ${response.status}`);

    // Determine content type
    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Fix content types for HLS/DASH
    if (streamUrl.endsWith('.m3u8') || streamUrl.includes('.m3u8')) {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (streamUrl.endsWith('.ts')) {
      contentType = 'video/mp2t';
    } else if (streamUrl.endsWith('.mpd')) {
      contentType = 'application/dash+xml';
    } else if (streamUrl.endsWith('.mp4') || streamUrl.includes('.mp4')) {
      contentType = 'video/mp4';
    }

    // For m3u8 manifests, we need to rewrite URLs to also go through proxy
    if (contentType === 'application/vnd.apple.mpegurl' || contentType.includes('mpegurl')) {
      const manifestText = await response.text();
      const rewrittenManifest = rewriteManifestUrls(manifestText, streamUrl);
      
      return new Response(rewrittenManifest, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Build response headers
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    };

    // Forward relevant headers
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange;
    }

    const acceptRanges = response.headers.get('accept-ranges');
    if (acceptRanges) {
      responseHeaders['Accept-Ranges'] = acceptRanges;
    }

    // Stream the response body
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('abort');
    
    return new Response(JSON.stringify({ 
      error: isTimeout ? 'Stream timeout' : 'Failed to proxy stream',
      details: errorMessage
    }), {
      status: isTimeout ? 504 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Rewrite URLs in HLS manifest to go through proxy
function rewriteManifestUrls(manifest: string, originalUrl: string): string {
  const baseUrl = new URL(originalUrl);
  const basePath = baseUrl.href.substring(0, baseUrl.href.lastIndexOf('/') + 1);
  
  const lines = manifest.split('\n');
  const rewrittenLines = lines.map(line => {
    const trimmed = line.trim();
    
    // Skip empty lines and comments (except URI in EXT-X tags)
    if (!trimmed || (trimmed.startsWith('#') && !trimmed.includes('URI='))) {
      // Handle URI= in EXT-X-KEY, EXT-X-MAP, etc.
      if (trimmed.includes('URI="')) {
        return rewriteUriInTag(line, basePath);
      }
      return line;
    }
    
    // Skip non-URL lines
    if (trimmed.startsWith('#')) {
      if (trimmed.includes('URI="')) {
        return rewriteUriInTag(line, basePath);
      }
      return line;
    }
    
    // This is a URL line (segment or playlist reference)
    let absoluteUrl: string;
    
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      absoluteUrl = trimmed;
    } else if (trimmed.startsWith('/')) {
      // Absolute path
      absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${trimmed}`;
    } else {
      // Relative path
      absoluteUrl = basePath + trimmed;
    }
    
    // Return proxied URL
    const proxyBase = Deno.env.get('SUPABASE_URL') || '';
    return `${proxyBase}/functions/v1/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
  });
  
  return rewrittenLines.join('\n');
}

// Rewrite URI= attributes in EXT-X tags
function rewriteUriInTag(line: string, basePath: string): string {
  return line.replace(/URI="([^"]+)"/, (match, uri) => {
    let absoluteUrl: string;
    
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      absoluteUrl = uri;
    } else if (uri.startsWith('/')) {
      const baseUrl = new URL(basePath);
      absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${uri}`;
    } else {
      absoluteUrl = basePath + uri;
    }
    
    const proxyBase = Deno.env.get('SUPABASE_URL') || '';
    return `URI="${proxyBase}/functions/v1/stream-proxy?url=${encodeURIComponent(absoluteUrl)}"`;
  });
}
