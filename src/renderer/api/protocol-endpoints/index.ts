import { LensProtocolRouter } from "../../../main/protocol-handler";
import { installExtension } from "./install-extension";

export function registerHandlers() {
  const lpr: LensProtocolRouter = LensProtocolRouter.getInstance();

  lpr.on("/install-extension", installExtension);
}

export default {
  registerHandlers
};
