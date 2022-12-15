/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { customMonacoThemeInjectionToken } from "../../components/monaco-editor";
import addNewMonacoThemeInjectable from "../../monaco/add-new-theme.injectable";
import { beforeFrameStartsInjectionToken } from "../tokens";

const loadMonacoThemesInjectable = getInjectable({
  id: "load-monaco-themes",
  instantiate: (di) => ({
    id: "load-monaco-themes",
    run: () => {
      const customThemes = di.injectMany(customMonacoThemeInjectionToken);
      const addNewMonacoTheme = di.inject(addNewMonacoThemeInjectable);

      customThemes.forEach(addNewMonacoTheme);
    },
  }),
  injectionToken: beforeFrameStartsInjectionToken,
});

export default loadMonacoThemesInjectable;
