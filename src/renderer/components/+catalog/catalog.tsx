/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog.module.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import type { IComputedValue } from "mobx";
import { action, computed, makeObservable, observable, reaction, runInAction, when } from "mobx";
import type { CatalogEntityStore } from "./catalog-entity-store/catalog-entity.store";
import { navigate } from "../../navigation";
import { MenuItem, MenuActions } from "../menu";
import type { CatalogEntityContextMenu } from "../../api/catalog-entity";
import { ConfirmDialog } from "../confirm-dialog";
import type { CatalogCategory, CatalogCategoryRegistry, CatalogEntity } from "../../../common/catalog";
import { CatalogAddButton } from "./catalog-add-button";
import { Notifications } from "../notifications";
import { MainLayout } from "../layout/main-layout";
import { prevDefault } from "../../utils";
import { CatalogEntityDetails } from "./catalog-entity-details";
import { CatalogMenu } from "./catalog-menu";
import { RenderDelay } from "../render-delay/render-delay";
import { Icon } from "../icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import { Avatar } from "../avatar";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogPreviousActiveTabStorageInjectable from "./catalog-previous-active-tab-storage/catalog-previous-active-tab-storage.injectable";
import catalogEntityStoreInjectable from "./catalog-entity-store/catalog-entity-store.injectable";
import type { GetCategoryColumnsParams, CategoryColumns } from "./get-category-columns.injectable";
import getCategoryColumnsInjectable from "./get-category-columns.injectable";
import type { RegisteredCustomCategoryViewDecl } from "./custom-views.injectable";
import customCategoryViewsInjectable from "./custom-views.injectable";
import type { CustomCategoryViewComponents } from "./custom-views";
import type { NavigateToCatalog } from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import catalogRouteParametersInjectable from "./catalog-route-parameters.injectable";
import { browseCatalogTab } from "./catalog-browse-tab";
import type { AppEvent } from "../../../common/app-event-bus/event-bus";
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import hotbarStoreInjectable from "../../../common/hotbars/store.injectable";
import type { HotbarStore } from "../../../common/hotbars/store";
import type { OnContextMenuOpen } from "../../../common/catalog/on-context-menu-open.injectable";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import onContextMenuOpenInjectable from "../../../common/catalog/on-context-menu-open.injectable";

interface Dependencies {
  catalogPreviousActiveTabStorage: { set: (value: string ) => void; get: () => string };
  catalogEntityStore: CatalogEntityStore;
  getCategoryColumns: (params: GetCategoryColumnsParams) => CategoryColumns;
  customCategoryViews: IComputedValue<Map<string, Map<string, RegisteredCustomCategoryViewDecl>>>;
  emitEvent: (event: AppEvent) => void;
  routeParameters: {
    group: IComputedValue<string>;
    kind: IComputedValue<string>;
  };
  navigateToCatalog: NavigateToCatalog;
  hotbarStore: HotbarStore;
  catalogCategoryRegistry: CatalogCategoryRegistry;
  onContextMenuOpen: OnContextMenuOpen;
}

