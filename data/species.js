// 종족 데이터. 새 종족/효과는 여기서만 수정하세요.
// modifiers 값은 3단계(탐색)부터 계산에 사용됩니다. 지금은 도감에 설명만 표시됩니다.
export const SPECIES_ORDER = ["human", "werewolf", "vampire", "other"];

export const SPECIES = {
  human: {
    name: "인간",
    desc: "도구와 장비를 능숙하게 다루는 기본 생존자.",
    traits: ["다양한 도구와 장비를 효율적으로 활용한다.", "기본적인 생존 능력을 가진다."],
    modifiers: { equipmentBonus: 0.1 }
  },
  werewolf: {
    name: "늑대인간",
    desc: "사람의 형상을 한 존재. 냄새와 흔적을 읽는다.",
    traits: ["냄새와 흔적을 이용한 탐색에 강점이 있다.", "숲과 야외 지역에서 특정 발견 확률이 오른다.", "달의 변화에 따라 특별한 이벤트가 일어날 수 있다."],
    modifiers: { outdoorFindBonus: 0.1, moonEvents: true }
  },
  vampire: {
    name: "흡혈귀",
    desc: "밤에 익숙한 존재. 생존 요구가 다를 수 있다.",
    traits: ["일반 음식과 다른 생존 요구를 가질 수 있다.", "야간 탐색에 강점이 있다.", "햇빛이 강한 조건에서는 일부 활동에 불이익이 있다."],
    modifiers: { nightExploreBonus: 0.1, sunlightPenalty: 0.1 }
  },
  other: {
    name: "기타",
    desc: "종족 이름과 설명을 직접 적습니다.",
    traits: ["별도의 게임 효과는 기본적으로 없다."],
    modifiers: {}
  }
};
