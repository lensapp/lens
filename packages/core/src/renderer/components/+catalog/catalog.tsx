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
import { MenuItem, MenuActions } from "../menu";
import type { CatalogEntityContextMenu } from "../../api/catalog-entity";
import type { CatalogCategory, CatalogCategoryRegistry, CatalogEntity } from "../../../common/catalog";
import { CatalogAddButton } from "./catalog-add-button";
import type { ShowNotification } from "../notifications";
import { MainLayout } from "../layout/main-layout";
import type { StorageLayer } from "../../utils";
import { prevDefault } from "../../utils";
import { CatalogEntityDetails } from "./entity-details/view";
import { CatalogMenu } from "./catalog-menu";
import { RenderDelay } from "../render-delay/render-delay";
import { Icon } from "../icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import { Avatar } from "../avatar";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogPreviousActiveTabStorageInjectable from "./catalog-previous-active-tab-storage/catalog-previous-active-tab-storage.injectable";
import catalogEntityStoreInjectable from "./catalog-entity-store/catalog-entity-store.injectable";
import type { GetCategoryColumnsParams, CategoryColumns } from "./columns/get.injectable";
import getCategoryColumnsInjectable from "./columns/get.injectable";
import type { RegisteredCustomCategoryViewDecl } from "./custom-views.injectable";
import customCategoryViewsInjectable from "./custom-views.injectable";
import type { CustomCategoryViewComponents } from "./custom-views";
import type { NavigateToCatalog } from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import catalogRouteParametersInjectable from "./catalog-route-parameters.injectable";
import { browseCatalogTab } from "./catalog-browse-tab";
import hotbarStoreInjectable from "../../../common/hotbars/store.injectable";
import type { HotbarStore } from "../../../common/hotbars/store";
import type { VisitEntityContextMenu } from "../../../common/catalog/visit-entity-context-menu.injectable";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import visitEntityContextMenuInjectable from "../../../common/catalog/visit-entity-context-menu.injectable";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";
import type { NormalizeCatalogEntityContextMenu } from "../../catalog/normalize-menu-item.injectable";
import normalizeCatalogEntityContextMenuInjectable from "../../catalog/normalize-menu-item.injectable";
import type { EmitAppEvent } from "../../../common/app-event-bus/emit-event.injectable";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import type { Logger } from "../../../common/logger";
import loggerInjectable from "../../../common/logger.injectable";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";

interface Dependencies {
  catalogPreviousActiveTabStorage: StorageLayer<string | null>;
  catalogEntityStore: CatalogEntityStore;
  getCategoryColumns: (params: GetCategoryColumnsParams) => CategoryColumns;
  customCategoryViews: IComputedValue<Map<string, Map<string, RegisteredCustomCategoryViewDecl>>>;
  emitEvent: EmitAppEvent;
  routeParameters: {
    group: IComputedValue<string>;
    kind: IComputedValue<string>;
  };
  navigateToCatalog: NavigateToCatalog;
  hotbarStore: HotbarStore;
  catalogCategoryRegistry: CatalogCategoryRegistry;
  visitEntityContextMenu: VisitEntityContextMenu;
  navigate: Navigate;
  normalizeMenuItem: NormalizeCatalogEntityContextMenu;
  showErrorNotification: ShowNotification;
  logger: Logger;
}

@observer
class NonInjectedCatalog extends React.Component<Dependencies> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();
  @observable activeTab: string | undefined = undefined;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed
  get routeActiveTab(): string {
    const { routeParameters: { group, kind }, catalogPreviousActiveTabStorage } = this.props;

    const dereferencedGroup = group.get();
    const dereferencedKind = kind.get();

    if (dereferencedGroup && dereferencedKind) {
      return `${dereferencedGroup}/${dereferencedKind}`;
    }

    return catalogPreviousActiveTabStorage.get() || browseCatalogTab;
  }

  async componentDidMount() {
    const {
      catalogEntityStore,
      catalogPreviousActiveTabStorage,
      catalogCategoryRegistry,
      logger,
      showErrorNotification,
    } = this.props;

    disposeOnUnmount(this, [
      catalogEntityStore.watch(),
      reaction(() => this.routeActiveTab, async (routeTab) => {
        catalogPreviousActiveTabStorage.set(this.routeActiveTab);

        try {
          if (routeTab !== browseCatalogTab) {
            // we need to wait because extensions might take a while to load
            await when(() => Boolean(catalogCategoryRegistry.filteredItems.find(i => i.getId() === routeTab)), { timeout: 5_000 });
          }

          const item = catalogCategoryRegistry.filteredItems.find(i => i.getId() === routeTab);

          runInAction(() => {
            this.activeTab = routeTab;
            catalogEntityStore.activeCategory.set(item);
          });
        } catch (error) {
          logger.warn("Failed to find route tab", error);
          showErrorNotification((
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
    if (this.props.catalogEntityStore.selectedItemId.get()) {
      this.props.catalogEntityStore.selectedItemId.set(undefined);
    } else {
      this.props.catalogEntityStore.onRun(entity);
    }
  };

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
      this.props.visitEntityContextMenu(entity, {
        menuItems: this.menuItems,
        navigate: this.props.navigate,
      });
    };

    return (
      <MenuActions
        id={`menu-actions-for-catalog-for-${entity.getId()}`}
        data-testid={`menu-actions-for-catalog-for-${entity.getId()}`}
        onOpen={onOpen}
      >
        <MenuItem
          key="open-details"
          data-testid={`open-details-menu-item-for-${entity.getId()}`}
          onClick={() => this.props.catalogEntityStore.selectedItemId.set(entity.getId())}
        >
          View Details
        </MenuItem>
        {
          this.menuItems
            .map(this.props.normalizeMenuItem)
            .map((menuItem, index) => (
              <MenuItem key={index} onClick={menuItem.onClick}>
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
      return this.renderList(undefined);
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
        data-testid={`catalog-list-for-${activeCategory?.metadata.name ?? "browse-all"}`}
      />
    );
  }

  render() {
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

export const Catalog = withInjectables<Dependencies>(NonInjectedCatalog, {
  getProps: (di, props) => ({
    ...props,
    catalogEntityStore: di.inject(catalogEntityStoreInjectable),
    catalogPreviousActiveTabStorage: di.inject(catalogPreviousActiveTabStorageInjectable),
    getCategoryColumns: di.inject(getCategoryColumnsInjectable),
    customCategoryViews: di.inject(customCategoryViewsInjectable),
    routeParameters: di.inject(catalogRouteParametersInjectable),
    navigateToCatalog: di.inject(navigateToCatalogInjectable),
    emitEvent: di.inject(emitAppEventInjectable),
    hotbarStore: di.inject(hotbarStoreInjectable),
    catalogCategoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    visitEntityContextMenu: di.inject(visitEntityContextMenuInjectable),
    navigate: di.inject(navigateInjectable),
    normalizeMenuItem: di.inject(normalizeCatalogEntityContextMenuInjectable),
    logger: di.inject(loggerInjectable),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
  }),
});
