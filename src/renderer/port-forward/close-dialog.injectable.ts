/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../utils";
import type { PortForwardDialogState } from "./dialog.state.injectable";
import portForwardDialogStateInjectable from "./dialog.state.injectable";

interface Dependencies {
  state: PortForwardDialogState;
}

function closePortForwardDialog({ state }: Dependencies) {
  state.isOpen = false;
}

const closePortForwardDialogInjectable = getInjectable({
  instantiate: (di) => bind(closePortForwardDialog, null, {
    state: di.inject(portForwardDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closePortForwardDialogInjectable;
