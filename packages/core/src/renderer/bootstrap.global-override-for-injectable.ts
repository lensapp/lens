import { getGlobalOverride } from "../common/test-utils/get-global-override";
import bootstrapInjectable from "./bootstrap.injectable";

export default getGlobalOverride(bootstrapInjectable, () => ({
  run: () => {},
}));
