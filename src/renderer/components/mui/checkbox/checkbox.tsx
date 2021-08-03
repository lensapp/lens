/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Checkbox as MuiCheckbox, CheckboxClassKey, CheckboxProps, createStyles, Theme, withStyles } from "@material-ui/core";
import React from "react";

interface Styles extends Partial<Record<CheckboxClassKey, string>> {
}

interface Props extends CheckboxProps {
  classes: Styles;
}

export const Checkbox = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 40,
      height: 24,
      padding: 0,
      margin: "0 0 0 8px",
    },
    colorPrimary: { },
    colorSecondary: { },
    checked: {},
    disabled: {},
    indeterminate: {},
    input: {},
  }),
)(({ classes, ...props }: Props) => {
  return (
    <MuiCheckbox
      classes={{
        root: classes.root,
        colorPrimary: classes.colorPrimary,
        colorSecondary: classes.colorSecondary,
        checked: classes.checked,
        disabled: classes.disabled,
        indeterminate: classes.indeterminate,
        input: classes.input,
      }}
      {...props}
    />
  );
});
