/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import loggerInjectable from "../../common/logger.injectable";
import hostedClusterIdInjectable from "../cluster-frame-context/hosted-cluster-id.injectable";
import type { TerminalApiDependencies, TerminalApiQuery } from "./terminal-api";
import { TerminalApi } from "./terminal-api";

export type CreateTerminalApi = (query: TerminalApiQuery) => TerminalApi;

const createTerminalApiInjectable = getInjectable({
  id: "create-terminal-api",
  instantiate: (di): CreateTerminalApi => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const deps: Omit<TerminalApiDependencies, "hostedClusterId"> = {
      logger: di.inject(loggerInjectable),
    };

    return (query) => {
      assert(hostedClusterId, "Can only create terminal APIs within a cluster frame");

      return new TerminalApi({
        hostedClusterId,
        ...deps,
      }, query);
    };
  },
});

export default createTerminalApiInjectable;
