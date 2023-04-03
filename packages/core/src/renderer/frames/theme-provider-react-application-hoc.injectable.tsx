/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { reactApplicationHigherOrderComponentInjectionToken } from "@k8slens/react-application";
import { ThemeProvider } from "@material-ui/core";
import { defaultMuiBaseTheme } from "../mui-base-theme";

const themeProviderReactApplicationHocInjectable = getInjectable({
  id: "theme-provider-react-application-hoc",

  instantiate:
    () =>
      ({ children }) =>
        <ThemeProvider theme={defaultMuiBaseTheme}>{children}</ThemeProvider>,

  injectionToken: reactApplicationHigherOrderComponentInjectionToken,
});

export default themeProviderReactApplicationHocInjectable;
