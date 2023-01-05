/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shellApiRequest } from "./shell-api-request";
import shellRequestAuthenticatorInjectable from "./shell-request-authenticator/shell-request-authenticator.injectable";
import clusterManagerInjectable from "../../../cluster/manager.injectable";
import openShellSessionInjectable from "../../../shell-session/create-shell-session.injectable";

const shellApiRequestInjectable = getInjectable({
  id: "shell-api-request",

  instantiate: (di) => shellApiRequest({
    openShellSession: di.inject(openShellSessionInjectable),
    authenticateRequest: di.inject(shellRequestAuthenticatorInjectable).authenticate,
    clusterManager: di.inject(clusterManagerInjectable),
  }),
});

export default shellApiRequestInjectable;
