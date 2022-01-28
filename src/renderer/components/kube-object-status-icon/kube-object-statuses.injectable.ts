/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import type { KubeObjectStatusRegistration, RegisteredKubeObjectStatus } from "./kube-object-status";

const kubeObjectStatusesInjectable = getInjectable({
  instantiate: (di) => (
    computed(() => (
      di.inject(rendererExtensionsInjectable)
        .get()
        .flatMap(ext => ext.kubeObjectStatusTexts)
        .map(({ apiVersions, ...rest }: KubeObjectStatusRegistration): RegisteredKubeObjectStatus => ({
          apiVersions: new Set(apiVersions),
          ...rest,
        }))
    ))
  ),
  lifecycle: lifecycleEnum.singleton,
});

export default kubeObjectStatusesInjectable;
