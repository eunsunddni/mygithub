export function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getLatestDate(item) {
  return item.updatedAt || item.createdAt;
}

export function hslFromName(name) {
  const text = (name || "?").trim() || "?";
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return `hsl(${hash % 360}, 65%, 55%)`;
}
