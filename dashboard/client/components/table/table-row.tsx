import "./table-row.scss";

import React, { CSSProperties } from "react";
import { cssNames } from "../../utils";
import { ItemObject } from "../../item.store";

export type TableRowElem = React.ReactElement<TableRowProps>;

export interface TableRowProps extends React.DOMAttributes<HTMLDivElement> {
  className?: string;
  selected?: boolean;
  style?: CSSProperties;
  nowrap?: boolean; // white-space: nowrap, align inner <TableCell> in one line
  sortItem?: ItemObject | any; // data for sorting callback in <Table sortable={}/>
  searchItem?: ItemObject | any; // data for searching filters in <Table searchable={}/>
  disabled?: boolean;
}

export class TableRow extends React.Component<TableRowProps> {
  render() {
    const { className, nowrap, selected, disabled, children, sortItem, searchItem, ...rowProps } = this.props;
    const classNames = cssNames("TableRow", className, { selected, nowrap, disabled });
    return (
      <div className={classNames} {...rowProps}>
        {children}
      </div>
    )
  }
}
