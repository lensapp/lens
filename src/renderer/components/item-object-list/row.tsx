/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { memo, ReactNode } from "react";

import { cssNames, isReactNode } from "../../utils";
import { TableCell, TableCellProps, TableRow } from "../table";

import type { ItemObject } from "../../../common/item.store";

interface RowProps<I extends ItemObject> {
  selected: boolean;
  checked?: boolean;
  renderTableHeader?: TableCellProps[];
  cells: (item: I) => (ReactNode | TableCellProps)[];
  itemMenu?: ReactNode;
  onCheckboxChange?: (evt: any) => void;
  onClick?: (evt: React.MouseEvent) => void;
  item: I;
  showColumn?: ({ id: columnId, showWithColumn }: TableCellProps) => boolean;
}

export const Row = memo(<I extends ItemObject>({
  selected,
  checked,
  renderTableHeader,
  cells,
  itemMenu,
  onCheckboxChange,
  onClick,
  item,
  showColumn,
  ...rest
}: RowProps<I>) => {
  return (
    <TableRow
      nowrap
      searchItem={item}
      sortItem={item}
      selected={selected}
      onClick={onClick}
      {...rest}
    >
      {onCheckboxChange && (
        <TableCell
          checkbox
          isChecked={checked}
          onClick={onCheckboxChange}
        />
      )}
      {cells(item).map((content, index) => {
        const cellProps: TableCellProps = isReactNode(content) ? { children: content } : content;
        const headCell = renderTableHeader?.[index];

        if (headCell) {
          cellProps.className = cssNames(cellProps.className, headCell.className);
        }

        if (!headCell || showColumn(headCell)) {
          return <TableCell key={index} {...cellProps} />;
        }

        return null;
      })}
      {itemMenu}
    </TableRow>
  );
});
