/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import { eventRoute, eventsURL } from "../../../common/routes";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";

export interface EventsSidebarItemProps {}

interface Dependencies {
  isAllowedResource: IsAllowedResource;
}

const NonInjectedEventsSidebarItem = observer(({ isAllowedResource }: Dependencies & EventsSidebarItemProps) => (
  <SidebarItem
    id="events"
    text="Events"
    isActive={isActiveRoute(eventRoute)}
    isHidden={!isAllowedResource("events")}
    url={eventsURL()}
    icon={<Icon material="access_time"/>}
  />
));

export const EventsSidebarItem = withInjectables<Dependencies, EventsSidebarItemProps>(NonInjectedEventsSidebarItem, {
  getProps: (di, props) => ({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
    ...props,
  }),
});
