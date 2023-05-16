import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

const fsInjectable = getInjectable({
  id: "fs",
  instantiate: () => fse,
  causesSideEffects: true,
});

export default fsInjectable;