@observer
class NonInjectedCatalog extends React.Component<Dependencies> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();
  @observable activeTab?: string;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed
  get routeActiveTab(): string {
    const { group, kind } = this.props.routeParameters;

    const dereferencedGroup = group.get();
    const dereferencedKind = kind.get();

    if (dereferencedGroup && dereferencedKind) {
      return `${dereferencedGroup}/${dereferencedKind}`;
    }

    const previousTab = this.props.catalogPreviousActiveTabStorage.get();

    if (previousTab) {
      return previousTab;
    }

    return browseCatalogTab;
  }

  async componentDidMount() {
    const {
      catalogEntityStore,
      catalogPreviousActiveTabStorage,
      catalogCategoryRegistry,
    } = this.props;

    disposeOnUnmount(this, [
      catalogEntityStore.watch(),
      reaction(() => this.routeActiveTab, async (routeTab) => {
        catalogPreviousActiveTabStorage.set(this.routeActiveTab);

        try {
          await when(() => (routeTab === browseCatalogTab || !!catalogCategoryRegistry.filteredItems.find(i => i.getId() === routeTab)), { timeout: 5_000 }); // we need to wait because extensions might take a while to load
          const item = catalogCategoryRegistry.filteredItems.find(i => i.getId() === routeTab);

          runInAction(() => {
            this.activeTab = routeTab;
            catalogEntityStore.activeCategory.set(item);
          });
        } catch (error) {
          console.error(error);
          Notifications.error((
            <p>
              {"Unknown category: "}
              {routeTab}
            </p>
          ));
        }
      }, { fireImmediately: true }),
      // If active category is filtered out, automatically switch to the first category
      reaction(() => catalogCategoryRegistry.filteredItems, () => {
        if (!catalogCategoryRegistry.filteredItems.find(item => item.getId() === catalogEntityStore.activeCategory.get()?.getId())) {
          const item = catalogCategoryRegistry.filteredItems[0];

          runInAction(() => {
            if (item) {
              this.activeTab = item.getId();
              this.props.catalogEntityStore.activeCategory.set(item);
            }
          });
        }
      }),
    ]);

    this.props.emitEvent({
      name: "catalog",
      action: "open",
    });
  }

  addToHotbar(entity: CatalogEntity): void {
    this.props.hotbarStore.addToHotbar(entity);
  }

  removeFromHotbar(entity: CatalogEntity): void {
    this.props.hotbarStore.removeFromHotbar(entity.getId());
  }

  onDetails = (entity: CatalogEntity) => {
    if (this.props.catalogEntityStore.selectedItemId) {
      this.props.catalogEntityStore.selectedItemId.set(undefined);
    } else {
      this.props.catalogEntityStore.onRun(entity);
    }
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
        message: menuItem.confirm.message,
      });
    } else {
      menuItem.onClick();
    }
  }

  get categories() {
    return this.props.catalogCategoryRegistry.items;
  }

  onTabChange = action((tabId: string | null) => {
    const activeCategory = this.categories.find(category => category.getId() === tabId);

    this.props.emitEvent({
      name: "catalog",
      action: "change-category",
      params: {
        category: activeCategory ? activeCategory.getName() : "Browse",
      },
    });

    if (activeCategory) {
      this.props.catalogPreviousActiveTabStorage.set(`${activeCategory.spec.group}/${activeCategory.spec.names.kind}`);
      this.props.navigateToCatalog({ group: activeCategory.spec.group, kind: activeCategory.spec.names.kind });
    } else {
      this.props.catalogPreviousActiveTabStorage.set(null);
      this.props.navigateToCatalog({ group: browseCatalogTab });
    }
  });

  renderItemMenu = (entity: CatalogEntity) => {
    const onOpen = () => {
      this.menuItems.clear();
      this.props.onContextMenuOpen(entity, {
        menuItems: this.menuItems,
        navigate: (url) => navigate(url),
      });
    };

    return (
      <MenuActions onOpen={onOpen}>
        <MenuItem
          key="open-details"
          onClick={() => this.props.catalogEntityStore.selectedItemId.set(entity.getId())}
        >
          View Details
        </MenuItem>
        {
          this.menuItems.map((menuItem, index) => (
            <MenuItem key={index} onClick={() => this.onMenuItemClick(menuItem)}>
              {menuItem.title}
            </MenuItem>
          ))
        }
        <HotbarToggleMenuItem
          key="hotbar-toggle"
          entity={entity}
          addContent="Add to Hotbar"
          removeContent="Remove from Hotbar"
        />
      </MenuActions>
    );
  };

  renderName(entity: CatalogEntity) {
    const isItemInHotbar = this.props.hotbarStore.isAddedToActive(entity);

    return (
      <>
        <Avatar
          title={entity.getName()}
          colorHash={`${entity.getName()}-${entity.getSource()}`}
          src={entity.spec.icon?.src}
          background={entity.spec.icon?.background}
          className={styles.catalogAvatar}
          size={24}
        >
          {entity.spec.icon?.material && <Icon material={entity.spec.icon?.material} small/>}
        </Avatar>
        <span>{entity.getName()}</span>
        <Icon
          small
          className={styles.pinIcon}
          svg={isItemInHotbar ? "push_off" : "push_pin"}
          tooltip={isItemInHotbar ? "Remove from Hotbar" : "Add to Hotbar"}
          onClick={prevDefault(() => isItemInHotbar ? this.removeFromHotbar(entity) : this.addToHotbar(entity))}
        />
      </>
    );
  }

  renderViews = (activeCategory: CatalogCategory | undefined) => {
    if (!activeCategory) {
      return this.renderList(activeCategory);
    }

    const customViews = this.props.customCategoryViews.get()
      .get(activeCategory.spec.group)
      ?.get(activeCategory.spec.names.kind);
    const renderView = ({ View }: CustomCategoryViewComponents, index: number) => (
      <View
        key={index}
        category={activeCategory}
      />
    );

    return (
      <>
        {customViews?.before.map(renderView)}
        {this.renderList(activeCategory)}
        {customViews?.after.map(renderView)}
      </>
    );
  };

  renderList(activeCategory: CatalogCategory | undefined) {
    const { catalogEntityStore, getCategoryColumns } = this.props;
    const tableId = activeCategory
      ? `catalog-items-${activeCategory.metadata.name.replace(" ", "")}`
      : "catalog-items";

    if (this.activeTab === undefined) {
      return null;
    }

    return (
      <ItemListLayout<CatalogEntity, false>
        className={styles.Catalog}
        tableId={tableId}
        renderHeaderTitle={activeCategory?.metadata.name ?? "Browse All"}
        isSelectable={false}
        isConfigurable={true}
        preloadStores={false}
        store={catalogEntityStore}
        getItems={() => catalogEntityStore.entities.get()}
        customizeTableRowProps={entity => ({
          disabled: !entity.isEnabled(),
        })}
        {...getCategoryColumns({ activeCategory })}
        onDetails={this.onDetails}
        renderItemMenu={this.renderItemMenu}
      />
    );
  }

  render() {
    if (!this.props.catalogEntityStore) {
      return null;
    }

    const activeCategory = this.props.catalogEntityStore.activeCategory.get();
    const selectedItem = this.props.catalogEntityStore.selectedItem.get();

    return (
      <MainLayout
        sidebar={(
          <CatalogMenu
            activeTab={this.activeTab}
            onItemClick={this.onTabChange}
          />
        )}
      >
        <div className={styles.views}>
          {this.renderViews(activeCategory)}
        </div>
        {
          selectedItem
            ? (
              <CatalogEntityDetails
                entity={selectedItem}
                hideDetails={() => this.props.catalogEntityStore.selectedItemId.set(undefined)}
                onRun={() => this.props.catalogEntityStore.onRun(selectedItem)}
              />
            )
            : activeCategory
              ? (
                <RenderDelay>
                  <CatalogAddButton category={activeCategory} />
                </RenderDelay>
              )
              : null
        }
      </MainLayout>
    );
  }
}

export const Catalog = withInjectables<Dependencies>( NonInjectedCatalog, {
  getProps: (di) => ({
    catalogEntityStore: di.inject(catalogEntityStoreInjectable),
    catalogPreviousActiveTabStorage: di.inject(catalogPreviousActiveTabStorageInjectable),
    getCategoryColumns: di.inject(getCategoryColumnsInjectable),
    customCategoryViews: di.inject(customCategoryViewsInjectable),
    routeParameters: di.inject(catalogRouteParametersInjectable),
    navigateToCatalog: di.inject(navigateToCatalogInjectable),
    emitEvent: di.inject(appEventBusInjectable).emit,
    hotbarStore: di.inject(hotbarStoreInjectable),
    catalogCategoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    onContextMenuOpen: di.inject(onContextMenuOpenInjectable),
  }),
});
