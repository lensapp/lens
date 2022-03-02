/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import { namespacesRoute, namespacesURL } from "../../../common/routes";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";

export interface NamespacesSidebarItemProps {}

interface Dependencies {
  isAllowedResource: IsAllowedResource;
}

const NonInjectedNamespacesSidebarItem = observer(({ isAllowedResource }: Dependencies & NamespacesSidebarItemProps) => (
  <SidebarItem
    id="namespaces"
    text="Namespaces"
    isActive={isActiveRoute(namespacesRoute)}
    isHidden={!isAllowedResource("namespaces")}
    url={namespacesURL()}
    icon={<Icon material="layers"/>}
  />
));

export const NamespacesSidebarItem = withInjectables<Dependencies, NamespacesSidebarItemProps>(NonInjectedNamespacesSidebarItem, {
  getProps: (di, props) => ({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
    ...props,
  }),
});
