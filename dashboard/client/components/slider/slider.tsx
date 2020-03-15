// Wrapper for <Slider/> component
// API docs: https://material-ui.com/lab/api/slider/
import "./slider.scss";

import React, { Component } from "react";
import { cssNames } from "../../utils";
import MaterialSlider, { SliderClassKey, SliderProps } from "@material-ui/core/Slider";

interface Props extends SliderProps {
  className?: string;
}

const defaultProps: Partial<Props> = {
  step: 1,
  min: 0,
  max: 100,
};

export class Slider extends Component<Props> {
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
