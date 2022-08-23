/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appSemanticVersionInjectable from "../../../common/vars/app-semantic-version.injectable";
import { isCompatibleBundledExtension } from "./is-compatible-bundled-extension";

const isCompatibleBundledExtensionInjectable = getInjectable({
  id: "is-compatible-bundled-extension",
  instantiate: (di) => isCompatibleBundledExtension({
    appSemVer: di.inject(appSemanticVersionInjectable),
  }),
});

export default isCompatibleBundledExtensionInjectable;
