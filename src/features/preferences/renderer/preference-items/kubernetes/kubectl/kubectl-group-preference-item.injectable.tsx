/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import Gutter from "../../../../../../renderer/components/gutter/gutter";
import React from "react";
import type { PreferenceItemTypes } from "@lensapp/preferences";
import { preferenceItemInjectionToken } from "@lensapp/preferences";

const PreferenceItemGroup = ({
  children,
  item,
}: {
  children: React.ReactElement;
  item: PreferenceItemTypes;
}) => <section id={item.id}>{children}</section>;

const kubectlGroupPreferenceItemInjectable = getInjectable({
  id: "kubectl-group-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "kubectl",
    parentId: "kubernetes-page",
    orderNumber: 10,
    Component: PreferenceItemGroup,
    childSeparator: () => <Gutter size="xl" />,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubectlGroupPreferenceItemInjectable;
