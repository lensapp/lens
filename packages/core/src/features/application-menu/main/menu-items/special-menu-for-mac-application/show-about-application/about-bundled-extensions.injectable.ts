/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { bundledExtensionInjectionToken } from "../../../../../../common/library";
import buildSemanticVersionInjectable from "../../../../../../common/vars/build-semantic-version.injectable";

const aboutBundledExtensionsInjectable = getInjectable({
  id: "about-bundled-extensions",
  instantiate: (di) => {
    const buildSemanticVersion = di.inject(buildSemanticVersionInjectable);
    const bundledExtensions = di.injectMany(bundledExtensionInjectionToken);

    if (buildSemanticVersion.get().prerelease[0] === "latest") {
      return [];
    }

    return bundledExtensions.map(ext => `${ext.manifest.name}: ${ext.manifest.version}`);
  },
});

export default aboutBundledExtensionsInjectable;
