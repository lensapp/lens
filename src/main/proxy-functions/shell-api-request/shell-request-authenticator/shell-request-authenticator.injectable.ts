/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ShellRequestAuthenticator } from "./shell-request-authenticator";

const shellRequestAuthenticatorInjectable = getInjectable({
  instantiate: () => {
    const authenticator = new ShellRequestAuthenticator();

    authenticator.init();

    return authenticator;
  },

  lifecycle: lifecycleEnum.singleton,
});

export default shellRequestAuthenticatorInjectable;
