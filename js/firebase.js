import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const configured = !Object.values(firebaseConfig).some(v => String(v).includes("YOUR_"));

export let auth = null;
export let db = null;

if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);   // 로그인 상태는 기본적으로 브라우저에 유지됩니다.
  db = getFirestore(app);
}
