/* ignore coverage somehow */

import { getInjectable } from "@ogre-tools/injectable";

const questionToPlayerInjectable = getInjectable({
  id: "question-to-player",

  instantiate: () => (message: string) =>
    new Promise((resolve) => resolve(window.confirm(message))),

  causesSideEffects: true,
});

export default questionToPlayerInjectable;
