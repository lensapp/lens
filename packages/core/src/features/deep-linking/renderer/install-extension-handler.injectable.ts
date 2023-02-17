/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToExtensionsInjectable from "../../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import { extensionUrlDeepLinkingSchema, EXTENSION_NAME_MATCH, EXTENSION_PUBLISHER_MATCH } from "../../../common/protocol-handler";
import attemptInstallByInfoInjectable from "../../../renderer/components/+extensions/attempt-install-by-info.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const installExtensionDeepLinkingHandlerInjectable = getInjectable({
  id: "install-extension-deep-linking-handler",
  instantiate: (di) => {
    const navigateToExtensions = di.inject(navigateToExtensionsInjectable);
    const attemptInstallByInfo = di.inject(attemptInstallByInfoInjectable);

    return {
      path: `/extensions/install${extensionUrlDeepLinkingSchema}`,
      handler: ({ pathname, search: { version }}) => {
        const name = [
          pathname[EXTENSION_PUBLISHER_MATCH],
          pathname[EXTENSION_NAME_MATCH],
        ]
          .filter(Boolean)
          .join("/");

        navigateToExtensions();
        attemptInstallByInfo({ name, version, requireConfirmation: true });
      },
    };
  },
  injectionToken: internalDeepLinkingRouteInjectionToken,
});

export default installExtensionDeepLinkingHandlerInjectable;
