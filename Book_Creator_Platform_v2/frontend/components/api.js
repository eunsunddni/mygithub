export const API_BASE_URL = "http://localhost:8080";

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
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