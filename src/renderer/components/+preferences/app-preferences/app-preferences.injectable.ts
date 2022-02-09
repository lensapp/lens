/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { getAppPreferences } from "./get-app-preferences";

const appPreferencesInjectable = getInjectable({
  id: "app-preferences",

  instantiate: (di) =>
    getAppPreferences({
      extensions: di.inject(rendererExtensionsInjectable),
    }),
});

export default appPreferencesInjectable;
