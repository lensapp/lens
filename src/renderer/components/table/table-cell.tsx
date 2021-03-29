import "./table-cell.scss";
import type { TableSortBy, TableSortParams } from "./table";

import React, { ReactNode } from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { autobind, cssNames, displayBooleans } from "../../utils";
import { Icon } from "../icon";
import { Checkbox } from "../checkbox";
import { ResizeDirection, ResizeGrowthDirection, ResizeSide, ResizingAnchor } from "../resizing-anchor";
import { getColumnSize, setColumnSize } from "./table.storage";

export type TableCellElem = React.ReactElement<TableCellProps>;

export interface TableCellProps extends React.DOMAttributes<HTMLDivElement> {
  id?: string;
  /**
   * Used to persist configuration of table: column size, visibility, etc.
   * Required with props.isResizable={true}
   */
  storageId?: string;
  /**
   * Parent table's props.tableId, required with props.storageId
   */
  tableId?: string;
  className?: string;
  title?: ReactNode;
  /**
   * Allow to resize width and save to local storage, default: true
   */
  isResizable?: boolean;
  onResizeEnd?: () => void;
  checkbox?: boolean; // render cell with a checkbox
  isChecked?: boolean; // mark checkbox as checked or not
  renderBoolean?: boolean; // show "true" or "false" for all of the children elements are "typeof boolean"
  sortBy?: TableSortBy; // column name, must be same as key in sortable object <Table sortable={}/>
  showWithColumn?: string // id of the column which follow same visibility rules
  _sorting?: Partial<TableSortParams>; // <Table> sorting state, don't use this prop outside (!)
  _sort?(sortBy: TableSortBy): void; // <Table> sort function, don't use this prop outside (!)
  _nowrap?: boolean; // indicator, might come from parent <TableHead>, don't use this prop outside (!)
  style?: React.CSSProperties;
}

@observer
export class TableCell extends React.Component<TableCellProps> {
  @observable.ref elem?: HTMLElement;

  static defaultProps: TableCellProps = {
    isResizable: true,
  };

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
      return <Checkbox value={isChecked}/>;
    }
  }

  @observable isResizing = false;

  @computed get columnId(): string {
    return this.props.id ?? this.props.storageId;
  }

  @computed get columnSize(): number {
    const savedSize = getColumnSize(this.props.tableId, this.columnId);

    return savedSize ?? this.elem?.offsetWidth;
  }

  @computed get isResizable(): boolean {
    return [
      this.props.isResizable,
      this.props.tableId,
      this.columnId,
    ].every(Boolean);
  }

  @computed get style(): React.CSSProperties {
    const styles: React.CSSProperties & Record<string, any> = Object.assign({}, this.props.style);

    if (this.isResizable && this.columnSize) {
      styles.flexGrow = 0;
      styles.flexShrink = 0;
      styles.flexBasis = this.columnSize;
    }

    return styles;
  }

  @autobind()
  onResize(extent: number) {
    const { tableId } = this.props;
    const { columnId } = this;

    // persist state in storage
    setColumnSize({ tableId, columnId, size: extent });
  }

  @autobind()
  onResizeStart() {
    this.isResizing = true;
  }

  @autobind()
  onResizeEnd() {
    this.isResizing = false;
    this.props.onResizeEnd?.();
  }

  @autobind()
  bindRef(ref: HTMLElement) {
    this.elem = ref;
  }

  render() {
    const {
      className, checkbox, isChecked, isResizable, sortBy, onResizeEnd,
      _sort, _sorting, _nowrap, children, title, tableId, storageId,
      renderBoolean: displayBoolean, showWithColumn,
      ...cellProps
    } = this.props;

    const classNames = cssNames("TableCell", className, {
      checkbox,
      nowrap: _nowrap,
      sorting: this.isSortable,
      resizing: this.isResizing,
      resizable: this.isResizable,
    });
    const content = displayBooleans(displayBoolean, title || children);

    return (
      <div {...cellProps} className={classNames} style={this.style} onClick={this.onClick} ref={this.bindRef}>
        {this.renderCheckbox()}
        {_nowrap ? <div className="content">{content}</div> : content}
        {this.renderSortIcon()}
        {this.isResizable && (
          <ResizingAnchor
            minExtent={50}
            direction={ResizeDirection.HORIZONTAL}
            placement={ResizeSide.TRAILING}
            growthDirection={ResizeGrowthDirection.LEFT_TO_RIGHT}
            getCurrentExtent={() => this.columnSize}
            onStart={this.onResizeStart}
            onEnd={this.onResizeEnd}
            onDrag={this.onResize}
          />
        )}
      </div>
    );
  }
}
