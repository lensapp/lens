import type { AppPreferenceRegistration, ClusterFeatureRegistration, ClusterPageMenuRegistration, KubeObjectDetailRegistration, KubeObjectMenuRegistration, KubeObjectStatusRegistration, PageMenuRegistration, PageRegistration, StatusBarRegistration, } from "./registries";
import type { Cluster } from "../main/cluster";
import { LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";
import { CommandRegistration } from "./registries/command-registry";
import { RouteHandler } from "../common/protocol-handler";
import { LensProtocolRouterRenderer } from "../renderer/protocol-handler/router";

export class LensRendererExtension extends LensExtension {
  globalPages: PageRegistration[] = [];
  clusterPages: PageRegistration[] = [];
  globalPageMenus: PageMenuRegistration[] = [];
  clusterPageMenus: ClusterPageMenuRegistration[] = [];
  kubeObjectStatusTexts: KubeObjectStatusRegistration[] = [];
  appPreferences: AppPreferenceRegistration[] = [];
  clusterFeatures: ClusterFeatureRegistration[] = [];
  statusBarItems: StatusBarRegistration[] = [];
  kubeObjectDetailItems: KubeObjectDetailRegistration[] = [];
  kubeObjectMenuItems: KubeObjectMenuRegistration[] = [];
  commands: CommandRegistration[] = [];

  async navigate<P extends object>(pageId?: string, params?: P) {
    const { navigate } = await import("../renderer/navigation");
    const pageUrl = getExtensionPageUrl({
      extensionId: this.name,
      pageId,
      params: params ?? {}, // compile to url with params
    });

    navigate(pageUrl);
  }

  async disable() {
    const lprm = LensProtocolRouterRenderer.getInstance<LensProtocolRouterRenderer>();

    lprm.removeExtensionHandlers(this.name);

    return super.disable();
  }

  /**
   * Defines if extension is enabled for a given cluster. Defaults to `true`.
   */
  async isEnabledForCluster(cluster: Cluster): Promise<Boolean> {
    return (void cluster) || true;
  }

  /**
   * Registers a handler to be called when a `lens://` link is called.
   *
   * See https://www.npmjs.com/package/path-to-regexp. To use this the link
   * `lens://extensions/<org-id>/<extension-name>/your/defined/path?with=query`
   * or `lens://extensions/<extension-name>/your/defined/path?with=query`
   * (if this extension is not packaged behind an organization) needs to be
   * opened.
   * @param pathSchema The path schema for the route.
   * @param handler The function to call when this route has been matched
   */
  onProtocolRequest(pathSchema: string, handler: RouteHandler): void {
    const lprm = LensProtocolRouterRenderer.getInstance<LensProtocolRouterRenderer>();

    lprm.extensionOn(this.name, pathSchema, handler);
  }
}
