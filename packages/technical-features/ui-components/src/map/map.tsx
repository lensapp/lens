import { pipeline } from "@ogre-tools/fp";
import { identity, map } from "lodash/fp";
import React from "react";
import { addSeparator, GetSeparator } from "@k8slens/utilities";

interface RequiredPropertiesForItem {
  id: string;
}

export interface MapProps<Item extends RequiredPropertiesForItem> {
  items: Item[];
  children: (item: Item) => React.ReactElement;
  getPlaceholder?: () => React.ReactElement;
  getSeparator?: GetSeparator<Item, React.ReactElement>;
}

export const Map = <Item extends RequiredPropertiesForItem>(props: MapProps<Item>) => {
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

        map(({ render, item }) => <React.Fragment key={item.id}>{render()}</React.Fragment>),
      )}
    </>
  );
};
