/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import shellRequestAuthenticatorInjectable from "./shell-request-authenticator.injectable";

const shellApiRequestHandlerInjectable = getInjectable({
  instantiate: (di) => di.inject(shellRequestAuthenticatorInjectable).shellApiRequest,
  lifecycle: lifecycleEnum.singleton,
});

export default shellApiRequestHandlerInjectable;
