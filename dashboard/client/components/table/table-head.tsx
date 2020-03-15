import "./table-head.scss";

import * as React from "react";
import { cssNames } from "../../utils";

export type TableHeadElem = React.ReactElement<TableHeadProps>;

export interface TableHeadProps extends React.DOMAttributes<HTMLDivElement> {
  className?: string;
  showTopLine?: boolean; // show border line at the top
  sticky?: boolean; // keep header on top when scrolling
  nowrap?: boolean; // white-space: nowrap, align inner <TableCell> in one line
}

export class TableHead extends React.Component<TableHeadProps> {
  static defaultProps: TableHeadProps = {
    sticky: true,
  }

  render() {
    const { className, sticky, nowrap, showTopLine, children, ...headProps } = this.props;
    const classNames = cssNames("TableHead", className, {
      sticky, nowrap,
      topLine: showTopLine,
    });
    return (
      <div className={classNames} {...headProps}>
        {children}
      </div>
    )
  }
}
