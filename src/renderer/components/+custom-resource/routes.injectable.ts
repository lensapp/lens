/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { crdURL, crdDefinitionsRoute } from "../../../common/routes";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { CustomResourcesLayout } from "./layout";

const customResourceRoutesInjectable = getInjectable({
  instantiate: () => computed(() => [
    {
      title: "Definitions",
      component: CustomResourcesLayout,
      url: crdURL(),
      routePath: String(crdDefinitionsRoute.path),
    },
  ] as TabLayoutRoute[]),
  lifecycle: lifecycleEnum.singleton,
});

export default customResourceRoutesInjectable;
