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

// Wrapper for <Slider/> component
// API docs: https://material-ui.com/lab/api/slider/
import "./slider.scss";

import React, { Component } from "react";
import { cssNames } from "../../utils";
import MaterialSlider, { SliderClassKey, SliderProps as MaterialSliderProps } from "@material-ui/core/Slider";

export interface SliderProps extends Omit<MaterialSliderProps, "onChange"> {
  className?: string;
  onChange?(evt: React.FormEvent<any>, value: number): void;
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
    const { className, ...sliderProps } = this.props;

    return (
      <MaterialSlider
        {...sliderProps}
        classes={{
          root: cssNames("Slider", className),
          ...this.classNames,
        }}
      />
    );
  }
}
