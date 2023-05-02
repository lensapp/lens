/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../common/helm/helm-repo";
import { HelmChartManager } from "./helm-chart-manager";
import helmChartManagerCacheInjectable from "./helm-chart-manager-cache.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";
import readFileInjectable from "../../common/fs/read-file.injectable";
import statInjectable from "../../common/fs/stat.injectable";

const helmChartManagerInjectable = getInjectable({
  id: "helm-chart-manager",

  instantiate: (di, repo: HelmRepo) => new HelmChartManager({
    cache: di.inject(helmChartManagerCacheInjectable),
    logger: di.inject(loggerInjectionToken),
    execHelm: di.inject(execHelmInjectable),
    readFile: di.inject(readFileInjectable),
    stat: di.inject(statInjectable),
  }, repo),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, repo: HelmRepo) => repo.name,
  }),
});

export default helmChartManagerInjectable;
