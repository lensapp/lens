/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import {
  reactApplicationWrapperInjectionToken,
} from "@k8slens/react-application-root";
import { ThemeProvider } from "@material-ui/core";
import { defaultMuiBaseTheme } from "../mui-base-theme";

const themeProviderApplicationRootWrapperInjectable = getInjectable({
  id: "theme-provider-application-root-wrapper",

  instantiate: () => (Component) => () =>
    (
      <ThemeProvider theme={defaultMuiBaseTheme}>
        <Component />
      </ThemeProvider>
    ),

  injectionToken: reactApplicationWrapperInjectionToken,
});

export default themeProviderApplicationRootWrapperInjectable;
