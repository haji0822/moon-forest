// 게임 시간 계산. 현실 시간과 분리되어 있으며, 저장된 기준 시각(epoch)과 경과 시간만 사용합니다.
import { WEATHER } from "../data/weather.js";

export const DAY_MS = 6 * 60 * 60 * 1000;   // 게임의 하루 = 현실 6시간 (여기서 변경)
export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;

const PERIODS = [ // 시작 시(게임 시간) 기준. 0~4시는 '밤'으로 이어집니다.
  { from: 4, name: "새벽" }, { from: 7, name: "아침" }, { from: 11, name: "낮" },
  { from: 17, name: "저녁" }, { from: 20, name: "밤" }
];

export function getGameTime(nowMs, epochMs) {
  const elapsed = Math.max(0, nowMs - epochMs);
  const dayIndex = Math.floor(elapsed / DAY_MS);
  const hourFloat = ((elapsed % DAY_MS) / DAY_MS) * 24;   // 하루의 시작은 자정
  const hour = Math.floor(hourFloat), minute = Math.floor((hourFloat - hour) * 60);
  const daysPerYear = DAYS_PER_MONTH * MONTHS_PER_YEAR;
  const year = Math.floor(dayIndex / daysPerYear) + 1;
  const month = Math.floor((dayIndex % daysPerYear) / DAYS_PER_MONTH) + 1;
  const day = (dayIndex % DAYS_PER_MONTH) + 1;
  let period = "밤";
  for (const p of PERIODS) if (hour >= p.from) period = p.name;
  return {
    dayIndex, hour, minute, period,
    isNight: hour >= 20 || hour < 4,
    dateText: `제${year}년 ${month}월 ${day}일`,
    timeText: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
  };
}

function seededRandom(seed) {   // 같은 날짜 번호 → 항상 같은 값 (두 플레이어에게 동일)
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function weatherForDay(dayIndex) {
  const total = WEATHER.reduce((s, w) => s + w.weight, 0);
  let r = seededRandom(dayIndex * 7919 + 13) * total;
  for (const w of WEATHER) { if ((r -= w.weight) < 0) return w; }
  return WEATHER[0];
}

export function getWeather(gt) {
  const w = weatherForDay(gt.dayIndex);
  if (w.nightOnly && !gt.isNight) return WEATHER.find(x => x.id === w.fallback) || WEATHER[0];
  return w;
}
