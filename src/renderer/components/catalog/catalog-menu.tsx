/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import treeStyles from "./catalog-tree.module.css";
import styles from "./catalog-menu.module.css";

import React from "react";
import { TreeItem, TreeItemProps, TreeView } from "@material-ui/lab";
import { catalogCategoryRegistry } from "../../api/catalog-category-registry";
import { Icon } from "../icon";
import { StylesProvider } from "@material-ui/core";
import { cssNames } from "../../utils";
import type { CatalogCategory } from "../../api/catalog-entity";

type Props = {
  activeItem: string;
  onItemClick: (id: string) => void;
};

function getCategories() {
  return catalogCategoryRegistry.items;
}

function getCategoryIcon(category: CatalogCategory) {
  if (!category.metadata?.icon) return null;

  return category.metadata.icon.includes("<svg")
    ? <Icon small svg={category.metadata.icon}/>
    : <Icon small material={category.metadata.icon}/>;
}

function Item(props: TreeItemProps) {
  return (
    <TreeItem classes={treeStyles} {...props}/>
  );
}

export function CatalogMenu(props: Props) {
  return (
    // Overwrite Material UI styles with injectFirst https://material-ui.com/guides/interoperability/#controlling-priority-4
    <StylesProvider injectFirst>
      <div className="flex flex-col w-full">
        <TreeView
          defaultExpanded={["catalog"]}
          defaultCollapseIcon={<Icon material="expand_more"/>}
          defaultExpandIcon={<Icon material="chevron_right" />}
          selected={props.activeItem || "browse"}
        >
          <Item nodeId="browse" label="Browse" data-testid="*-tab" onClick={() => props.onItemClick("*")}/>
          <Item
            nodeId="catalog"
            label={<div className={styles.parent}>Categories</div>}
            className={cssNames(styles.bordered)}
          >
            {
              getCategories().map(category => (
                <Item
                  icon={getCategoryIcon(category)}
                  key={category.getId()}
                  nodeId={category.getId()}
                  label={category.metadata.name}
                  data-testid={`${category.getId()}-tab`}
                  onClick={() => props.onItemClick(category.getId())}
                />
              ))
            }
          </Item>
        </TreeView>
      </div>
    </StylesProvider>
  );
}
