import { listPlayers, listCharacters, saveDisplayName } from "./database.js";
import { snapshot } from "./gameState.js";
import { speciesLabel, vitalsHtml } from "./character.js";
import { logout } from "./auth.js";
import { esc, toast, $, portrait } from "./ui.js";

export function currentContext() { return window.__ctx; }

export async function renderHome(main) {
  const world = snapshot();
  const wHtml = world
    ? `<section class="page-panel"><h2>${esc(world.time.dateText)}, ${esc(world.time.period)}</h2>
        <p>${esc(world.weather.name)}. ${esc(world.weather.desc)}</p>
        <p class="small muted">날씨 효과(${esc(world.weather.effects.join(", "))})는 3단계 탐색부터 적용됩니다.</p></section>`
    : '<p class="form-error">세계 상태를 불러오지 못했습니다. 보안 규칙을 최신으로 게시했는지 확인해 주세요.</p>';
  main.innerHTML = `
    <section class="hero-house">
      <h2 class="title-md">달이 잠든 숲의 집</h2>
      <p>두 사람이 함께 사는 집입니다.</p>
    </section>${wHtml}
    <section class="page-panel"><h2>함께 사는 두 사람</h2><div id="residents" class="residents muted">불러오는 중…</div></section>
    <section class="page-panel"><h2>최근 기록</h2><p class="muted">아직 기록이 없습니다. 탐색과 공동 기록은 이후 단계에서 열립니다.</p></section>`;
  try {
    const [players, chars] = await Promise.all([listPlayers(), listCharacters()]);
    const me = currentContext().user.uid;
    const byUid = Object.fromEntries(chars.map(c => [c.ownerUid, c]));
    const box = $("#residents"); box.innerHTML = "";
    if (!players.length) box.textContent = "아직 등록된 사람이 없습니다.";
    for (const p of players) {
      const c = byUid[p.uid], card = document.createElement("a");
      card.className = "resident"; card.href = "#/characters";
      if (c) {
        card.append(portrait(c.imageUrl, c.name));
        const info = document.createElement("div");
        info.innerHTML = `<strong>${esc(c.name)}</strong><div class="small muted">${esc(speciesLabel(c))} / 레벨 ${c.level}${p.uid === me ? " / 나" : ""}</div>${vitalsHtml(c)}`;
        card.append(info);
      } else {
        card.append(portrait("", p.displayName));
        const info = document.createElement("div");
        info.innerHTML = `<strong>${esc(p.displayName)}</strong><div class="small muted">${p.uid === me ? "캐릭터를 등록해 주세요." : "아직 캐릭터를 등록하지 않았습니다."}</div>`;
        card.append(info);
      }
      box.append(card);
    }
  } catch (e) {
    console.error("메인 화면 로딩 실패:", e.code || e.message);
    $("#residents").innerHTML = '<p class="form-error">데이터를 불러오지 못했습니다. 인터넷 연결과 보안 규칙을 확인해 주세요.</p>';
  }
}

export async function renderSettings(main) {
  const { user, player } = currentContext();
  main.innerHTML = `
    <section class="page-panel">
      <h2>표시 이름</h2>
      <form id="name-form" class="settings-form">
        <label class="field"><span>다른 사람에게 보이는 이름</span>
          <input id="name-input" maxlength="20" value="${esc(player.displayName)}" required></label>
        <button class="btn btn-primary" type="submit">이름 저장</button>
      </form>
    </section>
    <section class="page-panel">
      <h2>계정</h2>
      <p class="muted small">${esc(user.email)}</p>
      <div><button id="logout-btn" class="btn btn-danger" type="button">로그아웃</button></div>
    </section>`;
  $("#name-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#name-input").value.trim();
    if (!name) return toast("이름을 입력해 주세요.", "error");
    try {
      const saved = await saveDisplayName(user.uid, name);
      currentContext().player = { ...player, ...saved };
      $("#topbar-user").textContent = saved.displayName;
      toast("이름을 저장했습니다.");
    } catch (err) {
      console.error("이름 저장 실패:", err.code || err.message);
      toast("저장하지 못했습니다. 권한이나 연결을 확인해 주세요.", "error");
    }
  });
  $("#logout-btn").addEventListener("click", () => logout());
}
