/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToAppPreferencesInjectable from "./app/navigate-to-app-preferences.injectable";

const navigateToPreferencesInjectable = getInjectable({
  id: "navigate-to-preferences",

  instantiate: (di) => di.inject(navigateToAppPreferencesInjectable),
});

export default navigateToPreferencesInjectable;
