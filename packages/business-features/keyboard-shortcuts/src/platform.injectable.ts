import { getInjectable } from "@ogre-tools/injectable";

export const allPlatforms = ["win32", "darwin", "linux"] as const;

const platformInjectable = getInjectable({
  id: "platform",
  instantiate: () => process.platform as (typeof allPlatforms)[number],
  causesSideEffects: true,
});

export default platformInjectable;
