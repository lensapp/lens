import { bundledExtensionInjectionToken } from "@k8slens/legacy-extensions";
import { getInjectable } from "@ogre-tools/injectable";
import exampleBundledExtensionManifest from "@k8slens/legacy-extension-example/package.json";

const exampleBundledExtensionInjectable = getInjectable({
  id: "example-bundled-extension",
  instantiate: (di) => ({
    manifest: exampleBundledExtensionManifest,
    main: () => require("@k8slens/legacy-extension-example/main").default,
    renderer: () => require("@k8slens/legacy-extension-example/renderer").default,
  }),
  injectionToken: bundledExtensionInjectionToken,
});

export default exampleBundledExtensionInjectable;
