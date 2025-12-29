import axios, { AxiosError } from 'axios';

export interface LinkCheckResult {
  success: boolean;
  finalUrl: string;
  statusCode: number | null;
  responseTime: number;
  redirectChain: string[];
  error?: string;
  timestamp: Date;
}

interface RedirectInfo {
  url: string;
  statusCode: number;
}

const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10000; // 10 seconds

export async function checkLink(url: string): Promise<LinkCheckResult> {
  const startTime = Date.now();
  const redirectChain: string[] = [url];

  try {
    // Validate URL
    const parsedUrl = new URL(url);

    // Make HTTP GET request with redirect following
    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      maxRedirects: MAX_REDIRECTS,
      validateStatus: (status) => status < 600, // Accept all HTTP status codes
      headers: {
        'User-Agent': 'LinkGuardian-Bot/1.0 (Link Monitoring Service)',
      },
      // Track redirect chain
      beforeRedirect: (options, responseDetails) => {
        if (responseDetails.headers.location) {
          const redirectUrl = new URL(responseDetails.headers.location, options.url).href;
          redirectChain.push(redirectUrl);
        }
      },
    });

    const responseTime = Date.now() - startTime;
    const finalUrl = response.request?.res?.responseUrl || response.config.url || url;

    // Add final URL to chain if it's different
    if (finalUrl !== redirectChain[redirectChain.length - 1]) {
      redirectChain.push(finalUrl);
    }

    return {
      success: response.status >= 200 && response.status < 400,
      finalUrl,
      statusCode: response.status,
      responseTime,
      redirectChain,
      timestamp: new Date(),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Handle timeout
      if (axiosError.code === 'ECONNABORTED') {
        return {
          success: false,
          finalUrl: url,
          statusCode: null,
          responseTime,
          redirectChain,
          error: 'Request timeout - server took longer than 10 seconds to respond',
          timestamp: new Date(),
        };
      }

      // Handle DNS errors
      if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'EAI_AGAIN') {
        return {
          success: false,
          finalUrl: url,
          statusCode: null,
          responseTime,
          redirectChain,
          error: `DNS error - domain not found: ${axiosError.message}`,
          timestamp: new Date(),
        };
      }

      // Handle SSL/TLS errors
      if (axiosError.code === 'CERT_HAS_EXPIRED' ||
          axiosError.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
          axiosError.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
        return {
          success: false,
          finalUrl: url,
          statusCode: null,
          responseTime,
          redirectChain,
          error: `SSL/TLS certificate error: ${axiosError.message}`,
          timestamp: new Date(),
        };
      }

      // Handle network errors
      if (axiosError.code === 'ECONNREFUSED' ||
          axiosError.code === 'ECONNRESET' ||
          axiosError.code === 'ETIMEDOUT') {
        return {
          success: false,
          finalUrl: url,
          statusCode: null,
          responseTime,
          redirectChain,
          error: `Network error: ${axiosError.message}`,
          timestamp: new Date(),
        };
      }

      // Handle HTTP error responses
      if (axiosError.response) {
        return {
          success: false,
          finalUrl: axiosError.response.request?.res?.responseUrl || url,
          statusCode: axiosError.response.status,
          responseTime,
          redirectChain,
          error: `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
          timestamp: new Date(),
        };
      }

      // Generic axios error
      return {
        success: false,
        finalUrl: url,
        statusCode: null,
        responseTime,
        redirectChain,
        error: `Request failed: ${axiosError.message}`,
        timestamp: new Date(),
      };
    }

    // Handle invalid URL
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      return {
        success: false,
        finalUrl: url,
        statusCode: null,
        responseTime,
        redirectChain,
        error: 'Invalid URL format',
        timestamp: new Date(),
      };
    }

    // Unknown error
    return {
      success: false,
      finalUrl: url,
      statusCode: null,
      responseTime,
      redirectChain,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date(),
    };
  }
}
