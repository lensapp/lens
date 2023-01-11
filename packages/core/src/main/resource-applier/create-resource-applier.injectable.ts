/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import removePathInjectable from "../../common/fs/remove.injectable";
import execFileInjectable from "../../common/fs/exec-file.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";
import loggerInjectable from "../../common/logger.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import type { ResourceApplierDependencies } from "./resource-applier";
import { ResourceApplier } from "./resource-applier";

export type CreateResourceApplier = (cluster: Cluster) => ResourceApplier;

const createResourceApplierInjectable = getInjectable({
  id: "create-resource-applier",
  instantiate: (di): CreateResourceApplier => {
    const deps: ResourceApplierDependencies = {
      deleteFile: di.inject(removePathInjectable),
      emitAppEvent: di.inject(emitAppEventInjectable),
      execFile: di.inject(execFileInjectable),
      joinPaths: di.inject(joinPathsInjectable),
      logger: di.inject(loggerInjectable),
      writeFile: di.inject(writeFileInjectable),
    };

    return (cluster) => new ResourceApplier(deps, cluster);
  },
});

export default createResourceApplierInjectable;
