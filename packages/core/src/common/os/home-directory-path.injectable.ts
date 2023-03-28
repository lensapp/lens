/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userInfoInjectable from "../vars/user-info.injectable";

const homeDirectoryPathInjectable = getInjectable({
  id: "home-directory-path",
  instantiate: (di) => di.inject(userInfoInjectable).homedir,
});

export default homeDirectoryPathInjectable;
