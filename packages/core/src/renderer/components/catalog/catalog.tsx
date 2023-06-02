/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog.module.scss";

import type { IComputedValue } from "mobx";
import { action, computed, makeObservable, observable, reaction, runInAction, when } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import type { CatalogCategory, CatalogCategoryRegistry, CatalogEntity } from "../../../common/catalog";
import type { CatalogEntityContextMenu } from "../../api/catalog-entity";
import { ItemListLayout } from "../item-object-list";
import { MainLayout } from "../layout/main-layout";
import { MenuActions, MenuItem } from "../menu";
import type { ShowNotification } from "@k8slens/notifications";
import { RenderDelay } from "../render-delay/render-delay";
import { CatalogAddButton } from "./catalog-add-button";
import type { CatalogEntityStore } from "./catalog-entity-store.injectable";
import { CatalogMenu } from "./catalog-menu";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { EmitAppEvent } from "../../../common/app-event-bus/emit-event.injectable";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import type { VisitEntityContextMenu } from "../../../common/catalog/visit-entity-context-menu.injectable";
import visitEntityContextMenuInjectable from "../../../common/catalog/visit-entity-context-menu.injectable";
import type { NavigateToCatalog } from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import type { Logger } from "@k8slens/logger";
import { loggerInjectionToken } from "@k8slens/logger";
import type { NormalizeCatalogEntityContextMenu } from "../../catalog/normalize-menu-item.injectable";
import normalizeCatalogEntityContextMenuInjectable from "../../catalog/normalize-menu-item.injectable";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";
import type { StorageLayer } from "../../utils/storage-helper";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import { browseCatalogTab } from "./catalog-browse-tab";
import catalogEntityStoreInjectable from "./catalog-entity-store.injectable";
import catalogPreviousActiveTabStorageInjectable from "./catalog-previous-active-tab-storage/catalog-previous-active-tab-storage.injectable";
import catalogRouteParametersInjectable from "./catalog-route-parameters.injectable";
import type { CategoryColumns, GetCategoryColumnsParams } from "./columns/get.injectable";
import getCategoryColumnsInjectable from "./columns/get.injectable";
import type { CustomCategoryViewComponents } from "./custom-views";
import type { RegisteredCustomCategoryViewDecl } from "./custom-views.injectable";
import customCategoryViewsInjectable from "./custom-views.injectable";
import type { OnCatalogEntityListClick } from "./entity-details/on-catalog-click.injectable";
import onCatalogEntityListClickInjectable from "./entity-details/on-catalog-click.injectable";
import type { ShowEntityDetails } from "./entity-details/show.injectable";
import showEntityDetailsInjectable from "./entity-details/show.injectable";
import type { Hotbar } from "../../../features/hotbar/storage/common/hotbar";
import activeHotbarInjectable from "../../../features/hotbar/storage/common/active.injectable";

interface Dependencies {
  catalogPreviousActiveTabStorage: StorageLayer<string | null>;
  catalogEntityStore: CatalogEntityStore;
  getCategoryColumns: (params: GetCategoryColumnsParams) => CategoryColumns;
  customCategoryViews: IComputedValue<Map<string, Map<string, RegisteredCustomCategoryViewDecl>>>;
  emitEvent: EmitAppEvent;
  showEntityDetails: ShowEntityDetails;
  onCatalogEntityListClick: OnCatalogEntityListClick;
  routeParameters: {
    group: IComputedValue<string>;
    kind: IComputedValue<string>;
  };
  navigateToCatalog: NavigateToCatalog;
  catalogCategoryRegistry: CatalogCategoryRegistry;
  visitEntityContextMenu: VisitEntityContextMenu;
  navigate: Navigate;
  normalizeMenuItem: NormalizeCatalogEntityContextMenu;
  showErrorNotification: ShowNotification;
  logger: Logger;
  activeHotbar: IComputedValue<Hotbar | undefined>;
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
      reaction(() => [...catalogCategoryRegistry.filteredItems], (categories) => {
        const currentCategory = catalogEntityStore.activeCategory.get();
        const someCategory = categories[0];

        if (this.routeActiveTab === browseCatalogTab || !someCategory) {
          return;
        }

        const currentCategoryShouldBeShown = Boolean(categories.find(item => item.getId() === someCategory.getId()));

        if (!currentCategory || !currentCategoryShouldBeShown) {
          this.activeTab = someCategory.getId();
          this.props.catalogEntityStore.activeCategory.set(someCategory);
        }
      }),
    ]);

    this.props.emitEvent({
      name: "catalog",
      action: "open",
    });
  }

  addToHotbar(entity: CatalogEntity): void {
    this.props.activeHotbar.get()?.addEntity(entity);
  }

  removeFromHotbar(entity: CatalogEntity): void {
    this.props.activeHotbar.get()?.removeEntity(entity.getId());
  }

  onTabChange = action((tabId: string | null) => {
    const activeCategory = tabId
      ? this.props.catalogCategoryRegistry.getById(tabId)
      : undefined;

    this.props.emitEvent({
      name: "catalog",
      action: "change-category",
      params: {
        category: activeCategory?.getName() ?? "Browse",
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
          onClick={() => this.props.showEntityDetails(entity.getId())}
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
        onDetails={this.props.onCatalogEntityListClick}
        renderItemMenu={this.renderItemMenu}
        tableProps={{
          customRowHeights: () => 36, // Entity avatar size + padding
        }}
        data-testid={`catalog-list-for-${activeCategory?.metadata.name ?? "browse-all"}`}
      />
    );
  }

  render() {
    const activeCategory = this.props.catalogEntityStore.activeCategory.get();

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
          activeCategory
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
    activeHotbar: di.inject(activeHotbarInjectable),
    catalogCategoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    visitEntityContextMenu: di.inject(visitEntityContextMenuInjectable),
    navigate: di.inject(navigateInjectable),
    normalizeMenuItem: di.inject(normalizeCatalogEntityContextMenuInjectable),
    logger: di.inject(loggerInjectionToken),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    showEntityDetails: di.inject(showEntityDetailsInjectable),
    onCatalogEntityListClick: di.inject(onCatalogEntityListClickInjectable),
  }),
});
