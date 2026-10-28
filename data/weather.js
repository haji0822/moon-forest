// 날씨 규칙 데이터. weight가 클수록 자주 나옵니다. nightOnly 날씨는 밤에만 나타나고, 낮에는 fallback으로 대체됩니다.
// effects는 3단계(탐색)부터 결과 계산에 사용됩니다. 지금은 설명만 표시됩니다.
export const WEATHER = [
  { id: "clear",  name: "맑음",        weight: 30, desc: "달과 해가 또렷하게 보인다.", effects: ["기본 탐색 효율"] },
  { id: "cloudy", name: "흐림",        weight: 22, desc: "하늘이 낮게 가라앉아 있다.", effects: ["특별한 변화 없음"] },
  { id: "rain",   name: "비",          weight: 18, desc: "숲길이 젖어 발걸음이 무겁다.", effects: ["약초와 버섯 발견 증가", "피로 증가"] },
  { id: "fog",    name: "안개",        weight: 12, desc: "길이 안개에 삼켜진다.", effects: ["희귀 장소 발견 증가", "길을 잃거나 다칠 가능성 증가"] },
  { id: "snow",   name: "눈",          weight: 8,  desc: "발자국이 하얗게 덮인다.", effects: ["일부 야외 탐색 효율 감소"] },
  { id: "strangeMoon", name: "기이한 달빛", weight: 10, nightOnly: true, fallback: "cloudy", desc: "달빛이 닿는 곳마다 시간이 어긋난다.", effects: ["특수 이벤트 발생 증가", "달빛 호수 탐색에 영향"] }
];
