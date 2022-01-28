/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import { noop } from "../utils";
import type { ForwardedPort } from "./port-forward";

export interface PortForwardDialogState {
  isOpen: boolean;
  portForward: ForwardedPort | null;
  useHttps: boolean;
  openInBrowser: boolean;
  onClose: () => void;
}

const portForwardDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<PortForwardDialogState>({
    isOpen: false,
    portForward: null,
    useHttps: false,
    openInBrowser: false,
    onClose: noop,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default portForwardDialogStateInjectable;
