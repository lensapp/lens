import "./table-cell.scss";

import React, { ReactNode } from "react";
import { autobind, cssNames } from "../../utils";
import { SortBy, SortParams } from "./table";
import { Icon } from "../icon";
import { Checkbox } from "../checkbox";

export type TableCellElem = React.ReactElement<TableCellProps>;

export interface TableCellProps extends React.DOMAttributes<HTMLDivElement> {
  className?: string;
  title?: ReactNode;
  checkbox?: boolean; // render cell with a checkbox
  isChecked?: boolean; // mark checkbox as checked or not
  sortBy?: SortBy; // column name, must be same as key in sortable object <Table sortable={}/>
  sorting?: Partial<SortParams>; // <Table> sorting state, don't use this prop outside (!)
  sort?(sortBy: SortBy): void; // <Table> sort function, don't use this prop outside (!)
  nowrap?: boolean; // indicator, might come from parent <TableHead>, don't use this prop outside (!)
}

export class TableCell extends React.Component<TableCellProps> {
  @autobind()
  onClick(evt: React.MouseEvent<HTMLDivElement>): void {
    if (this.props.onClick) {
      this.props.onClick(evt);
    }
    if (this.isSortable) {
      this.props.sort(this.props.sortBy);
    }
  }

  get isSortable(): boolean {
    const { sorting, sortBy } = this.props;
    return !!sorting && sortBy !== undefined;
  }

  renderSortIcon(): JSX.Element {
    const { sortBy, sorting } = this.props;
    if (!this.isSortable) {
      return;
    }
    const sortActive = sorting.sortBy === sortBy;
    const sortIconName = (!sortActive || sorting.orderBy === "desc") ? "arrow_drop_down" : "arrow_drop_up";
    return (
      <Icon
        className={cssNames("sortIcon", { enabled: sortActive })}
        material={sortIconName}
      />
    );
  }

  renderCheckbox(): JSX.Element {
    const { checkbox, isChecked } = this.props;
    const showCheckbox = isChecked !== undefined;
    if (checkbox && showCheckbox) {
      return <Checkbox value={isChecked}/>;
    }
  }

  render(): JSX.Element {
    const { className, checkbox, isChecked: _isChecked, sortBy: _sortBy, sort: _sort, sorting: _sorting, nowrap, children, title, ...cellProps } = this.props;
    const classNames = cssNames("TableCell", className, {
      checkbox: checkbox,
      nowrap: nowrap,
      sorting: this.isSortable,
    });
    const content = title || children;
    return (
      <div {...cellProps} className={classNames} onClick={this.onClick}>
        {this.renderCheckbox()}
        {nowrap ? <div className="content">{content}</div> : content}
        {this.renderSortIcon()}
      </div>
    );
  }
}
