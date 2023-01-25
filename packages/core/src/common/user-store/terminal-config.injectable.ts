/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { toJS } from "../utils";
import userStoreInjectable from "./user-store.injectable";

const terminalConfigInjectable = getInjectable({
  id: "terminal-config",
  instantiate: (di) => {
    const store = di.inject(userStoreInjectable);

    return computed(() => toJS(store.terminalConfig));
  },
});

export default terminalConfigInjectable;
