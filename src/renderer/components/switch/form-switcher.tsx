/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import FormControlLabel, { FormControlLabelProps } from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    margin: 0,
    "& .MuiTypography-root": {
      fontSize: 14,
      fontWeight: 500,
      flex: 1,
      color: "var(--textColorAccent)",
    },
  },
});

/**
 * @deprecated Use <Switch/> instead from "../switch.tsx".
 */
export function FormSwitch(props: FormControlLabelProps) {
  const classes = useStyles();

  return (
    <FormControlLabel
      control={props.control}
      labelPlacement="start"
      label={props.label}
      className={classes.root}
    />
  );
}
