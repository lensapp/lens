import React from "react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";

const defaultTheme = createMuiTheme({
  props: {
    MuiIconButton: {
      color: "inherit",
    },
    MuiSvgIcon: {
      fontSize: "inherit",
    },
    MuiTooltip: {
      placement: "top",
    }
  },
  overrides: {
    MuiIconButton: {
      root: {
        "&:hover": {
          color: "var(--iconActiveColor)",
          backgroundColor: "var(--iconActiveBackground)",
        }
      }
    }
  },
});

export function DefaultProps(App: React.ComponentType) {
  return (
    <ThemeProvider theme= { defaultTheme } >
      <App />
    </ThemeProvider>
  );
}
