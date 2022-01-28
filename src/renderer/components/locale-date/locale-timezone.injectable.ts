/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userPreferencesStoreInjectable from "../../../common/user-preferences/store.injectable";

const localeTimezoneInjectable = getInjectable({
  instantiate: (di) => {
    const userStore = di.inject(userPreferencesStoreInjectable);

    return computed(() => userStore.localeTimezone);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default localeTimezoneInjectable;
