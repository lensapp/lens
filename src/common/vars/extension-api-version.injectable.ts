/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import applicationInformationInjectable from "./application-information.injectable";

const extensionApiVersionInjectable = getInjectable({
  id: "extension-api-version",
  instantiate: (di) => {
    const { major, minor, patch } = new SemVer(di.inject(applicationInformationInjectable).version);

    return `${major}.${minor}.${patch}`;
  },
});

export default extensionApiVersionInjectable;
