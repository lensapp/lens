/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import hotbarManagerInjectable from "../../../common/hotbar-store.injectable";
import { HotbarSwitchCommand } from "../hotbar/hotbar-switch-command";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";

interface Dependencies {
  openCommandOverlay: (component: React.ReactElement) => void;
  activeHotbarName: () => string | undefined;
}

const NonInjectedActiveHotbarName = observer(({ openCommandOverlay, activeHotbarName }: Dependencies) => (
  <div
    className="flex items-center"
    data-testid="current-hotbar-name"
    onClick={() => openCommandOverlay(<HotbarSwitchCommand />)}
  >
    <Icon material="bookmarks" className="mr-2" size={14} />
    {activeHotbarName()}
  </div>
));

export const ActiveHotbarName = withInjectables<Dependencies>(NonInjectedActiveHotbarName, {
  getProps: (di, props) => ({
    activeHotbarName: () => di.inject(hotbarManagerInjectable).getActive()?.name,
    openCommandOverlay: di.inject(commandOverlayInjectable).open,
    ...props,
  }),
});
