import { identity } from "lodash/fp";
import { getGlobalOverride } from "../../../common/test-utils/get-global-override";
import telemetryDecoratorInjectable from "./telemetry-decorator.injectable";

export default getGlobalOverride(telemetryDecoratorInjectable, () => ({
  decorate: identity,
}));
