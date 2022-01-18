/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import React from "react";

export class CommandOverlay {
  #component = observable.box<React.ReactElement | null>(null, { deep: false });

  get isOpen(): boolean {
    return Boolean(this.#component.get());
  }

  open = (component: React.ReactElement) => {
    if (!React.isValidElement(component)) {
      throw new TypeError("CommandOverlay.open must be passed a valid ReactElement");
    }

    this.#component.set(component);
  };

  close = () => {
    this.#component.set(null);
  };

  get component(): React.ReactElement | null {
    return this.#component.get();
  }
}

const commandOverlayInjectable = getInjectable({
  instantiate: () => new CommandOverlay(),
  lifecycle: lifecycleEnum.singleton,
});

export default commandOverlayInjectable;
