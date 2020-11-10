import './spinner.scss'

import React from 'react'
import { cssNames } from "../../utils";

export interface SpinnerProps extends React.HTMLProps<any> {
  singleColor?: boolean;
  center?: boolean;
  centerHorizontal?: boolean;
}

export class Spinner extends React.Component<SpinnerProps, {}> {
  static defaultProps = {
    singleColor: true,
    center: false,
  };

  render() {
    const { center, singleColor, centerHorizontal, className, ...props } = this.props;
    const classNames = cssNames('Spinner', className, { singleColor, center, centerHorizontal });

    return <div {...props} className={classNames} />;
  }
}
