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

import styles from "./catalog.module.css";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import { action, makeObservable, observable, reaction, when } from "mobx";
import { CatalogEntityItem, CatalogEntityStore } from "./catalog-entity.store";
import { navigate } from "../../navigation";
import { MenuItem, MenuActions } from "../menu";
import type { CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../api/catalog-entity";
import { HotbarStore } from "../../../common/hotbar-store";
import { ConfirmDialog } from "../confirm-dialog";
import { catalogCategoryRegistry, CatalogEntity } from "../../../common/catalog";
import { CatalogAddButton } from "./catalog-add-button";
import type { RouteComponentProps } from "react-router";
import { Notifications } from "../notifications";
import { MainLayout } from "../layout/main-layout";
import { cssNames } from "../../utils";
import { makeCss } from "../../../common/utils/makeCss";
import { CatalogEntityDetails } from "./catalog-entity-details";
import { catalogURL, CatalogViewRouteParam } from "../../../common/routes";
import { CatalogMenu } from "./catalog-menu";
import { HotbarIcon } from "../hotbar/hotbar-icon";

enum sortBy {
  name = "name",
  kind = "kind",
  source = "source",
  status = "status"
}

const css = makeCss(styles);

interface Props extends RouteComponentProps<CatalogViewRouteParam> {}
@observer
export class Catalog extends React.Component<Props> {
  @observable private catalogEntityStore?: CatalogEntityStore;
  @observable private contextMenu: CatalogEntityContextMenuContext;
  @observable activeTab?: string;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  get routeActiveTab(): string | undefined {
    const { group, kind } = this.props.match.params ?? {};

    if (group && kind) {
      return `${group}/${kind}`;
    }

    return undefined;
  }

  async componentDidMount() {
    this.contextMenu = {
      menuItems: observable.array([]),
      navigate: (url: string) => navigate(url),
    };
    this.catalogEntityStore = new CatalogEntityStore();
    disposeOnUnmount(this, [
      this.catalogEntityStore.watch(),
      reaction(() => this.routeActiveTab, async (routeTab) => {
        await when(() => catalogCategoryRegistry.items.length > 0);
        const item = catalogCategoryRegistry.items.find(i => i.getId() === routeTab);

        if (item || routeTab === undefined) {
          this.activeTab = routeTab;
          this.catalogEntityStore.activeCategory = item;
        } else {
          Notifications.error(<p>Unknown category: {routeTab}</p>);
        }
      }, {fireImmediately: true}),
    ]);
  }

  addToHotbar(item: CatalogEntityItem<CatalogEntity>): void {
    HotbarStore.getInstance().addToHotbar(item.entity);
  }

  onDetails = (item: CatalogEntityItem<CatalogEntity>) => {
    this.catalogEntityStore.selectedItemId = item.getId();
  };

  onMenuItemClick(menuItem: CatalogEntityContextMenu) {
    if (menuItem.confirm) {
      ConfirmDialog.open({
        okButtonProps: {
          primary: false,
          accent: true,
        },
        ok: () => {
          menuItem.onClick();
        },
        message: menuItem.confirm.message
      });
    } else {
      menuItem.onClick();
    }
  }

  get categories() {
    return catalogCategoryRegistry.items;
  }

  @action
  onTabChange = (tabId: string | null) => {
    const activeCategory = this.categories.find(category => category.getId() === tabId);

    if (activeCategory) {
      navigate(catalogURL({ params: {group: activeCategory.spec.group, kind: activeCategory.spec.names.kind }}));
    } else {
      navigate(catalogURL());
    }
  };

  renderNavigation() {
    return <CatalogMenu activeItem={this.activeTab} onItemClick={this.onTabChange}/>;
  }

  renderItemMenu = (item: CatalogEntityItem<CatalogEntity>) => {
    const onOpen = () => {
      this.contextMenu.menuItems = [];

      item.onContextMenuOpen(this.contextMenu);
    };

    return (
      <MenuActions onOpen={onOpen}>
        {
          this.contextMenu.menuItems.map((menuItem, index) => (
            <MenuItem key={index} onClick={() => this.onMenuItemClick(menuItem)}>
              {menuItem.title}
            </MenuItem>
          ))
        }
        <MenuItem key="add-to-hotbar" onClick={() => this.addToHotbar(item) }>
          Pin to Hotbar
        </MenuItem>
      </MenuActions>
    );
  };

  renderIcon(item: CatalogEntityItem<CatalogEntity>) {
    return (
      <HotbarIcon
        uid={item.getId()}
        title={item.getName()}
        source={item.source}
        src={item.entity.spec.icon?.src}
        material={item.entity.spec.icon?.material}
        background={item.entity.spec.icon?.background}
        onClick={() => this.onDetails(item)}
        size={24}
      />
    );
  }

  renderSingleCategoryList() {
    return (
      <ItemListLayout
        key={this.catalogEntityStore.activeCategory.getId()}
        tableId={`catalog-items-${this.catalogEntityStore.activeCategory?.metadata.name.replace(" ", "")}`}
        renderHeaderTitle={this.catalogEntityStore.activeCategory?.metadata.name}
        isSelectable={false}
        isConfigurable={true}
        className="CatalogItemList"
        store={this.catalogEntityStore}
        sortingCallbacks={{
          [sortBy.name]: (item: CatalogEntityItem<CatalogEntity>) => item.name,
          [sortBy.source]: (item: CatalogEntityItem<CatalogEntity>) => item.source,
          [sortBy.status]: (item: CatalogEntityItem<CatalogEntity>) => item.phase,
        }}
        searchFilters={[
          (entity: CatalogEntityItem<CatalogEntity>) => entity.searchFields,
        ]}
        renderTableHeader={[
          { title: "", className: css.iconCell, id: "icon" },
          { title: "Name", className: css.nameCell, sortBy: sortBy.name, id: "name" },
          { title: "Source", className: css.sourceCell, sortBy: sortBy.source, id: "source" },
          { title: "Labels", className: css.labelsCell, id: "labels" },
          { title: "Status", className: css.statusCell, sortBy: sortBy.status, id: "status" },
        ]}
        customizeTableRowProps={(item: CatalogEntityItem<CatalogEntity>) => ({
          disabled: !item.enabled,
        })}
        renderTableContents={(item: CatalogEntityItem<CatalogEntity>) => [
          this.renderIcon(item),
          item.name,
          item.source,
          item.getLabelBadges(),
          { title: item.phase, className: cssNames(css[item.phase]) }
        ]}
        onDetails={this.onDetails}
        renderItemMenu={this.renderItemMenu}
      />
    );
  }

  renderAllCategoriesList() {
    return (
      <ItemListLayout
        key="all"
        renderHeaderTitle={"Browse All"}
        isSelectable={false}
        isConfigurable={true}
        className="CatalogItemList"
        store={this.catalogEntityStore}
        tableId="catalog-items"
        sortingCallbacks={{
          [sortBy.name]: (item: CatalogEntityItem<CatalogEntity>) => item.name,
          [sortBy.kind]: (item: CatalogEntityItem<CatalogEntity>) => item.kind,
          [sortBy.source]: (item: CatalogEntityItem<CatalogEntity>) => item.source,
          [sortBy.status]: (item: CatalogEntityItem<CatalogEntity>) => item.phase,
        }}
        searchFilters={[
          (entity: CatalogEntityItem<CatalogEntity>) => entity.searchFields,
        ]}
        renderTableHeader={[
          { title: "", className: css.iconCell, id: "icon" },
          { title: "Name", className: css.nameCell, sortBy: sortBy.name, id: "name" },
          { title: "Kind", className: css.kindCell, sortBy: sortBy.kind, id: "kind" },
          { title: "Source", className: css.sourceCell, sortBy: sortBy.source, id: "source" },
          { title: "Labels", className: css.labelsCell, id: "labels" },
          { title: "Status", className: css.statusCell, sortBy: sortBy.status, id: "status" },
        ]}
        customizeTableRowProps={(item: CatalogEntityItem<CatalogEntity>) => ({
          disabled: !item.enabled,
        })}
        renderTableContents={(item: CatalogEntityItem<CatalogEntity>) => [
          this.renderIcon(item),
          item.name,
          item.kind,
          item.source,
          item.getLabelBadges(),
          { title: item.phase, className: cssNames(css[item.phase]) }
        ]}
        detailsItem={this.catalogEntityStore.selectedItem}
        onDetails={this.onDetails}
        renderItemMenu={this.renderItemMenu}
      />
    );
  }

  render() {
    if (!this.catalogEntityStore) {
      return null;
    }

    return (
      <MainLayout sidebar={this.renderNavigation()}>
        <div className="p-6 h-full">
          { this.catalogEntityStore.activeCategory ? this.renderSingleCategoryList() : this.renderAllCategoriesList() }
        </div>
        {
          this.catalogEntityStore.selectedItem
            ? <CatalogEntityDetails
              item={this.catalogEntityStore.selectedItem}
              hideDetails={() => this.catalogEntityStore.selectedItemId = null}
            />
            : <CatalogAddButton 
              category={this.catalogEntityStore.activeCategory} 
            />
        }
      </MainLayout>
    );
  }
}
