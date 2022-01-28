/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import getClusterForRequestInjectable from "../../cluster-manager/get-cluster-for-request.injectable";
import createShellSessionInjectable from "../../shell-sessions/create-shell-session.injectable";
import { ShellRequestAuthenticator } from "./shell-request-authenticator";

const shellRequestAuthenticatorInjectable = getInjectable({
  instantiate: (di) => new ShellRequestAuthenticator({
    getClusterForRequest: di.inject(getClusterForRequestInjectable),
    createShellSession: di.inject(createShellSessionInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default shellRequestAuthenticatorInjectable;
