import { configured, auth } from "./firebase.js";
import { watchAuth, login, signUp, logout, errorMessage } from "./auth.js";
import { ensurePlayer, claimSeat } from "./database.js";
import { register, startRouter } from "./router.js";
import { renderHome, renderSettings } from "./pages.js";
import { showView, $, toast } from "./ui.js";

register("home", "집", renderHome);
register("settings", "설정", renderSettings);

let routerStarted = false;
let joining = false;   // 가입 처리 중에는 자동 로그인 처리를 잠시 멈춥니다.
let signupMode = false;

async function onAuth(user, preferredName) {
  if (joining) return;
  if (!user) { window.__ctx = null; showView("login"); return; }
  try {
    const player = await ensurePlayer(user, preferredName);
    window.__ctx = { user, player };
    $("#topbar-user").textContent = player.displayName;
    showView("app");
    if (!routerStarted) { routerStarted = true; await startRouter(); }
    else window.dispatchEvent(new Event("hashchange"));
  } catch (e) {
    console.error("플레이어 확인 실패:", e.code || e.message);
    if (e.code === "permission-denied") {
      $("#denied-uid").textContent = user.uid;
      showView("denied");
    } else {
      showView("login");
      toast("서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.", "error");
    }
  }
}

function setMode(on) {
  signupMode = on;
  $("#name-field").hidden = !on;
  $("#code-field").hidden = !on;
  $("#login-submit").textContent = on ? "집에 참여하기" : "숲으로 들어간다";
  $("#mode-toggle").textContent = on ? "이미 참여했다면 로그인" : "처음이라면 집에 참여하기";
  $("#login-password").autocomplete = on ? "new-password" : "current-password";
  $("#login-error").hidden = true;
}

async function handleSignup(email, pw, name, code) {
  joining = true;
  let cred;
  try {
    cred = await signUp(email, pw);
    try {
      await claimSeat(cred.user, code);
    } catch (e) {
      console.error("참여 실패:", e.code || e.message);
      await cred.user.delete().catch(() => {});   // 참여에 실패한 빈 계정은 바로 정리
      throw Object.assign(new Error("claim"), { code: "claim-denied" });
    }
  } finally { joining = false; }
  await onAuth(cred.user, name);
}

function setupLoginForm() {
  const err = $("#login-error"), btn = $("#login-submit");
  $("#mode-toggle").addEventListener("click", () => setMode(!signupMode));
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    err.hidden = true;
    const email = $("#login-email").value.trim(), pw = $("#login-password").value;
    const name = $("#login-name").value.trim(), code = $("#login-code").value;
    const show = (m) => { err.textContent = m; err.hidden = false; };
    if (!email || !pw) return show("이메일과 비밀번호를 입력해 주세요.");
    if (signupMode && (!name || !code)) return show("표시 이름과 초대 코드를 입력해 주세요.");
    btn.disabled = true;
    try {
      if (signupMode) await handleSignup(email, pw, name, code);
      else await login(email, pw);
      $("#login-password").value = ""; $("#login-code").value = "";
    } catch (ex) {
      console.error("인증 실패:", ex.code);
      show(ex.code === "claim-denied"
        ? "초대 코드가 올바르지 않거나 이미 두 사람이 참여했습니다."
        : errorMessage(ex));
    } finally { btn.disabled = false; }
  });
  $("#denied-logout").addEventListener("click", () => logout());
}

if (!configured) {
  showView("setup");
} else {
  setupLoginForm();
  watchAuth((u) => onAuth(u));
}
