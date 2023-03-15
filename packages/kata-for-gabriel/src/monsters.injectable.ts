import { getInjectable } from "@ogre-tools/injectable";
import { monsterInjectionToken } from "./monster.injectable";

export const mikkoMonsterInjectable = getInjectable({
  id: "mikko-monster",
  instantiate: () => ({ name: "Mikko", hitPoints: 5 }),
  injectionToken: monsterInjectionToken,
});

export const gabrielMonsterInjectable = getInjectable({
  id: "gabriel-monster",
  instantiate: () => ({ name: "Gabriel", hitPoints: 10 }),
  injectionToken: monsterInjectionToken,
});

export const jariMonsterInjectable = getInjectable({
  id: "jari-monster",
  instantiate: () => ({ name: "Jari", hitPoints: 2 }),
  injectionToken: monsterInjectionToken,
});


