/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";
import type { HeaderPlaceholders } from "./list-layout";

interface ItemListLayoutHeaderTitleProps {
  renderHeaderTitle: React.ReactNode | (() => React.ReactNode);
  headerPlaceholders: HeaderPlaceholders;
}

export const ItemListLayoutHeaderTitle = observer(({ renderHeaderTitle, headerPlaceholders }: ItemListLayoutHeaderTitleProps) => {
  if (headerPlaceholders.title) {
    return <>{headerPlaceholders.title}</>;
  }

  const title =
    typeof renderHeaderTitle === "function"
      ? renderHeaderTitle()
      : renderHeaderTitle;

  return <h5 className="title">{title}</h5>;
});
