/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { noop } from "lodash/fp";
import { action, computed, observable, makeObservable } from "mobx";
import type { ForwardedPort } from "../port-forward-item";

interface PortForwardDialogOpenOptions {
  openInBrowser: boolean;
  onClose: () => void;
}

export class PortForwardDialogModel {
  portForward: ForwardedPort = null;
  useHttps = false;
  openInBrowser = false;
  onClose = noop;

  constructor() {
    makeObservable(this, {
      isOpen: computed,
      portForward: observable,
      useHttps: observable,
      openInBrowser: observable,

      open: action,
      close: action,
    });
  }

  get isOpen() {
    return !!this.portForward;
  }

  open = (portForward: ForwardedPort, options: PortForwardDialogOpenOptions = { openInBrowser: false, onClose: noop }) => {
    this.portForward = portForward;
    this.useHttps = portForward.protocol === "https";
    this.openInBrowser = options.openInBrowser;
    this.onClose = options.onClose;
  };

  close = () => {
    this.portForward = null;
    this.useHttps = false;
    this.openInBrowser = false;
  };
}
