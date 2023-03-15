import { getInjectable } from "@ogre-tools/injectable";
import { sample } from "lodash/fp";

const getRandomSampleFromCollectionInjectable = getInjectable({
  id: "get-random-sample-from-collection",
  instantiate: () => sample,
  causesSideEffects: true,
});

export default getRandomSampleFromCollectionInjectable;
