export const $ = (sel, root = document) => root.querySelector(sel);

export function esc(text) {
  const d = document.createElement("div");
  d.textContent = text ?? "";
  return d.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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

// 캐릭터 초상: 이미지가 없거나 불러오기에 실패하면 이름 첫 글자로 대체합니다.
export function portrait(url, name, size = "") {
  const box = document.createElement("div");
  box.className = "portrait " + size;
  const fallback = () => { box.replaceChildren(); box.classList.add("no-img"); box.textContent = (name || "?").trim().charAt(0) || "?"; };
  if (!url) { fallback(); return box; }
  const img = new Image();
  img.alt = `${name}의 초상`;
  img.onerror = fallback;
  img.src = url;
  box.appendChild(img);
  return box;
}

// 상태 막대: 숫자와 막대, 위험 문구를 함께 표시 (색상만으로 구분하지 않음)
export function vitalBar(label, value, desc, highIsBad = false) {
  const bad = highIsBad ? value >= 75 : value <= 25;
  return `<div class="vital" title="${esc(desc)}"><span>${label}</span>
    <div class="bar${bad ? " bad" : ""}"><i style="width:${Math.max(0, Math.min(100, value))}%"></i></div>
    <b>${value}/100${bad ? " 위험" : ""}</b></div>`;
}
