/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import { kubeObjectStatusTextInjectionToken } from "./kube-object-status-text-injection-token";

const kubeObjectStatusTextsInjectable = getInjectable({
  id: "kube-object-status-texts",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const statusTexts = computedInjectMany(kubeObjectStatusTextInjectionToken);

    return computed(() =>
      statusTexts.get().filter((statusText) => statusText.enabled.get()),
    );
  },
});

export default kubeObjectStatusTextsInjectable;
