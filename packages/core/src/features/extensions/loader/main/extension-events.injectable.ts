/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";

export interface ExtensionEvents {
  "bundled-loaded": () => void;
}

const extensionEventsInjectable = getInjectable({
  id: "extension-events",
  instantiate: () => new EventEmitter() as TypedEventEmitter<ExtensionEvents>,
});

export default extensionEventsInjectable;
