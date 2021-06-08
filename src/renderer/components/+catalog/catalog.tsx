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
import { kebabCase } from "lodash";
import { MenuItem, MenuActions } from "../menu";
import type { CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../api/catalog-entity";
import { Badge } from "../badge";
import { HotbarStore } from "../../../common/hotbar-store";
import { ConfirmDialog } from "../confirm-dialog";
import { Tab, Tabs } from "../tabs";
import { catalogCategoryRegistry } from "../../../common/catalog";
import { CatalogAddButton } from "./catalog-add-button";
import type { RouteComponentProps } from "react-router";
import type { ICatalogViewRouteParam } from "./catalog.route";
import { Notifications } from "../notifications";
import { Avatar } from "../avatar/avatar";
import { MainLayout } from "../layout/main-layout";
import { cssNames } from "../../utils";
import { TopBar } from "../layout/topbar";
import { welcomeURL } from "../+welcome";
import { Icon } from "../icon";
import { MaterialTooltip } from "../material-tooltip/material-tooltip";
import { CatalogEntityDetails } from "./catalog-entity-details";

enum sortBy {
  name = "name",
  kind = "kind",
  source = "source",
  status = "status"
}

interface Props extends RouteComponentProps<ICatalogViewRouteParam> {}

@observer
export class Catalog extends React.Component<Props> {
  @observable private catalogEntityStore?: CatalogEntityStore;
  @observable private contextMenu: CatalogEntityContextMenuContext;
  @observable activeTab?: string;
  @observable selectedItem?: CatalogEntityItem;

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
      menuItems: [],
      navigate: (url: string) => navigate(url)
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

  addToHotbar(item: CatalogEntityItem): void {
    HotbarStore.getInstance().addToHotbar(item.entity);
  }

  onDetails(item: CatalogEntityItem) {
    this.selectedItem = item;
  }

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
    return (
      <Tabs className={cssNames(styles.tabs, "flex column")} scrollable={false} onChange={this.onTabChange} value={this.activeTab}>
        <div>
          <Tab
            value={undefined}
            key="*"
            label="Browse"
            data-testid="*-tab"
            className={cssNames(styles.tab, { [styles.activeTab]: this.activeTab == null })}
          />
          {
            this.categories.map(category => (
              <Tab
                value={category.getId()}
                key={category.getId()}
                label={category.metadata.name}
                data-testid={`${category.getId()}-tab`}
                className={cssNames(styles.tab, { [styles.activeTab]: this.activeTab == category.getId() })}
              />
            ))
          }
        </div>
      </Tabs>
    );
  }

  renderItemMenu = (item: CatalogEntityItem) => {
    const menuItems = this.contextMenu.menuItems.filter((menuItem) => !menuItem.onlyVisibleForSource || menuItem.onlyVisibleForSource === item.entity.metadata.source);

    return (
      <MenuActions onOpen={() => item.onContextMenuOpen(this.contextMenu)}>
        {
          menuItems.map((menuItem, index) => (
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

  renderIcon(item: CatalogEntityItem) {
    return (
      <Avatar
        title={item.name}
        colorHash={`${item.name}-${item.source}`}
        width={24}
        height={24}
        className={styles.catalogIcon}
      />
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
          [sortBy.name]: (item: CatalogEntityItem) => item.name,
          [sortBy.source]: (item: CatalogEntityItem) => item.source,
          [sortBy.status]: (item: CatalogEntityItem) => item.phase,
        }}
        searchFilters={[
          (entity: CatalogEntityItem) => entity.searchFields,
        ]}
        renderTableHeader={[
          { title: "", className: styles.iconCell },
          { title: "Name", className: styles.nameCell, sortBy: sortBy.name },
          { title: "Source", className: styles.sourceCell, sortBy: sortBy.source },
          { title: "Labels", className: styles.labelsCell },
          { title: "Status", className: styles.statusCell, sortBy: sortBy.status },
        ]}
        renderTableContents={(item: CatalogEntityItem) => [
          this.renderIcon(item),
          item.name,
          item.source,
          item.labels.map((label) => <Badge key={label} label={label} title={label} />),
          { title: item.phase, className: kebabCase(item.phase) }
        ]}
        onDetails={(item: CatalogEntityItem) => this.onDetails(item) }
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
          [sortBy.name]: (item: CatalogEntityItem) => item.name,
          [sortBy.kind]: (item: CatalogEntityItem) => item.kind,
          [sortBy.source]: (item: CatalogEntityItem) => item.source,
          [sortBy.status]: (item: CatalogEntityItem) => item.phase,
        }}
        searchFilters={[
          (entity: CatalogEntityItem) => entity.searchFields,
        ]}
        renderTableHeader={[
          { title: "", className: styles.iconCell },
          { title: "Name", className: styles.nameCell, sortBy: sortBy.name },
          { title: "Source", className: styles.sourceCell, sortBy: sortBy.source },
          { title: "Labels", className: styles.labelsCell },
          { title: "Status", className: styles.statusCell, sortBy: sortBy.status },
        ]}
        renderTableContents={(item: CatalogEntityItem) => [
          this.renderIcon(item),
          item.name,
          item.kind,
          item.source,
          item.labels.map((label) => <Badge key={label} label={label} title={label} />),
          { title: item.phase, className: kebabCase(item.phase) }
        ]}
        detailsItem={this.selectedItem}
        onDetails={(item: CatalogEntityItem) => this.onDetails(item) }
        renderItemMenu={this.renderItemMenu}
      />
    );
  }

  render() {
    if (!this.catalogEntityStore) {
      return null;
    }

    return (
      <>
        <TopBar label="Catalog">
          <div>
            <MaterialTooltip title="Close Catalog" placement="left">
              <Icon style={{ cursor: "default" }} material="close" onClick={() => navigate(welcomeURL())}/>
            </MaterialTooltip>
          </div>
        </TopBar>
        <MainLayout sidebar={this.renderNavigation()}>
          <div className="p-6 h-full">
            { this.catalogEntityStore.activeCategory ? this.renderSingleCategoryList() : this.renderAllCategoriesList() }
          </div>
          { !this.selectedItem && (
            <CatalogAddButton category={this.catalogEntityStore.activeCategory} />
          )}
          { this.selectedItem && (
            <CatalogEntityDetails
              entity={this.selectedItem.entity}
              hideDetails={() => this.selectedItem = null}
            />
          )}
        </MainLayout>
      </>
    );
  }
}
