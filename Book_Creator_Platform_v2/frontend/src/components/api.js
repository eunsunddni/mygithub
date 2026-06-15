export const API_BASE_URL = "http://localhost:3000";
export const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations";

export async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`요청 실패: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
