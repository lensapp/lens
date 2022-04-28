/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster/types";
import shellRequestAuthenticatorInjectable from "./authenticator.injectable";

export type AuthenticateShellApiRequest = (clusterId: ClusterId, tabId: string, token: string) => boolean;

const authenticateShellApiRequestInjectable = getInjectable({
  id: "authenticateShellApiRequest",
  instantiate: (di): AuthenticateShellApiRequest => {
    const authenticator = di.inject(shellRequestAuthenticatorInjectable);

    return (clusterId, tabId, token) => authenticator.authenticate(clusterId, tabId, token);
  },
});

export default authenticateShellApiRequestInjectable;
