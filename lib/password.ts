import { apiFetch } from "@/lib/api";

// Altere os endpoints aqui. A URL base é NEXT_PUBLIC_API_URL (lib/api.ts).
export function requestPasswordReset(email: string) {
  return apiFetch<{ success: boolean }>("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(
  token: string,
  email: string,
  pass1: string,
  pass2: string,
) {
  return apiFetch<{ success: boolean }>(
    `/forgot-password/new-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
    { method: "POST", body: JSON.stringify({ pass1, pass2 }) },
  );
}
