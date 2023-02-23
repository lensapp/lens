/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import treeStyles from "./catalog-tree.module.scss";
import styles from "./catalog-menu.module.scss";

import type { MouseEventHandler } from "react";
import React from "react";
import { TreeItem, TreeView } from "@material-ui/lab";
import { Icon } from "../icon";
import { StylesProvider } from "@material-ui/core";
import type { CatalogCategory } from "../../api/catalog-entity";
import { observer } from "mobx-react";
import { CatalogCategoryLabel } from "./catalog-category-label";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import filteredCategoriesInjectable from "../../../common/catalog/filtered-categories.injectable";
import { cssNames } from "../../utils";

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

interface TreeItemEntryProps {
  tabIndex?: number;
  onClick?: MouseEventHandler;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  "data-testid"?: string;
}

const TreeItemEntry = (props: TreeItemEntryProps) => (
  <li
    className="MuiTreeItem-root"
    role="treeitem"
    tabIndex={props.tabIndex ?? -1}
    data-testid={props["data-testid"]}
    onClick={props.onClick}
  >
    <div
      className="MuiTreeItem-content"
    >
      <div
        className="MuiTreeItem-iconContainer"
      >
        {props.icon}
      </div>
    </div>
    <div
      className="MuiTypography-root MuiTreeItem-label MuiTypography-body1"
    >
      {props.label}
    </div>
  </li>
);

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
        <TreeItemEntry
          label="Browse"
          data-testid="*-tab"
          onClick={() => onItemClick("*")}
        />
        <TreeItem
          classes={treeStyles}
          nodeId="catalog"
          label={<div className={styles.parent}>Categories</div>}
          className={cssNames(styles.bordered)}
        >
          {
            filteredCategories.get()
              .map(category => (
                <TreeItemEntry
                  key={category.getId()}
                  icon={getCategoryIcon(category)}
                  label={<CatalogCategoryLabel category={category} />}
                  data-testid={`${category.getId()}-tab`}
                  onClick={() => onItemClick(category.getId())}
                />
              ))
          }
        </TreeItem>
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
