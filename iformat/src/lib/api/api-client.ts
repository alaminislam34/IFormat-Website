import { ApiResponse } from "@/types/api";
import { ApiError } from "./api-error";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  token?: string | null;
  _retry?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const storedAuth = localStorage.getItem("iformat-auth-storage");
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        return parsed?.state?.token || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const storedAuth = localStorage.getItem("iformat-auth-storage");
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        return parsed?.state?.refreshToken || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  private setTokens(token: string, refreshToken?: string) {
    if (typeof window === "undefined") return;
    try {
      const storedAuth = localStorage.getItem("iformat-auth-storage");
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed?.state) {
          parsed.state.token = token;
          if (refreshToken) parsed.state.refreshToken = refreshToken;
          localStorage.setItem("iformat-auth-storage", JSON.stringify(parsed));
        }
      }
    } catch {
      // Ignore
    }
  }

  private clearAuth() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("iformat-auth-storage");
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "iformat_access_token=; path=/; max-age=0; SameSite=Lax";
    } catch {
      // Ignore
    }
  }

  private onTokenRefreshed(newToken: string | null) {
    this.refreshSubscribers.forEach((callback) => callback(newToken));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string | null) => void) {
    this.refreshSubscribers.push(callback);
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    let fullPath = endpoint;
    if (!fullPath.startsWith("http://") && !fullPath.startsWith("https://")) {
      const cleanBase = this.baseUrl.replace(/\/+$/, "");
      const cleanEndpoint = endpoint.replace(/^\/+/, "");
      fullPath = `${cleanBase}/${cleanEndpoint}`;
    }

    if (fullPath.startsWith("http://") || fullPath.startsWith("https://")) {
      const url = new URL(fullPath);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, String(value));
          }
        });
      }
      return url.toString();
    }

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    if (queryString) {
      return fullPath.includes("?")
        ? `${fullPath}&${queryString}`
        : `${fullPath}?${queryString}`;
    }

    return fullPath;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, headers, token, _retry, ...customConfig } = options;

    const authToken = token !== undefined ? token : this.getAuthToken();

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authToken) {
      defaultHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
      credentials: "include", // Enables HttpOnly cookies transmission cross-origin/same-origin
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    };

    if (body !== undefined) {
      config.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, config);

      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle 401 Unauthorized for automatic token refresh (except on login/refresh itself)
      if (
        response.status === 401 &&
        !_retry &&
        !endpoint.includes("/auth/login") &&
        !endpoint.includes("/auth/refresh") &&
        !endpoint.includes("/auth/register")
      ) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const rawRefreshToken = this.getRefreshToken();
            if (rawRefreshToken) {
              const refreshRes = await fetch(this.buildUrl("/auth/refresh"), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ refreshToken: rawRefreshToken }),
              });

              if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const newToken =
                  refreshData?.data?.token || refreshData?.data?.accessToken || null;
                const newRefreshToken = refreshData?.data?.refreshToken || null;

                if (newToken) {
                  this.setTokens(newToken, newRefreshToken);
                  this.onTokenRefreshed(newToken);
                  this.isRefreshing = false;

                  // Retry original request
                  return this.request<T>(endpoint, {
                    ...options,
                    token: newToken,
                    _retry: true,
                  });
                }
              }
            }
          } catch {
            // Refresh failed
          }

          // If refresh failed or was not possible, clear invalid tokens
          this.clearAuth();
          this.isRefreshing = false;
          this.onTokenRefreshed(null);
        } else {
          // Wait for current refresh to complete
          return new Promise<T>((resolve, reject) => {
            this.addRefreshSubscriber((newToken) => {
              if (newToken) {
                resolve(
                  this.request<T>(endpoint, {
                    ...options,
                    token: newToken,
                    _retry: true,
                  })
                );
              } else {
                reject(new ApiError("Session expired. Please log in again", 401));
              }
            });
          });
        }
      }

      if (!response.ok) {
        const errorData = (data as { message?: string; errors?: Record<string, string[]> }) || {};
        throw new ApiError(
          errorData.message || (typeof data === "string" ? data : `Request failed with status ${response.status}`),
          response.status,
          errorData.errors
        );
      }

      // If wrapped in standard envelope { success: true, data: ... }
      if (data && typeof data === "object" && "data" in data) {
        return (data as ApiResponse<T>).data;
      }

      return data as T;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw ApiError.networkError(
        err instanceof Error ? err.message : "Network error"
      );
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
