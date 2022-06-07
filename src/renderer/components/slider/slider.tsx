/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Wrapper for <Slider/> component
// API docs: https://material-ui.com/lab/api/slider/
import "./slider.scss";

import React, { Component } from "react";
import { cssNames } from "../../utils";
import type { SliderClassKey, SliderProps as MaterialSliderProps } from "@material-ui/core/Slider";
import MaterialSlider from "@material-ui/core/Slider";
import assert from "assert";

export interface SliderProps extends Omit<MaterialSliderProps, "onChange"> {
  className?: string;
  onChange(evt: React.FormEvent<any>, value: number): void;
}

const defaultProps: Partial<SliderProps> = {
  step: 1,
  min: 0,
  max: 100,
};

export class Slider extends Component<SliderProps> {
  static defaultProps = defaultProps as object;

  private classNames: Partial<{ [P in SliderClassKey]: string }> = {
    track: "track",
    thumb: "thumb",
    disabled: "disabled",
    vertical: "vertical",
  };

  render() {
    const { className, onChange, ...sliderProps } = this.props;

    return (
      <MaterialSlider
        {...sliderProps}
        onChange={(event, value) => {
          assert(!Array.isArray(value));
          onChange?.(event, value);
        }}
        classes={{
          root: cssNames("Slider", className),
          ...this.classNames,
        }}
      />
    );
  }
}
