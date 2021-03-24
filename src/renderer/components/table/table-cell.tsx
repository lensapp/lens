import React, { ReactNode } from "react";

import "./table-cell.scss";
import type { TableSortBy, TableSortParams } from "./table";
import { autobind, cssNames, displayBooleans, prevDefault } from "../../utils";
import { Icon } from "../icon";
import { Checkbox } from "../checkbox";
import { ResizingAnchor, ResizeDirection, ResizeSide, ResizeGrowthDirection } from "../resizing-anchor";

export type TableCellElem = React.ReactElement<TableCellProps>;

export interface TableCellProps extends React.DOMAttributes<HTMLDivElement> {
  id?: string; // used for configuration visibility of columns
  className?: string;
  title?: ReactNode;
  isResizable?: boolean; // allow resizing
  size?: number; // set horizontal size
  checkbox?: boolean; // render cell with a checkbox
  isChecked?: boolean; // mark checkbox as checked or not
  renderBoolean?: boolean; // show "true" or "false" for all of the children elements are "typeof boolean"
  sortBy?: TableSortBy; // column name, must be same as key in sortable object <Table sortable={}/>
  showWithColumn?: string // id of the column which follow same visibility rules
  _sorting?: Partial<TableSortParams>; // <Table> sorting state, don't use this prop outside (!)
  _sort?(sortBy: TableSortBy): void; // <Table> sort function, don't use this prop outside (!)
  _nowrap?: boolean; // indicator, might come from parent <TableHead>, don't use this prop outside (!)

  /**
   * Triggers every time this cell is resized by user
   * @param width desired width of this cell
   */
  onResize?(width: number): void;

  /**
   * Triggers once the user has finished resizing this cell
   */
  onResizeComplete?(): void; // triggers a callback when user stops resizing
}

type ResizeHandlerState = {
  mousePosX?: number,
};

export class TableCell extends React.Component<TableCellProps> {
  private resizeHandlerState?: ResizeHandlerState;
  private cellContainer: React.RefObject<HTMLDivElement> = React.createRef();

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
    const { 
      className,
      checkbox,
      isChecked,
      isResizable: resizable,
      size,
      sortBy,
      _sort,
      _sorting,
      _nowrap,
      children,
      title,
      renderBoolean: displayBoolean,
      showWithColumn,
      onResize,
      onResizeComplete,
      ...cellProps } = this.props;
    const classNames = cssNames("TableCell", className, {
      checkbox,
      nowrap: _nowrap,
      sorting: this.isSortable,
    });
    const content = displayBooleans(displayBoolean, title || children);
    const cellStyle: React.CSSProperties = size !== undefined ?
      { minWidth: `${size}px` } :
      {};

    return (
      <div ref={this.cellContainer} style={cellStyle} {...cellProps} className={classNames} onClick={this.onClick}>
        {this.renderCheckbox()}
        <div className="flex align-center">
          {_nowrap ? <div className="content">{content}</div> : content}
          {this.renderSortIcon()}
        </div>
        {resizable && (
          <ResizingAnchor
            onStart={() => prevDefault(() => {})}
            onDrag={newSize =>
              this.props.onResize(newSize)
            }
            onEnd={() => this.props.onResizeComplete()}
            getCurrentExtent={() => size || 0}
            direction={ResizeDirection.HORIZONTAL}
            placement={ResizeSide.TRAILING}
            growthDirection={ResizeGrowthDirection.LEFT_TO_RIGHT}
          />
        )}
      </div>
    );
  }
}
