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
import { Badge } from "../badge";
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
import type { CatalogViewRouteParam } from "../../../common/routes";
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
      when(() => catalogCategoryRegistry.items.length > 0, () => {
        const item = catalogCategoryRegistry.items.find(i => i.getId() === this.routeActiveTab);

        if (item || this.routeActiveTab === undefined) {
          this.activeTab = this.routeActiveTab;
          this.catalogEntityStore.activeCategory = item;
        } else {
          Notifications.error(<p>Unknown category: {this.routeActiveTab}</p>);
        }
      }),
      reaction(() => catalogCategoryRegistry.items, (items) => {
        if (!this.activeTab && items.length > 0) {
          this.activeTab = items[0].getId();
          this.catalogEntityStore.activeCategory = items[0];
        }
      }),
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

    this.catalogEntityStore.activeCategory = activeCategory;
    this.activeTab = activeCategory?.getId();
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
        icon={item.entity.spec.iconData}
        onClick={() => this.onDetails(item)}
        size={24} />
    );
  }

  renderSingleCategoryList() {
    return (
      <ItemListLayout
        renderHeaderTitle={this.catalogEntityStore.activeCategory?.metadata.name ?? "Browse All"}
        isSelectable={false}
        className="CatalogItemList"
        store={this.catalogEntityStore}
        tableId="catalog-items"
        sortingCallbacks={{
          [sortBy.name]: (item: CatalogEntityItem<CatalogEntity>) => item.name,
          [sortBy.source]: (item: CatalogEntityItem<CatalogEntity>) => item.source,
          [sortBy.status]: (item: CatalogEntityItem<CatalogEntity>) => item.phase,
        }}
        searchFilters={[
          (entity: CatalogEntityItem<CatalogEntity>) => entity.searchFields,
        ]}
        renderTableHeader={[
          { title: "", className: css.iconCell },
          { title: "Name", className: css.nameCell, sortBy: sortBy.name },
          { title: "Source", className: css.sourceCell, sortBy: sortBy.source },
          { title: "Labels", className: css.labelsCell },
          { title: "Status", className: css.statusCell, sortBy: sortBy.status },
        ]}
        customizeTableRowProps={(item: CatalogEntityItem<CatalogEntity>) => ({
          disabled: !item.enabled,
        })}
        renderTableContents={(item: CatalogEntityItem<CatalogEntity>) => [
          this.renderIcon(item),
          item.name,
          item.source,
          item.labels.map((label) => <Badge className={css.badge} key={label} label={label} title={label} />),
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
        renderHeaderTitle={this.catalogEntityStore.activeCategory?.metadata.name ?? "Browse All"}
        isSelectable={false}
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
          { title: "", className: css.iconCell },
          { title: "Name", className: css.nameCell, sortBy: sortBy.name },
          { title: "Kind", className: css.kindCell, sortBy: sortBy.kind },
          { title: "Source", className: css.sourceCell, sortBy: sortBy.source },
          { title: "Labels", className: css.labelsCell },
          { title: "Status", className: css.statusCell, sortBy: sortBy.status },
        ]}
        customizeTableRowProps={(item: CatalogEntityItem<CatalogEntity>) => ({
          disabled: !item.enabled,
        })}
        renderTableContents={(item: CatalogEntityItem<CatalogEntity>) => [
          this.renderIcon(item),
          item.name,
          item.kind,
          item.source,
          item.labels.map((label) => <Badge className={css.badge} key={label} label={label} title={label} />),
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
            ? (
              <CatalogEntityDetails
                item={this.catalogEntityStore.selectedItem}
                hideDetails={() => this.catalogEntityStore.selectedItemId = null}
              />
            )
            : (
              <CatalogAddButton category = {this.catalogEntityStore.activeCategory} />
            )
        }
      </MainLayout>
    );
  }
}
