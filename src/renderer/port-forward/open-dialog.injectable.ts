/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind, noop } from "../utils";
import type { PortForwardDialogState } from "./dialog.state.injectable";
import portForwardDialogStateInjectable from "./dialog.state.injectable";
import type { ForwardedPort } from "./port-forward";

interface Dependencies {
  state: PortForwardDialogState;
}

export interface PortForwardDialogOpenOptions {
  openInBrowser: boolean;
  onClose: () => void;
}

function openPortForwardDialog({ state }: Dependencies, portForward: ForwardedPort, options: PortForwardDialogOpenOptions = { openInBrowser: false, onClose: noop }) {
  runInAction(() => {
    state.isOpen = true;
    state.portForward = portForward;
    state.useHttps = portForward.protocol === "https";
    state.openInBrowser = options.openInBrowser;
    state.onClose = options.onClose;
  });
}

const openPortForwardDialogInjectable = getInjectable({
  instantiate: (di) => bind(openPortForwardDialog, null, {
    state: di.inject(portForwardDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openPortForwardDialogInjectable;
