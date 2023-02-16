/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { unmountComponentAtNode } from "react-dom";
import rootElementInjectable from "./root-element.injectable";

export type UnmountRootComponent = () => void;

const unmountRootComponentInjectable = getInjectable({
  id: "unmount-root-component",
  instantiate: (di): UnmountRootComponent => {
    const rootElement = di.inject(rootElementInjectable);

    assert(rootElement, "#app MUST exist");

    return () => unmountComponentAtNode(rootElement);
  },
  causesSideEffects: true,
});

export default unmountRootComponentInjectable;
