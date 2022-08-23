/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appSemanticVersionInjectable from "../../../common/vars/app-semantic-version.injectable";
import { isCompatibleExtension } from "./is-compatible-extension";

const isCompatibleExtensionInjectable = getInjectable({
  id: "is-compatible-extension",
  instantiate: (di) => isCompatibleExtension({
    appSemVer: di.inject(appSemanticVersionInjectable),
  }),
});

export default isCompatibleExtensionInjectable;
