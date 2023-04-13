/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type GetSeparator<Item, Separator> = (left: Item, right: Item) => Separator;

export const addSeparator = <Item, Separator>(
  getSeparator: GetSeparator<Item, Separator>,
  items: Item[],
) => items.flatMap(toSeparatedTupleUsing(getSeparator));

const toSeparatedTupleUsing =
  <Item, Separator>(getSeparator: GetSeparator<Item, Separator>) =>
    (leftItem: Item, index: number, arr: Item[]) => {
      const itemIsLast = arr.length === index + 1;

      if (itemIsLast) {
        return [leftItem];
      }

      const rightItem = arr[index + 1];
      const separator = getSeparator(leftItem, rightItem);

      return [leftItem, separator];
    };
