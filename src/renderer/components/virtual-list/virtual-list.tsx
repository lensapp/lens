// Wrapper for "react-window" component
// API docs: https://react-window.now.sh
import "./virtual-list.scss";

import React, { Component } from "react";
import { observer } from "mobx-react";
import { Align, ListChildComponentProps, ListOnScrollProps, VariableSizeList } from "react-window";
import { cssNames, noop } from "../../utils";
import { TableRowProps } from "../table/table-row";
import { ItemObject } from "../../item.store";
import throttle from "lodash/throttle";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

interface Props<T extends ItemObject = any> {
  items: T[];
  rowHeights: number[];
  className?: string;
  width?: number | string;
  initialOffset?: number;
  readyOffset?: number;
  selectedItemId?: string;
  getRow?: (uid: string | number) => React.ReactElement<any>;
  onScroll?: (props: ListOnScrollProps) => void;
  outerRef?: React.Ref<any>
}

interface State {
  height: number;
  overscanCount: number;
}

const defaultProps: Partial<Props> = {
  width: "100%",
  initialOffset: 1,
  readyOffset: 10,
  onScroll: noop
}

export class VirtualList extends Component<Props, State> {
  static defaultProps = defaultProps as object;

  private listRef = React.createRef<VariableSizeList>();
  private parentRef = React.createRef<HTMLDivElement>();

  public state: State = {
    overscanCount: this.props.initialOffset,
    height: 0,
  };

  componentDidMount() {
    this.setListHeight();
    this.scrollToSelectedItem();
    new ResizeSensor(this.parentRef.current as any as Element, this.setListHeight);
    this.setState({ overscanCount: this.props.readyOffset });
  }

  componentDidUpdate(prevProps: Props) {
    const { items, rowHeights } = this.props;
    if (prevProps.items.length !== items.length || !isEqual(prevProps.rowHeights, rowHeights)) {
      this.listRef.current.resetAfterIndex(0, false);
    }
  }

  setListHeight = throttle(() => {
    const { parentRef, state: { height } } = this;
    if (!parentRef.current) return;
    const parentHeight = parentRef.current.clientHeight;
    if (parentHeight === height) return;
    this.setState({
      height: parentHeight,
    })
  }, 250)

  getItemSize = (index: number) => this.props.rowHeights[index];

  scrollToSelectedItem = debounce(() => {
    if (!this.props.selectedItemId) return;
    const { items, selectedItemId } = this.props;
    const index = items.findIndex(item => item.getId() == selectedItemId);
    if (index === -1) return;
    this.listRef.current.scrollToItem(index, "start");
  })

  scrollToItem = (index: number, align: Align) => {
    this.listRef.current.scrollToItem(index, align)
  }

  render() {
    const { width, className, items, getRow, onScroll, outerRef } = this.props;
    const { height, overscanCount } = this.state;
    const rowData: RowData = {
      items,
      getRow
    };
    return (
      <div className={cssNames("VirtualList", className)} ref={this.parentRef}>
        <VariableSizeList
          className="list"
          width={width}
          height={height}
          itemSize={this.getItemSize}
          itemCount={items.length}
          itemData={rowData}
          overscanCount={overscanCount}
          ref={this.listRef}
          outerRef={outerRef}
          children={Row}
          onScroll={onScroll}
        />
      </div>
    );
  }
}

interface RowData {
  items: ItemObject[];
  getRow?: (uid: string | number) => React.ReactElement<TableRowProps>;
}

interface RowProps extends ListChildComponentProps {
  data: RowData;
}

const Row = observer((props: RowProps) => {
  const { index, style, data } = props;
  const { items, getRow } = data;
  const item = items[index];
  const uid = typeof item == "string" ? index : items[index].getId();
  const row = getRow(uid);
  if (!row) return null;
  return React.cloneElement(row, {
    style: Object.assign({}, row.props.style, style)
  });
})