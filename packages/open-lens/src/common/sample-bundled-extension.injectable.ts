import { getInjectable } from "@ogre-tools/injectable";
import { bundledExtensionInjectionToken } from "@k8slens/core/common";
import manifest from "@k8slens/sample-extension/package.json";

const sampleBundledExtensionInjectable = getInjectable({
  id: "sample-bundled-extension",
  instantiate: () => ({
    manifest,
    main: async () => (await import("@k8slens/sample-extension/main")).default,
    renderer: async () => (await import("@k8slens/sample-extension/renderer")).default,
  }),
  injectionToken: bundledExtensionInjectionToken,
});

export default sampleBundledExtensionInjectable;
