import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get CSRF token from cookie
function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/csrfToken=([^;]+)/);
  return match ? match[1] : null;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Overloaded apiRequest function to support both old and new patterns
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response>;
export async function apiRequest<T = any>(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: HeadersInit;
  }
): Promise<T>;
export async function apiRequest<T = any>(
  urlOrMethod: string,
  urlOrOptions?: string | {
    method?: string;
    body?: unknown;
    headers?: HeadersInit;
  },
  data?: unknown
): Promise<T | Response> {
  let url: string;
  let method: string;
  let body: unknown;
  let customHeaders: HeadersInit = {};

  // Handle both call patterns - detect if first arg is URL or method
  const firstArgIsUrl = urlOrMethod.startsWith('/') || urlOrMethod.startsWith('http');

  if (typeof urlOrOptions === 'string' && !firstArgIsUrl) {
    // Old pattern: apiRequest(method, url, data)
    method = urlOrMethod;
    url = urlOrOptions;
    body = data;
  } else if (typeof urlOrOptions === 'string' && firstArgIsUrl) {
    // Swapped old pattern: apiRequest(url, method, data) - auto-correct
    url = urlOrMethod;
    method = urlOrOptions;
    body = data;
  } else {
    // New pattern: apiRequest(url, options)
    url = urlOrMethod;
    const options = urlOrOptions || {};
    method = options.method || 'GET';
    body = options.body;
    customHeaders = options.headers || {};
  }

  const headers: Record<string, string> = {
    ...customHeaders as Record<string, string>,
    ...(body ? { "Content-Type": "application/json" } : {})
  };
  
  // Add CSRF token for state-changing methods
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // For the new pattern, return parsed JSON; for old pattern, return Response
  if (typeof urlOrOptions !== 'string') {
    return await res.json();
  }
  return res as T | Response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle query keys properly - first element is URL, second might be params object
    let url = queryKey[0] as string;

    // If second element exists and is an object, convert to query string
    if (queryKey.length > 1 && typeof queryKey[1] === 'object' && queryKey[1] !== null) {
      const params = queryKey[1] as Record<string, any>;
      const searchParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      }

      const queryString = searchParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    } else if (queryKey.length > 1) {
      // Legacy behavior: join path segments
      url = queryKey.filter(k => typeof k === 'string').join('/');
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
