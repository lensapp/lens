/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import React from "react";
import { getPreferencePage } from "../../get-preference-page";

const kubernetesPreferencePageInjectable = getInjectable({
  id: "kubernetes-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "kubernetes-page",
    parentId: "kubernetes-tab",
    orderNumber: 0,
    Component: getPreferencePage("Kubernetes"),
    childrenSeparator: () => <hr />,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubernetesPreferencePageInjectable;
