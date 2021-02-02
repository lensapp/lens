import { LensProtocolRouterRenderer } from "../protocol-handler/router";
import { navigate } from "./helpers";

export function bindProtocolHandlers() {
  const lprr = LensProtocolRouterRenderer.getInstance<LensProtocolRouterRenderer>();

  lprr.addInternalHandler("/preferences", () => {
    navigate("/preferences");
  });
}
