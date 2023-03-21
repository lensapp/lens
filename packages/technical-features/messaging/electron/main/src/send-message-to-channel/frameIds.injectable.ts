import { getInjectable } from "@ogre-tools/injectable";

const frameIdsInjectable = getInjectable({
  id: "frame-ids",
  instantiate: () => new Set<{ frameId: number; processId: number }>(),
});

export default frameIdsInjectable;
