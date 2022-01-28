/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { toJS } from "../utils";
import userPreferencesStoreInjectable from "./store.injectable";

const terminalConfigInjectable = getInjectable({
  instantiate: (di) => {
    const userPreferencesStore = di.inject(userPreferencesStoreInjectable);

    return computed(() => toJS(userPreferencesStore.terminalConfig));
  },
  lifecycle: lifecycleEnum.singleton,
});

export default terminalConfigInjectable;
