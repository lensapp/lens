/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import statusRegistrationsInjectable from "./status-registrations.injectable";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { conforms, eq, includes } from "lodash/fp";
import type { KubeObjectStatusRegistration } from "./kube-object-status-registration";

const statusesForKubeObjectInjectable = getInjectable({
  id: "statuses-for-kube-object",

  instantiate: (di, kubeObject: KubeObject) =>
    di
      .inject(statusRegistrationsInjectable)
      .get()
      .filter(toKubeObjectRelated(kubeObject))
      .map(toStatus(kubeObject))
      .filter(Boolean),

  lifecycle: lifecycleEnum.transient,
});

const toKubeObjectRelated = (kubeObject: KubeObject) =>
  conforms({
    kind: eq(kubeObject.kind),
    apiVersions: includes(kubeObject.apiVersion),
  });

const toStatus =
  (kubeObject: KubeObject) => (item: KubeObjectStatusRegistration) =>
    item.resolve(kubeObject);

export default statusesForKubeObjectInjectable;
