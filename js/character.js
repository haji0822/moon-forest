// 캐릭터 도감, 등록/수정 화면
import { getCharacter, listCharacters, listPlayers, createCharacter, updateCharacter } from "./database.js";
import { SPECIES, SPECIES_ORDER } from "../data/species.js";
import { esc, toast, $, portrait, vitalBar } from "./ui.js";

const ctx = () => window.__ctx;

export function speciesLabel(c) {
  return c.species === "other" ? (c.speciesCustomName || "기타") : (SPECIES[c.species]?.name || "알 수 없음");
}

export const VITAL_HELP = {
  hp: "체력: 부상과 위험한 탐색으로 줄고, 휴식과 치료로 회복됩니다.",
  fatigue: "피로: 탐색하면 오르고 휴식하면 내려갑니다. 높을수록 탐색 효율이 떨어집니다.",
  satiety: "포만감: 시간이 지나면 줄고 음식으로 회복됩니다."
};

export function vitalsHtml(c) {
  return vitalBar("체력", c.hp, VITAL_HELP.hp) + vitalBar("피로", c.fatigue, VITAL_HELP.fatigue, true) + vitalBar("포만감", c.satiety, VITAL_HELP.satiety);
}

const FIELDS = [
  ["gender", "성별 (표기)", "text", 40], ["age", "나이", "text", 40], ["height", "키", "text", 40],
  ["appearance", "외형", "area", 2000], ["personality", "성격", "area", 2000], ["features", "특징", "area", 2000],
  ["background", "과거 및 배경", "area", 2000], ["likes", "좋아하는 것", "area", 2000],
  ["dislikes", "싫어하는 것", "area", 2000], ["notes", "기타 자유 설정", "area", 2000]
];

// ---------- 도감 ----------
export async function renderCodex(main) {
  main.innerHTML = '<p class="muted">불러오는 중…</p>';
  try {
    const [chars, players] = await Promise.all([listCharacters(), listPlayers()]);
    const me = ctx().user.uid;
    const byUid = Object.fromEntries(chars.map(c => [c.ownerUid, c]));
    main.innerHTML = "";
    const order = [...players].sort((a, b) => (a.uid === me ? -1 : b.uid === me ? 1 : 0));
    for (const p of order) {
      const c = byUid[p.uid], mine = p.uid === me;
      const sec = document.createElement("section");
      sec.className = "page-panel";
      if (!c) {
        sec.innerHTML = `<h2>${esc(p.displayName)}의 캐릭터</h2><p class="muted">아직 등록하지 않았습니다.</p>` +
          (mine ? '<div><a class="btn btn-primary" href="#/character-edit">캐릭터 등록하기</a></div>' : "");
        main.appendChild(sec); continue;
      }
      const sp = SPECIES[c.species] || SPECIES.other;
      const body = document.createElement("div");
      body.className = "codex";
      const info = document.createElement("div");
      info.innerHTML = `<h2>${esc(c.name)}</h2>
        <p class="muted">${esc(speciesLabel(c))} / 레벨 ${c.level} (경험치 ${c.exp}) / ${esc(p.displayName)}의 캐릭터</p>
        <div class="vitals">${vitalsHtml(c)}</div>
        <p class="small muted">능력치: 체력 ${c.stats.vitality} / 탐색 ${c.stats.explore} / 생존 ${c.stats.survival} / 행운 ${c.stats.luck}</p>`;
      body.append(portrait(c.imageUrl, c.name, "large"), info);
      sec.appendChild(body);
      const rows = FIELDS.filter(f => c[f[0]]).map(f => `<dt>${f[1]}</dt><dd>${esc(c[f[0]])}</dd>`).join("");
      const speciesInfo = c.species === "other"
        ? `<p>${esc(c.speciesCustomDesc || "설명이 없습니다.")}</p>`
        : `<p>${esc(sp.desc)}</p><ul class="traits">${sp.traits.map(t => `<li>${esc(t)}</li>`).join("")}</ul><p class="small muted">종족 효과는 3단계(탐색)부터 적용됩니다.</p>`;
      const extra = document.createElement("div");
      extra.innerHTML = `<div class="divider"></div><h3>종족</h3>${speciesInfo}
        ${rows ? `<dl class="profile">${rows}</dl>` : ""}
        <p class="small muted">장비: 4단계에서 열립니다. 최근 활동 기록: 3단계 이후 쌓입니다.</p>`;
      sec.appendChild(extra);
      if (mine) { const a = document.createElement("a"); a.className = "btn"; a.href = "#/character-edit"; a.textContent = "프로필 수정"; sec.appendChild(a); }
      main.appendChild(sec);
    }
  } catch (e) {
    console.error("도감 로딩 실패:", e.code || e.message);
    main.innerHTML = '<p class="form-error">도감을 불러오지 못했습니다. 인터넷 연결과 보안 규칙을 확인해 주세요.</p>';
  }
}

