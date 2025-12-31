const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

interface StreamCheckResult {
  isWorking: boolean;
  isHttpBlocked: boolean;
  needsProxy: boolean;
}

export async function checkStream(url: string): Promise<StreamCheckResult> {
  // Check if it's an HTTP stream on HTTPS page
  const isHttpOnHttps = window.location.protocol === 'https:' && url.startsWith('http://');
  
  // For HTTP streams on HTTPS, we'll mark them as needing proxy but still working
  if (isHttpOnHttps) {
    return { isWorking: true, isHttpBlocked: false, needsProxy: true };
  }
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      
      // Try HEAD request first (faster)
      try {
        await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors', // Many streams don't support CORS
        });
        clearTimeout(timeoutId);
        
        // no-cors mode always returns opaque response, so we assume success
        return { isWorking: true, isHttpBlocked: false, needsProxy: false };
      } catch {
        // HEAD failed, try GET
        const getController = new AbortController();
        const getTimeoutId = setTimeout(() => getController.abort(), TIMEOUT_MS);
        
        await fetch(url, {
          method: 'GET',
          signal: getController.signal,
          mode: 'no-cors',
        });
        clearTimeout(getTimeoutId);
        
        return { isWorking: true, isHttpBlocked: false, needsProxy: false };
      }
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        // Check if this might be a CORS/mixed content issue
        if (error instanceof TypeError) {
          return { isWorking: false, isHttpBlocked: true, needsProxy: true };
        }
        return { isWorking: false, isHttpBlocked: false, needsProxy: false };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { isWorking: false, isHttpBlocked: false, needsProxy: false };
}

// Batch check multiple streams with concurrency limit
export async function batchCheckStreams(
  urls: string[],
  concurrency: number = 5,
  onProgress?: (checked: number, total: number) => void
): Promise<Map<string, StreamCheckResult>> {
  const results = new Map<string, StreamCheckResult>();
  let checked = 0;
  
  const queue = [...urls];
  const workers: Promise<void>[] = [];
  
  for (let i = 0; i < concurrency; i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        const url = queue.shift();
        if (!url) break;
        
        const result = await checkStream(url);
        results.set(url, result);
        checked++;
        onProgress?.(checked, urls.length);
      }
    })());
  }
  
  await Promise.all(workers);
  return results;
}
