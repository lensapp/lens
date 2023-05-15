/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./table-cell.scss";

import React from "react";
import { cssNames } from "@k8slens/utilities";
import { Icon } from "@k8slens/icon";
import { Checkbox } from "../checkbox";
import autoBindReact from "auto-bind/react";
import type { TableCellProps } from "@k8slens/list-layout";

export type TableCellElem = React.ReactElement<TableCellProps>;

export class TableCell extends React.Component<TableCellProps> {
  constructor(props: TableCellProps) {
    super(props);
    autoBindReact(this);
  }

  onClick(evt: React.MouseEvent<HTMLDivElement>) {
    const { _sort, sortBy, onClick } = this.props;

    onClick?.(evt);

    if (_sort && typeof sortBy === "string") {
      _sort(sortBy);
    }
  }

  renderSortIcon() {
    const { sortBy, _sorting } = this.props;

    if (!_sorting || !sortBy) {
      return null;
    }

    const sortActive = _sorting.sortBy === sortBy;
    const sortIconName = (!sortActive || _sorting.orderBy === "desc")
      ? "arrow_drop_down"
      : "arrow_drop_up";

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

    return null;
  }

  render() {
    const {
      className,
      checkbox,
      isChecked,
      scrollable,
      sortBy,
      _sort,
      _sorting,
      _nowrap,
      children,
      title,
      showWithColumn,
      ...cellProps
    } = this.props;

    const classNames = cssNames("TableCell", className, {
      checkbox,
      scrollable,
      nowrap: _nowrap,
      sorting: _sort && typeof sortBy === "string",
    });
    const content = title || children;

    return (
      <div
        {...cellProps}
        className={classNames}
        onClick={this.onClick}
      >
        {this.renderCheckbox()}
        {_nowrap ? <div className="content">{content}</div> : content}
        {this.renderSortIcon()}
      </div>
    );
  }
}
