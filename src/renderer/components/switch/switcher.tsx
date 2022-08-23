/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, withStyles } from "@material-ui/core/styles";
import type { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";
import Switch from "@material-ui/core/Switch";

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

export interface SwitcherProps extends SwitchProps {
  classes: Styles;
}

/**
 * @deprecated Use <Switch/> instead from "../switch.tsx".
 */
export const Switcher = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 40,
      height: 24,
      padding: 0,
      margin: "0 0 0 8px",
    },
    switchBase: {
      padding: 1,
      paddingLeft: 4,
      "&$checked": {
        transform: "translateX(14px)",
        color: "white",
        "& + $track": {
          backgroundColor: "#52d869",
          opacity: 1,
          border: "none",
        },
      },
      "&$focusVisible $thumb": {
        color: "#52d869",
        border: "6px solid #fff",
      },
    },
    thumb: {
      width: 18,
      height: 18,
      marginTop: 2,
      boxShadow: "none",
    },
    track: {
      borderRadius: 26 / 2,
      backgroundColor: "#72767b",
      opacity: 1,
      transition: theme.transitions.create(["background-color", "border"]),
    },
    checked: {},
    focusVisible: {},
  }),
)(({ classes, ...props }: SwitcherProps) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});
