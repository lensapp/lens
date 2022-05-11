/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export type AskBoolean = (question: string) => Promise<boolean>;

const askBooleanInjectable = getInjectable({
  id: "ask-boolean",
  instantiate: (di): AskBoolean => async (question: string) => false,
});

export default askBooleanInjectable;
