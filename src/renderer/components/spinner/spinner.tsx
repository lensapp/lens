import './spinner.scss'

import React from 'react'
import { cssNames } from "../../utils";

export interface SpinnerProps extends React.HTMLProps<any> {
  singleColor?: boolean;
  center?: boolean;
}

export class Spinner extends React.Component<SpinnerProps, {}> {
  private elem: HTMLElement;

  static defaultProps = {
    singleColor: true,
    center: false,
  };

  render() {
    const { center, singleColor, ...props } = this.props;
    let { className } = this.props;
    className = cssNames('Spinner', className, {
      singleColor: singleColor,
      center: center,
    });
    return <div {...props} className={className} ref={e => this.elem = e}/>;
  }
}
