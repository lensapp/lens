/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs.injectable";
import kubeconfigSyncEntriesInjectable from "../../../common/user-preferences/kubeconfig-sync-entries.injectable";
import addComputedEntitySourceInjectable from "../../catalog/add-computed-entity-source.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";
import { KubeconfigSyncManager } from "./manager";
import watchFileChangesInjectable from "./watch-file-changes.injectable";

const kubeconfigSyncManagerInjectable = getInjectable({
  instantiate: (di) => new KubeconfigSyncManager({
    addComputedEntitySource: di.inject(addComputedEntitySourceInjectable),
    directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
    kubeconfigSyncEntries: di.inject(kubeconfigSyncEntriesInjectable),
    watchFileChanges: di.inject(watchFileChangesInjectable),
    logger: di.inject(kubeconfigSyncLoggerInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default kubeconfigSyncManagerInjectable;
