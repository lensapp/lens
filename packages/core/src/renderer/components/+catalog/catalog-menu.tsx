/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import treeStyles from "./catalog-tree.module.scss";
import styles from "./catalog-menu.module.scss";

import React from "react";
import type { TreeItemProps } from "@material-ui/lab";
import { TreeItem, TreeView } from "@material-ui/lab";
import { Icon } from "../icon";
import { StylesProvider } from "@material-ui/core";
import { cssNames } from "../../utils";
import type { CatalogCategory } from "../../api/catalog-entity";
import { observer } from "mobx-react";
import { CatalogCategoryLabel } from "./catalog-category-label";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import filteredCategoriesInjectable from "../../../common/catalog/filtered-categories.injectable";

export interface CatalogMenuProps {
  activeTab: string | undefined;
  onItemClick: (id: string) => void;
}

function getCategoryIcon(category: CatalogCategory) {
  const { icon } = category.metadata ?? {};

  if (typeof icon === "string") {
    return Icon.isSvg(icon)
      ? <Icon small svg={icon}/>
      : <Icon small material={icon}/>;
  }

  return null;
}

function Item(props: TreeItemProps) {
  return (
    <TreeItem classes={treeStyles} {...props}/>
  );
}

interface Dependencies {
  filteredCategories: IComputedValue<CatalogCategory[]>;
}

const NonInjectedCatalogMenu = observer(({
  activeTab,
  filteredCategories,
  onItemClick,
}: CatalogMenuProps & Dependencies) => (
  // Overwrite Material UI styles with injectFirst https://material-ui.com/guides/interoperability/#controlling-priority-4
  <StylesProvider injectFirst>
    <div className="flex flex-col w-full">
      <div className={styles.catalog}>Catalog</div>
      <TreeView
        defaultExpanded={["catalog"]}
        defaultCollapseIcon={<Icon material="expand_more" />}
        defaultExpandIcon={<Icon material="chevron_right" />}
        selected={activeTab || "browse"}
      >
        <Item
          nodeId="browse"
          label="Browse"
          data-testid="*-tab"
          onClick={() => onItemClick("*")} />
        <Item
          nodeId="catalog"
          label={<div className={styles.parent}>Categories</div>}
          className={cssNames(styles.bordered)}
        >
          {
            filteredCategories.get()
              .map(category => (
                <Item
                  icon={getCategoryIcon(category)}
                  key={category.getId()}
                  nodeId={category.getId()}
                  label={<CatalogCategoryLabel category={category} />}
                  data-testid={`${category.getId()}-tab`}
                  onClick={() => onItemClick(category.getId())} />
              ))
          }
        </Item>
      </TreeView>
    </div>
  </StylesProvider>
));

export const CatalogMenu = withInjectables<Dependencies, CatalogMenuProps>(NonInjectedCatalogMenu, {
  getProps: (di, props) => ({
    ...props,
    filteredCategories: di.inject(filteredCategoriesInjectable),
  }),
});
