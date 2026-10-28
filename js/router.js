// 주소 뒤의 #/home 형태로 화면을 전환합니다. (GitHub Pages에서 새로고침해도 안전)
const routes = {};

export function register(name, title, render) {
  routes[name] = { title, render };
}

export async function navigate() {
  const name = (location.hash.replace("#/", "") || "home");
  const route = routes[name] || routes.home;
  const key = routes[name] ? name : "home";
  document.querySelectorAll(".nav-item[data-route]").forEach(a =>
    a.classList.toggle("active", a.dataset.route === key));
  document.getElementById("topbar-title").textContent = route.title;
  const main = document.getElementById("main");
  main.innerHTML = "";
  await route.render(main);
}

export function startRouter() {
  window.addEventListener("hashchange", navigate);
  return navigate();
}
