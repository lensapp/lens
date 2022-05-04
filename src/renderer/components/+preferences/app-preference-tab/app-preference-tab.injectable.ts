/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { getAppPreferenceTabs } from "./get-app-preference-tab";

const appPreferenceTabInjectable = getInjectable({
  id: "app-preference-tabs",

  instantiate: (di) =>
    getAppPreferenceTabs({
      extensions: di.inject(rendererExtensionsInjectable),
    }),
});

export default appPreferenceTabInjectable;
