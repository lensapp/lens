/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensThemeDeclarationInjectionToken } from "./declaration";

const lensThemesInjectable = getInjectable({
  id: "lens-themes",
  instantiate: (di) => {
    const themes = di.injectMany(lensThemeDeclarationInjectionToken);

    return new Map(themes.map(theme => [theme.name, theme]));
  },
});

export default lensThemesInjectable;
