export interface HttpClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface IHttpClient {
  get<T = unknown>(url: string, config?: HttpClientConfig): Promise<HttpResponse<T>>;
  post<T = unknown>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>>;
  put<T = unknown>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>>;
  delete<T = unknown>(url: string, config?: HttpClientConfig): Promise<HttpResponse<T>>;
}

export class HttpClient implements IHttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = config.headers || { 'Content-Type': 'application/json' };
    this.timeout = config.timeout || 30000;
  }

  async get<T = unknown>(url: string, config?: HttpClientConfig): Promise<HttpResponse<T>> {
    // Implementação será feita quando integrar com API real
    throw new Error('Not implemented - use mock repositories for now');
  }

  async post<T = unknown>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>> {
    throw new Error('Not implemented - use mock repositories for now');
  }

  async put<T = unknown>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>> {
    throw new Error('Not implemented - use mock repositories for now');
  }

  async delete<T = unknown>(url: string, config?: HttpClientConfig): Promise<HttpResponse<T>> {
    throw new Error('Not implemented - use mock repositories for now');
  }
}

