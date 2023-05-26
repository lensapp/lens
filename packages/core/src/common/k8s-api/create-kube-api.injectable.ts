/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { logErrorInjectionToken, logInfoInjectionToken, logWarningInjectionToken } from "@k8slens/logger";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "@k8slens/kube-api";
import { maybeKubeApiInjectable } from "@k8slens/kube-api-specifics";

export interface CreateKubeApi {
  <Api>(ctor: new (deps: KubeApiDependencies, opts: DerivedKubeApiOptions) => Api, opts?: DerivedKubeApiOptions): Api;
}

const createKubeApiInjectable = getInjectable({
  id: "create-kube-api",
  instantiate: (di): CreateKubeApi => {
    const deps: KubeApiDependencies = {
      logError: di.inject(logErrorInjectionToken),
      logInfo: di.inject(logInfoInjectionToken),
      logWarn: di.inject(logWarningInjectionToken),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    };

    return (ctor, opts) => new ctor(deps, opts ?? {});
  },
});

export default createKubeApiInjectable;
