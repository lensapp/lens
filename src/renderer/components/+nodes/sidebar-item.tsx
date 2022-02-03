/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import { nodesRoute, nodesURL } from "../../../common/routes";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";

export interface NodeSidebarItemProps {}

interface Dependencies {
  isAllowedResource: IsAllowedResource;
}

const NonInjectedNodeSidebarItem = observer(({ isAllowedResource }: Dependencies & NodeSidebarItemProps) => (
  <SidebarItem
    id="nodes"
    text="Nodes"
    isActive={isActiveRoute(nodesRoute)}
    isHidden={!isAllowedResource("nodes")}
    url={nodesURL()}
    icon={<Icon svg="nodes"/>}
  />
));

export const NodesSidebarItem = withInjectables<Dependencies, NodeSidebarItemProps>(NonInjectedNodeSidebarItem, {
  getProps: (di, props) => ({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
    ...props,
  }),
});
