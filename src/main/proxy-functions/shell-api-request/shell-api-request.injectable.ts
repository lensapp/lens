/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { shellApiRequest } from "./shell-api-request";
import createShellSessionInjectable from "../../shell-session/create-shell-session.injectable";
import shellRequestAuthenticatorInjectable
  from "./shell-request-authenticator/shell-request-authenticator.injectable";

const shellApiRequestInjectable = getInjectable({
  instantiate: (di) => shellApiRequest({
    createShellSession: di.inject(createShellSessionInjectable),
    authenticateRequest: di.inject(shellRequestAuthenticatorInjectable).authenticate,
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default shellApiRequestInjectable;
