import { getInjectable } from "@ogre-tools/injectable";

const monsterInjectable = getInjectable({
  id: "monster",
  instantiate: () => ({ hitPoints: 3 }),
});

export default monsterInjectable;
