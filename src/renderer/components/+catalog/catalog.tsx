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
import { action, makeObservable, observable, reaction, runInAction, when } from "mobx";
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
import { createAppStorage, cssNames } from "../../utils";
import { makeCss } from "../../../common/utils/makeCss";
import { CatalogEntityDetails } from "./catalog-entity-details";
import { catalogURL, CatalogViewRouteParam } from "../../../common/routes";
import { CatalogMenu } from "./catalog-menu";
import { HotbarIcon } from "../hotbar/hotbar-icon";
import { RenderDelay } from "../render-delay/render-delay";
import { CatalogTopbar } from "../cluster-manager/catalog-topbar";

export const previousActiveTab = createAppStorage("catalog-previous-active-tab", "");

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
    this.catalogEntityStore = new CatalogEntityStore();
  }

  get routeActiveTab(): string {
    const { group, kind } = this.props.match.params ?? {};

    if (group && kind) {
      return `${group}/${kind}`;
    }

    return "";
  }

  async componentDidMount() {
    this.contextMenu = {
      menuItems: observable.array([]),
      navigate: (url: string) => navigate(url),
    };
    disposeOnUnmount(this, [
      this.catalogEntityStore.watch(),
      reaction(() => this.routeActiveTab, async (routeTab) => {
        previousActiveTab.set(this.routeActiveTab);

        try {
          await when(() => (routeTab === "" || !!catalogCategoryRegistry.items.find(i => i.getId() === routeTab)), { timeout: 5_000 }); // we need to wait because extensions might take a while to load
          const item = catalogCategoryRegistry.items.find(i => i.getId() === routeTab);

          runInAction(() => {
            this.activeTab = routeTab;
            this.catalogEntityStore.activeCategory = item;
          });
        } catch(error) {
          console.error(error);
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
    return (
      <CatalogMenu activeItem={this.activeTab} onItemClick={this.onTabChange}/>
    );
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
        <MenuItem key="add-to-hotbar" onClick={() => this.addToHotbar(item)}>
          Pin to Hotbar
        </MenuItem>
      </MenuActions>
    );
  };

  renderIcon(item: CatalogEntityItem<CatalogEntity>) {
    return (
      <RenderDelay>
        <HotbarIcon
          uid={`catalog-icon-${item.getId()}`}
          title={item.getName()}
          source={item.source}
          src={item.entity.spec.icon?.src}
          material={item.entity.spec.icon?.material}
          background={item.entity.spec.icon?.background}
          size={24}
        />
      </RenderDelay>
    );
  }

  renderList() {
    const { activeCategory } = this.catalogEntityStore;
    const tableId = activeCategory ? `catalog-items-${activeCategory.metadata.name.replace(" ", "")}` : "catalog-items";

    if (this.activeTab === undefined) {
      return null;
    }

    return (
      <ItemListLayout
        tableId={tableId}
        renderHeaderTitle={activeCategory?.metadata.name || "Browse All"}
        isSelectable={false}
        isConfigurable={true}
        className="CatalogItemList"
        store={this.catalogEntityStore}
        sortingCallbacks={{
          [sortBy.name]: item => item.name,
          [sortBy.source]: item => item.source,
          [sortBy.status]: item => item.phase,
          [sortBy.kind]: item => item.kind,
        }}
        searchFilters={[
          entity => entity.searchFields,
        ]}
        renderTableHeader={[
          { title: "", className: css.iconCell, id: "icon" },
          { title: "Name", className: css.nameCell, sortBy: sortBy.name, id: "name" },
          !activeCategory && { title: "Kind", className: css.kindCell, sortBy: sortBy.kind, id: "kind" },
          { title: "Source", className: css.sourceCell, sortBy: sortBy.source, id: "source" },
          { title: "Labels", className: css.labelsCell, id: "labels" },
          { title: "Status", className: css.statusCell, sortBy: sortBy.status, id: "status" },
        ].filter(Boolean)}
        customizeTableRowProps={item => ({
          disabled: !item.enabled,
        })}
        renderTableContents={item => [
          this.renderIcon(item),
          item.name,
          !activeCategory && item.kind,
          item.source,
          item.getLabelBadges(),
          { title: item.phase, className: cssNames(css[item.phase]) }
        ].filter(Boolean)}
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
      <>
        <CatalogTopbar/>
        <MainLayout sidebar={this.renderNavigation()}>
          <div className="p-6 h-full">
            { this.renderList() }
          </div>
          {
            this.catalogEntityStore.selectedItem
              ? <CatalogEntityDetails
                item={this.catalogEntityStore.selectedItem}
                hideDetails={() => this.catalogEntityStore.selectedItemId = null}
              />
              : (
                <RenderDelay>
                  <CatalogAddButton
                    category={this.catalogEntityStore.activeCategory}
                  />
                </RenderDelay>
              )
          }
        </MainLayout>
      </>
    );
  }
}
