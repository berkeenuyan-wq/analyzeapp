/**
 * The single HTTP entry point for the renderer (docs/CODING_STANDARDS.md §2).
 * Owns the base URL (from the Electron port handshake, or the dev server),
 * typed responses, and error normalisation to `{ code, message }`.
 */

export interface ApiError {
  code: string;
  /** Turkish, display-ready. */
  message: string;
}

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
    this.status = status;
  }
}

/** Resolve the backend origin: Electron bridge in prod, Vite server in dev. */
export function resolveBackendBase(): string {
  const port = window.up?.backendPort;
  if (typeof port === "number" && Number.isFinite(port)) {
    return `http://127.0.0.1:${String(port)}`;
  }
  // Browser dev: same origin, Vite proxies /api and /health to the sidecar.
  return window.location.origin;
}

function normaliseError(body: unknown, status: number): ApiRequestError {
  const fallback: ApiError = {
    code: "unknown",
    message: "Beklenmeyen bir hata oluştu.",
  };
  if (body && typeof body === "object") {
    const detail = (body as { detail?: unknown }).detail;
    if (detail && typeof detail === "object") {
      const code = (detail as { code?: unknown }).code;
      const message = (detail as { message?: unknown }).message;
      return new ApiRequestError(
        {
          code: typeof code === "string" ? code : fallback.code,
          message: typeof message === "string" ? message : fallback.message,
        },
        status,
      );
    }
    if (typeof detail === "string") {
      return new ApiRequestError({ code: fallback.code, message: detail }, status);
    }
  }
  return new ApiRequestError(fallback, status);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch(`${resolveBackendBase()}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiRequestError(
      { code: "network", message: "Sunucuya ulaşılamadı." },
      0,
    );
  }

  const text = await resp.text();
  const parsed: unknown = text ? JSON.parse(text) : null;

  if (!resp.ok) {
    throw normaliseError(parsed, resp.status);
  }
  return parsed as T;
}

// --- typed response shapes ------------------------------------------------- //
export interface HeadlineMetrics {
  islenen_ton: number;
  ort_toplam_verim: number | null;
  ort_batch_suresi_dk: number | null;
  cikan_ort_t_sa: number | null;
  posa_saatlik_toplam_t_sa: number | null;
  batch_count: number;
}

export const api = {
  health: () => request<{ status: string }>("/health"),
  headline: () => request<HeadlineMetrics>("/api/metrics/headline"),
};
