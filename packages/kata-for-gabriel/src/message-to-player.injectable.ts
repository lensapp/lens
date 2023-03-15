/* ignore coverage somehow */

import { getInjectable } from "@ogre-tools/injectable";

const messageToPlayerInjectable = getInjectable({
  id: "message-to-player",
  instantiate: () => (message: string) => {},
  causesSideEffects: true,
});

export default messageToPlayerInjectable;
