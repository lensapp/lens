/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import hostedClusterIdInjectable from "../../common/cluster-store/hosted-cluster-id.injectable";
import type { TerminalApiDependencies, TerminalApiQuery } from "./terminal-api";
import { TerminalApi } from "./terminal-api";

export type CreateTerminalApi = (query: TerminalApiQuery) => TerminalApi;

const createTerminalApiInjectable = getInjectable({
  id: "create-terminal-api",
  instantiate: (di): CreateTerminalApi => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);

    assert(hostedClusterId, "Can only create terminal APIs within a cluster frame");

    const dependencies: TerminalApiDependencies = {
      hostedClusterId,
    };

    return (query) => new TerminalApi(dependencies, query);
  },
});

export default createTerminalApiInjectable;
