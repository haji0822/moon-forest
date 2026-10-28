// 세계 상태(공유 기준 시각) 로딩과 상단 날짜/날씨 표시줄
import { ensureWorld } from "./database.js";
import { getGameTime, getWeather } from "./gameClock.js";

let epochMs = null, offset = 0, timer = null;

export async function initWorld(clockOffset) {
  offset = clockOffset;
  epochMs = await ensureWorld();
  renderBar();
  if (!timer) timer = setInterval(renderBar, 30000);   // 화면 갱신용일 뿐, 실제 값은 기준 시각에서 계산됩니다.
}

export function snapshot() {
  if (epochMs == null) return null;
  const time = getGameTime(Date.now() + offset, epochMs);
  return { time, weather: getWeather(time) };
}

export function renderBar() {
  const bar = document.getElementById("world-bar");
  if (!bar) return;
  const s = snapshot();
  if (!s) { bar.textContent = "세계 상태를 불러오지 못했습니다."; return; }
  bar.innerHTML = "";
  for (const [text, title] of [[s.time.dateText, "게임 내 날짜"], [`${s.time.period} ${s.time.timeText}`, "게임 내 시간대"], [s.weather.name, s.weather.desc]]) {
    const span = document.createElement("span");
    span.textContent = text; span.title = title;
    bar.appendChild(span);
  }
}
