import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import getRandomSampleFromCollectionInjectable from "./get-random-sample-from-collection.injectable";

export type Monster = {
  name: string;
  hitPoints: number;
};

export const monsterInjectionToken = getInjectionToken<Monster>({ id: "monster-injection-token" });

const monsterInjectable = getInjectable({
  id: "monster",

  instantiate: (di): Monster => {
    const allMonsters = di.injectMany(monsterInjectionToken);
    const getRandomSampleFromCollection = di.inject(getRandomSampleFromCollectionInjectable);

    const randomMonster = getRandomSampleFromCollection(allMonsters);

    return randomMonster!;
  },
});

export default monsterInjectable;
