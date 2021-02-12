import "./table-cell.scss";
import type { TableSortBy, TableSortParams } from "./table";

import React, { ReactNode } from "react";
import { autobind, cssNames, displayBooleans } from "../../utils";
import { Icon } from "../icon";
import { Checkbox } from "../checkbox";

export type TableCellElem = React.ReactElement<TableCellProps>;

export interface TableCellProps extends React.DOMAttributes<HTMLDivElement> {
  id?: string; // used for configuration visibility of columns
  className?: string;
  title?: ReactNode;
  resizable?: boolean; // allow resizing
  size?: number; // set horizontal size
  checkbox?: boolean; // render cell with a checkbox
  isChecked?: boolean; // mark checkbox as checked or not
  renderBoolean?: boolean; // show "true" or "false" for all of the children elements are "typeof boolean"
  sortBy?: TableSortBy; // column name, must be same as key in sortable object <Table sortable={}/>
  showWithColumn?: string // id of the column which follow same visibility rules
  _sorting?: Partial<TableSortParams>; // <Table> sorting state, don't use this prop outside (!)
  _sort?(sortBy: TableSortBy): void; // <Table> sort function, don't use this prop outside (!)
  _nowrap?: boolean; // indicator, might come from parent <TableHead>, don't use this prop outside (!)
  _onResize?(width: number): void; // <Table> resize callbalck, don't use this prop outside (!)
}

export class TableCell extends React.Component<TableCellProps> {
  @autobind()
  onClick(evt: React.MouseEvent<HTMLDivElement>) {
    if (this.props.onClick) {
      this.props.onClick(evt);
    }

    if (this.isSortable) {
      this.props._sort(this.props.sortBy);
    }
  }

  get isSortable() {
    const { _sorting, sortBy } = this.props;

    return _sorting && sortBy !== undefined;
  }

  renderSortIcon() {
    const { sortBy, _sorting } = this.props;

    if (!this.isSortable) return;
    const sortActive = _sorting.sortBy === sortBy;
    const sortIconName = (!sortActive || _sorting.orderBy === "desc") ? "arrow_drop_down" : "arrow_drop_up";

    return (
      <Icon
        className={cssNames("sortIcon", { enabled: sortActive })}
        material={sortIconName}
      />
    );
  }

  renderCheckbox() {
    const { checkbox, isChecked } = this.props;
    const showCheckbox = isChecked !== undefined;

    if (checkbox && showCheckbox) {
      return <Checkbox value={isChecked} />;
    }
  }

  render() {
    const { className, checkbox, isChecked, resizable, size, sortBy, _sort, _sorting, _nowrap, children, title, renderBoolean: displayBoolean, showWithColumn, ...cellProps } = this.props;
    const classNames = cssNames("TableCell", className, {
      checkbox,
      nowrap: _nowrap,
      sorting: this.isSortable,
    });
    const content = displayBooleans(displayBoolean, title || children);
    const cellStyle: React.CSSProperties = size !== undefined ?
      { flexBasis: `${size}px` } :
      {};

    return (
      <div style={cellStyle} {...cellProps} className={classNames} onClick={this.onClick}>
        {this.renderCheckbox()}
        {_nowrap ? <div className="content">{content}</div> : content}
        {this.renderSortIcon()}
        {resizable && <span className="resize-anchor"></span>}
      </div>
    );
  }
}
