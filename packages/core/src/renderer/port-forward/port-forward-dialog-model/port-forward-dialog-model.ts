/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { noop } from "lodash/fp";
import { action, observable } from "mobx";
import type { ForwardedPort } from "../port-forward-item";

export interface PortForwardDialogOpenOptions {
  openInBrowser: boolean;
  onClose: () => void;
}

export interface PortForwardDialogData {
  portForward: ForwardedPort;
  useHttps: boolean;
  openInBrowser: boolean;
  onClose: () => void;
}

export class PortForwardDialogModel {
  readonly data = observable.box<PortForwardDialogData | undefined>();

  open = action((portForward: ForwardedPort, options?: PortForwardDialogOpenOptions) => {
    this.data.set({
      onClose: options?.onClose ?? noop,
      openInBrowser: options?.openInBrowser ?? false,
      portForward,
      useHttps: portForward.protocol === "https",
    });
  });

  close = action(() => {
    this.data.set(undefined);
  });
}
