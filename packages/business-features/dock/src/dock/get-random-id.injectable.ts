import { getInjectable } from "@ogre-tools/injectable";
import { v4 as getRandomId } from "uuid";
import { getInjectionToken } from "@ogre-tools/injectable";

export type GetRandomId = () => string;

export const getRandomIdInjectionToken = getInjectionToken<GetRandomId>({
  id: "get-random-id-injection-token",
});

const getRandomIdInjectable = getInjectable({
  id: "get-random-id",
  instantiate: () => () => getRandomId(),
  causesSideEffects: true,
  injectionToken: getRandomIdInjectionToken,
});

export default getRandomIdInjectable;
