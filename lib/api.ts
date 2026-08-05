const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8888";

export class ApiError extends Error {
  status: number;
  issues?: { path: string; message: string }[];

  constructor(
    status: number,
    message: string,
    issues?: { path: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.message ?? "Ocorreu um erro inesperado, tente novamente.",
      body?.issues,
    );
  }

  return body as T;
}
