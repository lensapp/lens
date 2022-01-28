/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { KubeObjectStatus } from "../../../extensions/renderer-api/kube-object-status";
import { bind } from "../../utils";
import type { RegisteredKubeObjectStatus } from "./kube-object-status";
import kubeObjectStatusesInjectable from "./kube-object-statuses.injectable";

interface Dependencies {
  statuses: IComputedValue<RegisteredKubeObjectStatus[]>;
}

function getStatusItemsForKubeObject({ statuses }: Dependencies, src: KubeObject): KubeObjectStatus[] {
  const res: KubeObjectStatus[] = [];

  for (const registration of statuses.get()) {
    if (registration.kind === src.kind && registration.apiVersions.has(src.apiVersion)) {
      const resolved = registration.resolve(src);

      if (resolved) {
        res.push(resolved);
      }
    }
  }

  return res;
}

const getStatusItemsForKubeObjectInjectable = getInjectable({
  instantiate: (di) => bind(getStatusItemsForKubeObject, null, {
    statuses: di.inject(kubeObjectStatusesInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getStatusItemsForKubeObjectInjectable;
