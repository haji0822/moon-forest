export const $ = (sel, root = document) => root.querySelector(sel);

export function esc(text) {
  const d = document.createElement("div");
  d.textContent = text ?? "";
  return d.innerHTML;
}

export function toast(message, type = "info") {
  const box = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast " + (type === "error" ? "error" : "");
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

export function showView(name) {
  for (const id of ["loading", "setup", "login", "denied", "app"]) {
    const el = document.getElementById("view-" + id);
    if (el) el.hidden = id !== name;
  }
}
