import React, { ReactNode } from "react";
import { throttle } from "lodash";

import "./table-cell.scss";
import type { TableSortBy, TableSortParams } from "./table";
import { autobind, cssNames, displayBooleans, prevDefault } from "../../utils";
import { Icon } from "../icon";
import { Checkbox } from "../checkbox";
import { ERGONOMIC_RESIZE_THROTTLE_RATE } from "./constants";

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
  _onResize?(width: number): void;

  /**
   * Triggers once the user has finished resizing this cell
   */
  _onResizeComplete?(): void; // triggers a callback when user stops resizing
}

type ResizeHandlerState = {
  mousePosX?: number,
};

export class TableCell extends React.Component<TableCellProps> {
  private resizeHandlerState?: ResizeHandlerState;
  private cellContainer: React.RefObject<HTMLDivElement> = React.createRef();

  /**
   * Stores an instance of `<TableCell>` that is currently responsible for handling resize-related events
   */
  private static currentEventHandlingInstance?: TableCell;

  /**
   * Appends static event proxies to document `mousemove` and `mouseup` events for resizing,
   * sets a particulate instance of `<TableCell>` to handle these events
   * @param handlingInstance instance of `<TableCell>` responsible for handling events
   */
  private static addMouseEventListeners(handlingInstance: TableCell) {
    TableCell.currentEventHandlingInstance = handlingInstance;

    document.addEventListener("mousemove", TableCell.mouseMoveEventProxy);
    document.addEventListener("mouseup", TableCell.mouseUpEventProxy);
  }

  /**
   * Detaches static proxies from document `mousemove` and `mouseup`,
   * cleans up the reference to current event handling instance 
   */
  private static removeMouseEventListeners() {
    document.removeEventListener("mousemove", TableCell.mouseMoveEventProxy);
    document.removeEventListener("mouseup", TableCell.mouseUpEventProxy);
    
    delete TableCell.currentEventHandlingInstance;
  }

  /**
   * Proxy for document-level `mousemove` events.
   * 
   * Forwards the event to a member function
   * of a current event handling instance of `<TableCell>`.
   * 
   * Static to prevent it from leaking events.
   */
  private static mouseMoveEventProxy(event: MouseEvent) {
    TableCell.currentEventHandlingInstance.mouseMoveHandler(event);
  }

  /**
   * Proxy for document-level `mouseup` events.
   * 
   * Forwards the event to a member function
   * of a current event handling instance of `<TableCell>`.
   * 
   * Static to prevent it from leaking events.
   */
  private static mouseUpEventProxy() {
    TableCell.currentEventHandlingInstance.mouseUpHandler();
  }

  private mouseMoveHandler = throttle((event: MouseEvent) => {
    if (!this.resizeHandlerState) {
      return;
    }

    const diffPosX = event.pageX - this.resizeHandlerState.mousePosX;
    const currentWidth = this.cellContainer.current.offsetWidth;

    this.props?._onResize(currentWidth + diffPosX);
    this.resizeHandlerState.mousePosX = event.pageX;
  }, ERGONOMIC_RESIZE_THROTTLE_RATE);

  private mouseUpHandler() {
    TableCell.removeMouseEventListeners();

    this.props?._onResizeComplete();
    delete this.resizeHandlerState;
  }

  @autobind()
  onClick(evt: React.MouseEvent<HTMLDivElement>) {
    if (this.props.onClick) {
      this.props.onClick(evt);
    }

    if (this.isSortable) {
      this.props._sort(this.props.sortBy);
    }
  }

  componentWillUnmount() {
    TableCell.removeMouseEventListeners();
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
      _onResize,
      _onResizeComplete,
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
    const resizeHandlers: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> = {
      onMouseDown: event => {
        this.resizeHandlerState = {
          mousePosX: event.pageX
        };
        TableCell.addMouseEventListeners(this);
      },
      // prevent click events from triggering
      onClick: prevDefault(() => {})
    };

    return (
      <div ref={this.cellContainer} style={cellStyle} {...cellProps} className={classNames} onClick={this.onClick}>
        {this.renderCheckbox()}
        <div className="flex align-center">
          {_nowrap ? <div className="content">{content}</div> : content}
          {this.renderSortIcon()}
        </div>

        {resizable && (
          <span {...resizeHandlers} className="resize-anchor">
            <Icon material="unfold_more" />
          </span>
        )}
      </div>
    );
  }
}
