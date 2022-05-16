/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import shellRequestAuthenticatorInjectable from "./request-authenticator.injectable";

const authenticateRequestInjectable = getInjectable({
  id: "authenticate-request",
  instantiate: (di) => di.inject(shellRequestAuthenticatorInjectable).authenticate,
});

export default authenticateRequestInjectable;
