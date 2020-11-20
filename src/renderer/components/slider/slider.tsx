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
          ...this.classNames
        }}
      />
    )
  }
}
