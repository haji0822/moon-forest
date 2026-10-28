import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc, getDocs, collection, serverTimestamp, writeBatch, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 초대 코드로 집에 참여합니다. members 문서 생성과 정원(config/seats) 증가를 한 번에 처리하며,
// 코드가 틀리거나 정원(2명)이 차면 보안 규칙이 거부합니다(permission-denied).
export async function claimSeat(user, inviteCode) {
  const batch = writeBatch(db);
  batch.set(doc(db, "members", user.uid), { inviteCode });
  batch.update(doc(db, "config", "seats"), { count: increment(1) });
  await batch.commit();
}

// 플레이어 문서(players/{uid})를 만들거나 접속 시각을 갱신합니다.
export async function ensurePlayer(user, preferredName) {
  const ref = doc(db, "players", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const name = (preferredName || (user.email || "플레이어").split("@")[0]).slice(0, 20);
    await setDoc(ref, { displayName: name, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
  } else {
    await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
  return (await getDoc(ref)).data();
}

export async function listPlayers() {
  const snap = await getDocs(collection(db, "players"));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

// 저장한 뒤 다시 읽어서 실제로 저장됐는지 확인합니다.
export async function saveDisplayName(uid, name) {
  const ref = doc(db, "players", uid);
  await setDoc(ref, { displayName: name }, { merge: true });
  const saved = (await getDoc(ref)).data();
  if (saved.displayName !== name) throw new Error("저장 확인 실패");
  return saved;
}
