/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import hostedClusterIdInjectable from "../cluster-frame-context/hosted-cluster-id.injectable";
import getShellAuthTokenInjectable from "../../common/shell-authentication/get-auth-token.injectable";
import type { TerminalApiQuery } from "./terminal-api";
import { TerminalApi } from "./terminal-api";
import createWebsocketInjectable from "./create-websocket.injectable";
import defaultWebsocketParamsInjectable from "./default-websocket-params.injectable";

export type CreateTerminalApi = (query: TerminalApiQuery) => TerminalApi;

const createTerminalApiInjectable = getInjectable({
  id: "create-terminal-api",
  instantiate: (di): CreateTerminalApi => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const getShellAuthToken = di.inject(getShellAuthTokenInjectable);
    const createWebsocket = di.inject(createWebsocketInjectable);
    const defaultParams = di.inject(defaultWebsocketParamsInjectable);

    return (query) => {
      assert(hostedClusterId, "Can only create terminal APIs within a cluster frame");

      return new TerminalApi({
        hostedClusterId,
        getShellAuthToken,
        createWebsocket,
        defaultParams,
      }, query);
    };
  },
});

export default createTerminalApiInjectable;
