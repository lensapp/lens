/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { identity, map } from "lodash/fp";
import React from "react";
import type { GetSeparator } from "../../../common/utils/add-separator/add-separator";
import { addSeparator } from "../../../common/utils/add-separator/add-separator";

interface RequiredPropertiesForItem {
  id: string;
}

interface MapProps<Item extends RequiredPropertiesForItem> {
  items: Item[];
  children: (item: Item) => React.ReactElement;
  getPlaceholder?: () => React.ReactElement;
  getSeparator?: GetSeparator<Item, React.ReactElement>;
}

export const Map = <Item extends RequiredPropertiesForItem>(
  props: MapProps<Item>,
) => {
  const { items, getPlaceholder, getSeparator, children } = props;

  if (items.length === 0) {
    return getPlaceholder?.() || null;
  }

  return (
    <>
      {pipeline(
        items,

        map((item) => ({ item, render: () => children(item) })),

        getSeparator
          ? (items) =>
            addSeparator(
              (left, right) => ({
                item: {
                  id: `separator-between-${left.item.id}-and-${right.item.id}`,
                },

                render: () => getSeparator(left.item, right.item),
              }),

              items,
            )
          : identity,

        map(({ render, item }) => (
          <React.Fragment key={item.id}>{render()}</React.Fragment>
        )),
      )}
    </>
  );
};
