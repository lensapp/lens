/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clipboard } from "electron";

export type WriteTextToClipboard = (contents: string) => void;

const writeTextToClipboardInjectable = getInjectable({
  id: "write-text-to-clipboard",
  instantiate: (): WriteTextToClipboard => contents => clipboard.writeText(contents),
  causesSideEffects: true,
});

export default writeTextToClipboardInjectable;
