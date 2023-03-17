/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import weblinksStateInjectable from "./state.injectable";

export type RemoveWeblink = (id: string) => void;

const removeWeblinkInjectable = getInjectable({
  id: "remove-weblink",
  instantiate: (di): RemoveWeblink => {
    const state = di.inject(weblinksStateInjectable);

    return action((id) => state.delete(id));
  },
});

export default removeWeblinkInjectable;
