/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import loggerInjectable from "../../common/logger.injectable";
import requestShellApiTokenInjectable from "../../features/terminal/renderer/request-shell-api-token.injectable";
import hostedClusterIdInjectable from "../cluster-frame-context/hosted-cluster-id.injectable";
import currentLocationInjectable from "./current-location.injectable";
import defaultWebsocketApiParamsInjectable from "./default-websocket-api-params.injectable";
import type { TerminalApiDependencies, TerminalApiQuery } from "./terminal-api";
import { TerminalApi } from "./terminal-api";
import websocketAgentInjectable from "./websocket-agent.injectable";

export type CreateTerminalApi = (query: TerminalApiQuery) => TerminalApi;

const createTerminalApiInjectable = getInjectable({
  id: "create-terminal-api",
  instantiate: (di): CreateTerminalApi => {
    const partialDeps: Omit<TerminalApiDependencies, "hostedClusterId"> = {
      requestShellApiToken: di.inject(requestShellApiTokenInjectable),
      defaultParams: di.inject(defaultWebsocketApiParamsInjectable),
      logger: di.inject(loggerInjectable),
      currentLocation: di.inject(currentLocationInjectable),
      websocketAgent: di.inject(websocketAgentInjectable),
    };

    return (query) => {
      const hostedClusterId = di.inject(hostedClusterIdInjectable);

      assert(hostedClusterId, "Can only create Terminal APIs within cluster frames");

      return new TerminalApi({
        ...partialDeps,
        hostedClusterId,
      }, query);
    };
  },
});

export default createTerminalApiInjectable;
