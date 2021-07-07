/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import removeDirInjectable from "../../../common/fs/remove.injectable";
import tempDirInjectable from "../../../common/fs/temp-dir.injectable";
import tempFileInjectable from "../../../common/fs/temp-file.injectable";
import unlinkInjectable from "../../../common/fs/unlink.injectable";
import writeFileInjectable from "../../../common/fs/write-file.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import execFileInjectable from "../../child-process/exec-file.injectable";
import type { K8sResourceApplier, ResourceApplierDependencies } from "./applier";
import { ResourceApplier } from "./applier";

export type CreateK8sResourceApplier = (cluster: Cluster) => K8sResourceApplier;

const createK8sResourceApplierInjectable = getInjectable({
  id: "create-k8s-resource-applier",
  instantiate: (di): CreateK8sResourceApplier => {
    const deps: ResourceApplierDependencies = {
      execFile: di.inject(execFileInjectable),
      removeDir: di.inject(removeDirInjectable),
      unlink: di.inject(unlinkInjectable),
      writeFile: di.inject(writeFileInjectable),
      logger: di.inject(loggerInjectable),
      tempDir: di.inject(tempDirInjectable),
      tempFile: di.inject(tempFileInjectable),
    };

    return (cluster) => new ResourceApplier(deps, cluster);
  },
});

export default createK8sResourceApplierInjectable;
