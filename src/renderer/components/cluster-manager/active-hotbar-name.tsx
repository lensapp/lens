/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