// ---------- 등록 / 수정 ----------
export async function renderCharacterEdit(main) {
  const uid = ctx().user.uid;
  let existing;
  try { existing = await getCharacter(uid); }
  catch (e) { console.error(e.code || e.message); main.innerHTML = '<p class="form-error">캐릭터 정보를 불러오지 못했습니다.</p>'; return; }
  const v = (k) => esc(existing?.[k] ?? "");
  const fieldHtml = FIELDS.map(([k, label, type, max]) => type === "area"
    ? `<label class="field"><span>${label}</span><textarea name="${k}" rows="3" maxlength="${max}">${v(k)}</textarea></label>`
    : `<label class="field"><span>${label}</span><input name="${k}" maxlength="${max}" value="${v(k)}"></label>`).join("");
  main.innerHTML = `<form id="char-form" class="page-panel" novalidate>
    <h2>${existing ? "캐릭터 프로필 수정" : "캐릭터 등록"}</h2>
    <p class="muted small">이름과 종족만 필수입니다. 나머지는 비워 두어도 됩니다. 프로필을 수정해도 레벨과 상태는 그대로 유지됩니다.</p>
    <label class="field"><span>이름 (필수)</span><input name="name" maxlength="30" value="${v("name")}" required></label>
    <label class="field"><span>대표 이미지 (선택)</span>
      <input name="imageUrl" maxlength="500" value="${v("imageUrl")}" placeholder="assets/images/이름.png 또는 https 주소"></label>
    <p class="muted small">이미지 파일을 저장소의 assets/images 폴더에 올린 뒤 그 경로를 적으면 됩니다. 불러오지 못하면 이름 첫 글자로 표시됩니다.</p>
    <label class="field"><span>종족 (필수)</span>
      <select name="species" required>${SPECIES_ORDER.map(id => `<option value="${id}" ${existing?.species === id ? "selected" : ""}>${SPECIES[id].name}</option>`).join("")}</select></label>
    <div id="species-note" class="muted small"></div>
    <div id="custom-species" hidden>
      <label class="field"><span>종족 이름</span><input name="speciesCustomName" maxlength="30" value="${v("speciesCustomName")}"></label>
      <label class="field"><span>종족 특성 설명</span><textarea name="speciesCustomDesc" rows="3" maxlength="500">${v("speciesCustomDesc")}</textarea></label>
    </div>
    ${fieldHtml}
    <p id="char-error" class="form-error" role="alert" hidden></p>
    <div class="row"><button class="btn btn-primary" type="submit">저장</button><a class="btn" href="#/characters">취소</a></div>
  </form>`;
  const form = $("#char-form");
  const sel = form.elements.species;
  const refresh = () => {
    $("#custom-species").hidden = sel.value !== "other";
    $("#species-note").textContent = sel.value === "other" ? "" : SPECIES[sel.value].traits.join(" ");
  };
  sel.addEventListener("change", refresh); refresh();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#char-error"); err.hidden = true;
    const data = {};
    for (const n of ["name", "imageUrl", "species", "speciesCustomName", "speciesCustomDesc", ...FIELDS.map(f => f[0])]) data[n] = form.elements[n].value.trim();
    const fail = (m) => { err.textContent = m; err.hidden = false; };
    if (!data.name) return fail("이름을 입력해 주세요.");
    if (data.species === "other" && !data.speciesCustomName) return fail("'기타'를 고르면 종족 이름을 적어 주세요.");
    if (data.species !== "other") { data.speciesCustomName = ""; data.speciesCustomDesc = ""; }
    if (existing && existing.species !== data.species &&
        !confirm("종족을 바꾸면 이후 탐색 효과가 달라질 수 있습니다. 정말 바꿀까요?")) return;
    const btn = form.querySelector("button[type=submit]"); btn.disabled = true;
    try {
      if (existing) await updateCharacter(uid, data); else await createCharacter(uid, data);
      toast("저장했습니다.");
      location.hash = "#/characters";
    } catch (ex) {
      console.error("캐릭터 저장 실패:", ex.code || ex.message);
      fail("저장하지 못했습니다. 인터넷 연결과 보안 규칙을 확인해 주세요.");
    } finally { btn.disabled = false; }
  });
}
