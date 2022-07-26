/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import appVersionInjectable from "./app-version.injectable";

const appSemanticVersionInjectable = getInjectable({
  id: "app-semantic-version",
  instantiate: (di) => new SemVer(di.inject(appVersionInjectable)),
});

export default appSemanticVersionInjectable;
