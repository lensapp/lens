import { getInjectable } from "@ogre-tools/injectable";
import { extensionRegistratorInjectionToken } from "../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";

const clusterModalsRegistratorInjectable = getInjectable({
  id: "cluster-modals-registrator",

  instantiate: (): ExtensionRegistrator => {
    return (ext) => {
      const extension = ext as LensRendererExtension;

      return extension.clusterModals.map((registration) => {
        return {
          id: registration.id,
          Component: registration.component,
          visible: registration.visible,
        }
      })
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default clusterModalsRegistratorInjectable;