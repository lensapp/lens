/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./spinner.scss";

import React from "react";
import { cssNames } from "@k8slens/utilities";

export interface SpinnerProps extends React.HTMLProps<any> {
  singleColor?: boolean;
  center?: boolean;
}

export class Spinner extends React.Component<SpinnerProps, {}> {
  static defaultProps = {
    singleColor: true,
    center: false,
  };

  render() {
    const { center, singleColor, className, ...props } = this.props;
    const classNames = cssNames("Spinner", className, { singleColor, center });

    return <div {...props} className={classNames} />;
  }
}
