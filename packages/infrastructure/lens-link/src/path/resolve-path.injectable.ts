import { getInjectable } from "@ogre-tools/injectable";
import path from "path";

export type ResolvePath = typeof path.resolve;

export const resolvePathInjectable = getInjectable({
  id: "resolve-path",
  instantiate: (): ResolvePath => path.resolve,
});
