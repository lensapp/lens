/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IngressClass } from "../../../common/k8s-api/endpoints/ingress-class.api";

export const ingressClassSetDefaultInjectable = getInjectable({
  id: "ingressClassSetDefaultInjectable",

  instantiate() {
    return (item: IngressClass) => {
      console.log(`TODO: implement set-default ingress-class api call(s)`, item);
    };
  },

  lifecycle: lifecycleEnum.singleton,
});
