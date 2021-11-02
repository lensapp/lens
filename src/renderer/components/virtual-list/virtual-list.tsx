/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Wrapper for "react-window" component
// API docs: https://react-window.now.sh
import "./virtual-list.scss";

import React, { Component } from "react";
import { observer } from "mobx-react";
import { Align, ListChildComponentProps, ListOnScrollProps, VariableSizeList } from "react-window";
import { cssNames, noop } from "../../utils";
import type { TableRowProps } from "../table/table-row";
import type { ItemObject } from "../../../common/item.store";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import AutoSizer from "react-virtualized-auto-sizer";

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

  /**
   * If specified then AutoSizer will not be used and instead a fixed height
   * virtual list will be rendered
   */
  fixedHeight?: number;
}

interface State {
  overscanCount: number;
}

const defaultProps: Partial<Props> = {
  width: "100%",
  initialOffset: 1,
  readyOffset: 10,
  onScroll: noop,
};

export class VirtualList extends Component<Props, State> {
  static defaultProps = defaultProps as object;

  private listRef = React.createRef<VariableSizeList>();

  public state: State = {
    overscanCount: this.props.initialOffset,
  };

  componentDidMount() {
    this.scrollToSelectedItem();
    this.setState({ overscanCount: this.props.readyOffset });
  }

  componentDidUpdate(prevProps: Props) {
    const { items, rowHeights } = this.props;

    if (prevProps.items.length !== items.length || !isEqual(prevProps.rowHeights, rowHeights)) {
      this.listRef.current?.resetAfterIndex(0, false);
    }
  }

  getItemSize = (index: number) => this.props.rowHeights[index];

  scrollToSelectedItem = debounce(() => {
    if (!this.props.selectedItemId) {
      return;
    }

    const { items, selectedItemId } = this.props;
    const index = items.findIndex(item => item.getId() == selectedItemId);

    if (index >= 0) {
      this.listRef.current?.scrollToItem(index, "start");
    }
  });

  scrollToItem = (index: number, align: Align) => {
    this.listRef.current?.scrollToItem(index, align);
  };

  renderList(height: number | undefined) {
    const { width, items, getRow, onScroll, outerRef } = this.props;
    const { overscanCount } = this.state;

    return (
      <VariableSizeList
        className="list"
        width={width}
        height={height}
        itemSize={this.getItemSize}
        itemCount={items.length}
        itemData={{
          items,
          getRow,
        }}
        overscanCount={overscanCount}
        ref={this.listRef}
        outerRef={outerRef}
        onScroll={onScroll}
      >
        {Row}
      </VariableSizeList>
    );
  }

  render() {
    const { className, fixedHeight } = this.props;

    return (
      <div className={cssNames("VirtualList", className)}>
        {
          typeof fixedHeight === "number"
            ? this.renderList(fixedHeight)
            : (
              <AutoSizer disableWidth>
                {({ height }) => this.renderList(height)}
              </AutoSizer>
            )
        }
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
    style: Object.assign({}, row.props.style, style),
  });
});
