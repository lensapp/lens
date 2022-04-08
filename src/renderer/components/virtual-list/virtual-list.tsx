/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Wrapper for "react-window" component
// API docs: https://react-window.now.sh
import "./virtual-list.scss";

import type { ForwardedRef } from "react";
import React, { createRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { observer } from "mobx-react";
import type { Align, ListChildComponentProps, ListOnScrollProps } from "react-window";
import { VariableSizeList } from "react-window";
import { cssNames, noop } from "../../utils";
import type { TableRowProps } from "../table/table-row";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import AutoSizer from "react-virtualized-auto-sizer";

export interface VirtualListProps<T extends { getId(): string } | string> {
  items: T[];
  rowHeights: number[];
  className?: string;
  width?: number | string;
  initialOffset?: number;
  readyOffset?: number;
  selectedItemId?: string;
  getRow?: (uid: T extends string ? number : string) => React.ReactElement | undefined | null;
  onScroll?: (props: ListOnScrollProps) => void;
  outerRef?: React.Ref<HTMLDivElement>;

  /**
   * If specified then AutoSizer will not be used and instead a fixed height
   * virtual list will be rendered
   */
  fixedHeight?: number;
}

export interface VirtualListRef {
  scrollToItem: (index: number, align: Align) => void;
}

function VirtualListInner<T extends { getId(): string } | string>({
  items,
  rowHeights,
  className,
  width = "100%",
  initialOffset = 1,
  readyOffset = 10,
  selectedItemId,
  getRow,
  onScroll = noop,
  outerRef,
  fixedHeight,
  forwardedRef,
}: VirtualListProps<T> & { forwardedRef?: ForwardedRef<VirtualListRef> }) {
  const [overscanCount, setOverscanCount] = useState(initialOffset);
  const listRef = createRef<VariableSizeList>();
  const prevItems = useRef(items);
  const prevRowHeights = useRef(rowHeights);
  const scrollToSelectedItem = useCallback(debounce(() => {
    if (!selectedItemId) {
      return;
    }

    const index = items.findIndex(item => selectedItemId === (
      typeof item === "string"
        ? item
        : item.getId()
    ));

    if (index >= 0) {
      listRef.current?.scrollToItem(index, "start");
    }
  }), [selectedItemId, [items]]);
  const getItemSize = (index: number) => rowHeights[index];

  useImperativeHandle(forwardedRef, () => ({
    scrollToItem: (index, align) => listRef.current?.scrollToItem(index, align),
  }));

  useEffect(() => {
    scrollToSelectedItem();
    setOverscanCount(readyOffset);
  });

  useEffect(() => {
    try {
      if (prevItems.current.length !== items.length || !isEqual(prevRowHeights.current, rowHeights)) {
        listRef.current?.resetAfterIndex(0, false);
      }
    } finally {
      prevItems.current = items;
      prevRowHeights.current = rowHeights;
    }
  }, [items, rowHeights]);

  const renderList = (height: number) => (
    <VariableSizeList
      className="list"
      width={width}
      height={height}
      itemSize={getItemSize}
      itemCount={items.length}
      itemData={{
        items,
        getRow: getRow as never,
      }}
      overscanCount={overscanCount}
      ref={listRef}
      outerRef={outerRef}
      onScroll={onScroll}
    >
      {Row}
    </VariableSizeList>
  );

  return (
    <div className={cssNames("VirtualList", className)}>
      {
        typeof fixedHeight === "number"
          ? renderList(fixedHeight)
          : (
            <AutoSizer disableWidth>
              {({ height }) => renderList(height)}
            </AutoSizer>
          )
      }
    </div>
  );
}

export const VirtualList = forwardRef<VirtualListRef, VirtualListProps<string>>((props, ref) => (
  <VirtualListInner {...props} forwardedRef={ref} />
)) as <T extends { getId(): string } | string>(props: VirtualListProps<T> & { ref?: ForwardedRef<VirtualListRef> }) => JSX.Element;

interface RowData<T extends { getId(): string } | string> {
  items: T[];
  getRow?: (uid: T extends string ? number : string) => React.ReactElement<TableRowProps<T>>;
}

export interface RowProps<T extends { getId(): string } | string> extends ListChildComponentProps {
  data: RowData<T>;
}

const Row = observer(<T extends { getId(): string } | string>(props: RowProps<T>) => {
  const { index, style, data } = props;
  const { items, getRow } = data;
  const item = items[index];
  const row = getRow?.((
    typeof item == "string"
      ? index
      : item.getId()
  ) as never);

  if (!row) return null;

  return React.cloneElement(row, {
    style: Object.assign({}, row.props.style, style),
  });
});
