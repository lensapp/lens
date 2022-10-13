/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToApplicationPreferencesInjectable from "../../../../features/preferences/common/navigate-to-application-preferences.injectable";

const navigateToPreferencesInjectable = getInjectable({
  id: "navigate-to-preferences",

  instantiate: (di) => di.inject(navigateToApplicationPreferencesInjectable),
});

export default navigateToPreferencesInjectable;
