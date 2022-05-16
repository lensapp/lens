/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { createTheme, ThemeProvider } from "@material-ui/core";

const defaultTheme = createTheme({
  props: {
    MuiIconButton: {
      color: "inherit",
    },
    MuiSvgIcon: {
      fontSize: "inherit",
    },
    MuiTooltip: {
      placement: "top",
    },
  },
  overrides: {
    MuiIconButton: {
      root: {
        "&:hover": {
          color: "var(--iconActiveColor)",
          backgroundColor: "var(--iconActiveBackground)",
        },
      },
    },
  },
});

export function DefaultProps(App: React.ComponentType | React.FunctionComponent) {
  return (
    <ThemeProvider theme= { defaultTheme } >
      <App />
    </ThemeProvider>
  );
}
