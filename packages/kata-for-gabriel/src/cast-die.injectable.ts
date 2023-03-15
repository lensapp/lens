/* ignore coverage somehow */

import { getInjectable } from "@ogre-tools/injectable";

const castDieInjectable = getInjectable({
  id: "cast-die",
  instantiate: () => () => Promise.resolve(Math.ceil(Math.random() * 6)),
  causesSideEffects: true,
});

export default castDieInjectable;
