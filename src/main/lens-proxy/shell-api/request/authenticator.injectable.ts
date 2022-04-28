/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ShellRequestAuthenticator } from "./authenticator";

const shellRequestAuthenticatorInjectable = getInjectable({
  id: "shell-request-authenticator",

  instantiate: () => {
    const authenticator = new ShellRequestAuthenticator();

    authenticator.init();

    return authenticator;
  },
});

export default shellRequestAuthenticatorInjectable;
