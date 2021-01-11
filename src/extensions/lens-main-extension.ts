import type { MenuRegistration } from "./registries/menu-registry";
import { LensExtension } from "./lens-extension";
import { WindowManager } from "../main/window-manager";
import { getExtensionPageUrl } from "./registries/page-registry";
import { RouteHandler } from "../common/protocol-handler";
import { LensProtocolRouterMain } from "../main/protocol-handler";

export class LensMainExtension extends LensExtension {
  appMenus: MenuRegistration[] = [];

  async navigate<P extends object>(pageId?: string, params?: P, frameId?: number) {
    const windowManager = WindowManager.getInstance<WindowManager>();
    const pageUrl = getExtensionPageUrl({
      extensionId: this.name,
      pageId,
      params: params ?? {}, // compile to url with params
    });

    await windowManager.navigate(pageUrl, frameId);
  }

  /**
   * Registers a handler to be called when a `lens://` link is called.
   * @param pathSchema The path schema for the route.
   * @param handler The function to call when this route has been matched
   */
  onProtocolRequest(pathSchema: string, handler: RouteHandler): void {
    const lprm = LensProtocolRouterMain.getInstance<LensProtocolRouterMain>();

    lprm.extensionOn(this.name, pathSchema, handler);
  }
}
