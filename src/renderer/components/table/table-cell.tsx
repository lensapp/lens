import "./table-cell.scss";
import type { TableSortBy, TableSortParams } from "./table";

import React, { ReactNode } from "react";
import { autobind, cssNames, displayBooleans } from "../../utils";
import { Icon } from "../icon";
import { Checkbox } from "../checkbox";

export type TableCellElem = React.ReactElement<TableCellProps>;

export interface TableCellProps extends React.DOMAttributes<HTMLDivElement> {
  className?: string;
  title?: ReactNode;
  checkbox?: boolean; // render cell with a checkbox
  isChecked?: boolean; // mark checkbox as checked or not
  renderBoolean?: boolean; // show "true" or "false" for all of the children elements are "typeof boolean"
  sortBy?: TableSortBy; // column name, must be same as key in sortable object <Table sortable={}/>
  _sorting?: Partial<TableSortParams>; // <Table> sorting state, don't use this prop outside (!)
  _sort?(sortBy: TableSortBy): void; // <Table> sort function, don't use this prop outside (!)
  _nowrap?: boolean; // indicator, might come from parent <TableHead>, don't use this prop outside (!)
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
    )
  }

  renderCheckbox() {
    const { checkbox, isChecked } = this.props;
    const showCheckbox = isChecked !== undefined;
    if (checkbox && showCheckbox) {
      return <Checkbox value={isChecked} />
    }
  }

  render() {
    const { className, checkbox, isChecked, sortBy, _sort, _sorting, _nowrap, children, title, renderBoolean: displayBoolean, ...cellProps } = this.props;
    const classNames = cssNames("TableCell", className, {
      checkbox: checkbox,
      nowrap: _nowrap,
      sorting: this.isSortable,
    });
    const content = displayBooleans(displayBoolean, title || children)
    return (
      <div {...cellProps} id={className} className={classNames} onClick={this.onClick}>
        {this.renderCheckbox()}
        {_nowrap ? <div className="content">{content}</div> : content}
        {this.renderSortIcon()}
      </div>
    )
  }
}
