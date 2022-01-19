/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { getAppPreferences } from "./get-app-preferences";

const appPreferencesInjectable = getInjectable({
  instantiate: (di) =>
    getAppPreferences({
      extensions: di.inject(rendererExtensionsInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default appPreferencesInjectable;
