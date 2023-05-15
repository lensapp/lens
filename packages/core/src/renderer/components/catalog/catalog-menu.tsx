/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import treeStyles from "./catalog-tree.module.scss";
import styles from "./catalog-menu.module.scss";

import React from "react";
import { Icon } from "@k8slens/icon";
import type { CatalogCategory } from "../../api/catalog-entity";
import { observer } from "mobx-react";
import { CatalogCategoryLabel } from "./catalog-category-label";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import filteredCategoriesInjectable from "../../../common/catalog/filtered-categories.injectable";
import { TreeGroup, TreeItem, TreeView } from "../tree-view/tree-view";
import { browseCatalogTab } from "./catalog-browse-tab";
import { HorizontalLine } from "../horizontal-line/horizontal-line";

export interface CatalogMenuProps {
  activeTab: string | undefined;
  onItemClick: (id: string) => void;
}

function CategoryIcon(props: { category: CatalogCategory }) {
  const { icon } = props.category.metadata ?? {};

  if (typeof icon === "string") {
    return Icon.isSvg(icon)
      ? <Icon small svg={icon}/>
      : <Icon small material={icon}/>;
  }

  return null;
}

interface Dependencies {
  filteredCategories: IComputedValue<CatalogCategory[]>;
}

const NonInjectedCatalogMenu = observer(({
  activeTab,
  filteredCategories,
  onItemClick,
}: CatalogMenuProps & Dependencies) => (
  <div className="flex flex-col w-full">
    <div className={styles.catalog}>Catalog</div>
    <TreeView>
      <TreeItem
        classes={treeStyles}
        label="Browse"
        data-testid="*-tab"
        onClick={() => onItemClick("*")}
        selected={activeTab === browseCatalogTab}
      />
      <HorizontalLine size="xxs" />
      <TreeGroup
        classes={treeStyles}
        label={<div className={styles.parent}>Categories</div>}
      >
        {filteredCategories.get()
          .map(category => (
            <TreeItem
              classes={treeStyles}
              key={category.getId()}
              icon={<CategoryIcon category={category} />}
              label={<CatalogCategoryLabel category={category} />}
              selected={activeTab === category.getId()}
              data-testid={`${category.getId()}-tab`}
              onClick={() => onItemClick(category.getId())}
            />
          ))}
      </TreeGroup>
    </TreeView>
  </div>
));

export const CatalogMenu = withInjectables<Dependencies, CatalogMenuProps>(NonInjectedCatalogMenu, {
  getProps: (di, props) => ({
    ...props,
    filteredCategories: di.inject(filteredCategoriesInjectable),
  }),
});
