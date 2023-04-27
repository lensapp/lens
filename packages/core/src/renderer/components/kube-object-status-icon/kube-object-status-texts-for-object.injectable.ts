/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import kubeObjectStatusTextsInjectable from "./kube-object-status-texts.injectable";
import type { KubeObject } from "@k8slens/kube-object";
import { conforms, eq, includes } from "lodash/fp";
import { computed } from "mobx";

const kubeObjectStatusTextsForObjectInjectable = getInjectable({
  id: "kube-object-status-texts-for-object",

  instantiate: (di, kubeObject: KubeObject) => {
    const allStatusTexts = di.inject(kubeObjectStatusTextsInjectable);

    return computed(() =>
      allStatusTexts
        .get()
        .filter(toKubeObjectRelated(kubeObject)),
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, kubeObject: KubeObject) => kubeObject.getId(),
  }),
});

const toKubeObjectRelated = (kubeObject: KubeObject) =>
  conforms({
    kind: eq(kubeObject.kind),
    apiVersions: includes(kubeObject.apiVersion),
  });

export default kubeObjectStatusTextsForObjectInjectable;
