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
