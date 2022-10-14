/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import requestShellApiTokenInjectable from "../../features/terminal/renderer/request-shell-api-token.injectable";
import currentLocationInjectable from "./current-location.injectable";
import defaultWebsocketApiParamsInjectable from "./default-websocket-params.injectable";
import type { TerminalApiDependencies, TerminalApiQuery } from "./terminal-api";
import { TerminalApi } from "./terminal-api";

export type CreateTerminalApi = (query: TerminalApiQuery) => TerminalApi;

const createTerminalApiInjectable = getInjectable({
  id: "create-terminal-api",
  instantiate: (di): CreateTerminalApi => {
    const deps: TerminalApiDependencies = {
      requestShellApiToken: di.inject(requestShellApiTokenInjectable),
      defaultParams: di.inject(defaultWebsocketApiParamsInjectable),
      logger: di.inject(loggerInjectable),
      currentLocation: di.inject(currentLocationInjectable),
    };

    return (query) => new TerminalApi(deps, query);
  },
});

export default createTerminalApiInjectable;
