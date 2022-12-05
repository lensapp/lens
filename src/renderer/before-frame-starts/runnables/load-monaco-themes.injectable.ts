/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { customMonacoThemeInjectionToken } from "../../components/monaco-editor";
import addNewMonacoThemeInjectable from "../../monaco/add-new-theme.injectable";
import { evenBeforeFrameStartsInjectionToken } from "../tokens";

const loadMonacoThemesInjectable = getInjectable({
  id: "load-monaco-themes",
  instantiate: (di) => {
    const customThemes = di.injectMany(customMonacoThemeInjectionToken);
    const addNewMonacoTheme = di.inject(addNewMonacoThemeInjectable);

    return {
      id: "load-monaco-themes",
      run: () => {
        customThemes.forEach(addNewMonacoTheme);
      },
    };
  },
  injectionToken: evenBeforeFrameStartsInjectionToken,
});

export default loadMonacoThemesInjectable;
