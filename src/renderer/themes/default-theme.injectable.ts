/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensThemeDeclarationInjectionToken } from "./declaration";

const defaultLensThemeInjectable = getInjectable({
  id: "default-lens-theme",
  instantiate: (di) => {
    const themes = di.injectMany(lensThemeDeclarationInjectionToken);
    const [defaultTheme, ...rest] = themes.filter(theme => theme.isDefault);

    if (rest.length > 0) {
      throw new Error("Multiple LensTheme's are declared as the default");
    }

    if (!defaultTheme) {
      throw new Error("No LensTheme is declared as the default");
    }

    return defaultTheme;
  },
});

export default defaultLensThemeInjectable;
