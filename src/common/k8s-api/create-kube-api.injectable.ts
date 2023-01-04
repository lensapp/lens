/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../logger.injectable";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "./kube-api";
import maybeKubeApiInjectable from "./maybe-kube-api.injectable";

export interface CreateKubeApi {
  <Api>(ctor: new (deps: KubeApiDependencies, opts: DerivedKubeApiOptions) => Api, opts?: DerivedKubeApiOptions): Api;
}

const createKubeApiInjectable = getInjectable({
  id: "create-kube-api",
  instantiate: (di): CreateKubeApi => {
    const deps: KubeApiDependencies = {
      logger: di.inject(loggerInjectable),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    };

    return (ctor, opts) => new ctor(deps, opts ?? {});
  },
});

export default createKubeApiInjectable;
