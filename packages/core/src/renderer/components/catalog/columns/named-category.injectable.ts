/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import styles from "../catalog.module.scss";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import renderNamedCategoryColumnCellInjectable from "./render-named-category-column-cell.injectable";

const namedCategoryColumnInjectable = getInjectable({
  id: "name-category-column",
  instantiate: (di): RegisteredAdditionalCategoryColumn => ({
    id: "name",
    priority: 0,
    renderCell: di.inject(renderNamedCategoryColumnCellInjectable),
    titleProps: {
      title: "Name",
      className: styles.entityName,
      id: "name",
      sortBy: "name",
    },
    searchFilter: (entity) => entity.getName(),
    sortCallback: (entity) => `name=${entity.getName()}`,
  }),
});

export default namedCategoryColumnInjectable;
