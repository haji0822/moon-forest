import { listPlayers, saveDisplayName } from "./database.js";
import { logout } from "./auth.js";
import { esc, toast, $ } from "./ui.js";

export function currentContext() { return window.__ctx; }

export async function renderHome(main) {
  main.innerHTML = `
    <section class="hero-house">
      <h2 class="title-md">달이 잠든 숲의 집</h2>
      <p>두 사람이 함께 사는 집입니다. 캐릭터 등록과 세계 시간은 2단계에서 열립니다.</p>
    </section>
    <section class="page-panel"><h2>이 집의 두 사람</h2><div id="players" class="muted">불러오는 중…</div></section>`;
  try {
    const players = await listPlayers();
    const me = currentContext().user.uid;
    $("#players").innerHTML = players.length
      ? players.map(p => `<div class="player-row"><span>${esc(p.displayName)}</span>${p.uid === me ? '<span class="badge">나</span>' : ""}</div>`).join("")
      : "아직 등록된 사람이 없습니다.";
  } catch (e) {
    console.error("플레이어 목록 로딩 실패:", e.code || e.message);
    $("#players").innerHTML = '<p class="form-error">데이터를 불러오지 못했습니다. 인터넷 연결과 보안 규칙을 확인해 주세요.</p>';
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
